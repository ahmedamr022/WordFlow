-- WordFlow · اختبار عزل RLS
-- ---------------------------------------------------------------------------
-- خطوة تحقق إلزامية: يتصرف كمستخدم A ويحاول قراءة وتعديل بيانات مستخدم B
-- على كل جدول. لو أي محاولة نجحت، الـ migration لا يُدمج.
-- التشغيل: supabase db execute --file supabase/tests/rls_isolation.test.sql
-- ---------------------------------------------------------------------------

begin;

create or replace function pg_temp.as_user(p_uid uuid)
returns void language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims',
    json_build_object('sub', p_uid::text, 'role', 'authenticated')::text, true);
end;
$$;

create or replace function pg_temp.expect_denied(p_label text, p_sql text)
returns void language plpgsql as $$
begin
  begin
    execute p_sql;
    -- إن لم يُرفع خطأ، نتحقق أن التأثير كان صفراً
    if found then
      raise exception 'RLS FAIL [%]: العملية نجحت وكان يجب رفضها', p_label;
    end if;
    raise notice 'ok (no rows) · %', p_label;
  exception
    when insufficient_privilege or check_violation then
      raise notice 'ok (denied) · %', p_label;
  end;
end;
$$;

create or replace function pg_temp.expect_empty(p_label text, p_sql text)
returns void language plpgsql as $$
declare n int;
begin
  execute 'select count(*) from (' || p_sql || ') t' into n;
  if n <> 0 then
    raise exception 'RLS FAIL [%]: رجعت % صف من بيانات مستخدم آخر', p_label, n;
  end if;
  raise notice 'ok (empty) · %', p_label;
end;
$$;

-- ── تجهيز مستخدمين وهميين ─────────────────────────────────────────────────
do $$
declare a uuid := '11111111-1111-1111-1111-111111111111';
        b uuid := '22222222-2222-2222-2222-222222222222';
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (a, 'a@test.local', '{"nickname":"A"}'::jsonb),
         (b, 'b@test.local', '{"nickname":"B"}'::jsonb)
  on conflict (id) do nothing;

  -- بيانات لمستخدم B عبر الدوال الآمنة
  perform public.award_xp(b, 'migration', null, 500, 'test:seed:b');
end $$;

-- ── نتصرف كمستخدم A ───────────────────────────────────────────────────────
select pg_temp.as_user('11111111-1111-1111-1111-111111111111'::uuid);

-- 1) القراءة العابرة للمستخدمين يجب أن ترجع صفر صفوف
select pg_temp.expect_empty('user_stats',              $$select 1 from public.user_stats where user_id='22222222-2222-2222-2222-222222222222'$$);
select pg_temp.expect_empty('xp_events',               $$select 1 from public.xp_events where user_id='22222222-2222-2222-2222-222222222222'$$);
select pg_temp.expect_empty('profiles',                $$select 1 from public.profiles where id='22222222-2222-2222-2222-222222222222'$$);
select pg_temp.expect_empty('user_preferences',        $$select 1 from public.user_preferences where user_id='22222222-2222-2222-2222-222222222222'$$);
select pg_temp.expect_empty('placement_tests',         $$select 1 from public.placement_tests where user_id='22222222-2222-2222-2222-222222222222'$$);
select pg_temp.expect_empty('user_story_progress',     $$select 1 from public.user_story_progress where user_id='22222222-2222-2222-2222-222222222222'$$);
select pg_temp.expect_empty('user_line_attempts',      $$select 1 from public.user_line_attempts where user_id='22222222-2222-2222-2222-222222222222'$$);
select pg_temp.expect_empty('user_word_progress',      $$select 1 from public.user_word_progress where user_id='22222222-2222-2222-2222-222222222222'$$);
select pg_temp.expect_empty('user_daily_activity',     $$select 1 from public.user_daily_activity where user_id='22222222-2222-2222-2222-222222222222'$$);
select pg_temp.expect_empty('user_challenge_progress', $$select 1 from public.user_challenge_progress where user_id='22222222-2222-2222-2222-222222222222'$$);
select pg_temp.expect_empty('rate_limits',             $$select 1 from public.rate_limits$$);
select pg_temp.expect_empty('ai_usage_log',            $$select 1 from public.ai_usage_log$$);

-- 2) الكتابة في جداول التقدم مرفوضة حتى على بيانات المستخدم نفسه
select pg_temp.expect_denied('user_stats update self',
  $$update public.user_stats set xp_total = 999999 where user_id = '11111111-1111-1111-1111-111111111111'$$);
select pg_temp.expect_denied('xp_events insert self',
  $$insert into public.xp_events (user_id, source_type, amount, idempotency_key)
    values ('11111111-1111-1111-1111-111111111111','line',100000,'hack:1')$$);
select pg_temp.expect_denied('story_progress insert self',
  $$insert into public.user_story_progress (user_id, story_id) values
    ('11111111-1111-1111-1111-111111111111', gen_random_uuid())$$);
select pg_temp.expect_denied('word_progress insert self',
  $$insert into public.user_word_progress (user_id, word_id) values
    ('11111111-1111-1111-1111-111111111111', gen_random_uuid())$$);

-- 3) الكتابة في المحتوى مرفوضة
select pg_temp.expect_denied('stories insert',
  $$insert into public.stories (slug, title_en, title_ar) values ('hack','h','ه')$$);
select pg_temp.expect_denied('words update',
  $$update public.words set translation_ar = 'hacked'$$);
select pg_temp.expect_denied('app_settings update',
  $$update public.app_settings set value = '99999'::jsonb where key = 'xp.line_completed'$$);

-- 4) تعديل بروفايل مستخدم آخر مرفوض
select pg_temp.expect_denied('profiles update other',
  $$update public.profiles set nickname = 'pwned' where id = '22222222-2222-2222-2222-222222222222'$$);

-- 5) استدعاء دوال منح الـ XP مباشرة من العميل مرفوض
select pg_temp.expect_denied('award_xp direct call',
  $$select public.award_xp('11111111-1111-1111-1111-111111111111','line',null,100000,'hack:2')$$);

reset role;
rollback;
