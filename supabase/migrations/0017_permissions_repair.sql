-- WordFlow · 0017 · إصلاح الصلاحيات + علاقات PostgREST
-- ---------------------------------------------------------------------------
-- هذه الميجريشن تصلح ثلاث مشاكل حقيقية ظهرت في اللوج:
--
--   1) permission denied for function check_rate_limit
--      0005 و 0006 و 0016 عملوا `revoke all on function ... from public, anon,
--      authenticated` بدون أي `grant execute` بعدها. لمّا تسحب الصلاحية من
--      PUBLIC، الـ service_role كمان بيفقدها (هو كان بياخدها بالوراثة من
--      PUBLIC فقط). النتيجة: كل RPC من الـ Server Actions بيرجع 42501،
--      فلا XP ولا محاولات أسطر ولا مراجعة كلمات بتتسجّل.
--
--   2) permission denied for table user_word_progress (42501)
--      0007 فعّل RLS على كل الجداول وكتب السياسات، لكن ما فيش ولا
--      `grant select` واحد لدور authenticated. RLS بيفلتر الصفوف، لكن
--      GRANT هو اللي بيسمح بالوصول للجدول أصلاً — الاتنين مطلوبين.
--      (user_story_positions هو الجدول الوحيد اللي اشتغل، لأن 0010 عمله grant.)
--
--   3) PGRST200 — Could not find a relationship between 'story_versions'
--      and 'created_by'
--      story_versions.created_by يشير إلى auth.users(id)، و PostgREST لا يرى
--      مسارًا منه إلى public.profiles، فالـ embed `profiles:created_by(...)`
--      يفشل. الحل: نحوّل المفتاح ليشير إلى public.profiles(id) — وهو نفس
--      المعرّف (profiles.id هو نفسه auth.users.id) فلا تتغير أي دلالة.
--
-- الميجريشن idempotent ويمكن تشغيلها أكثر من مرة بأمان.
-- ---------------------------------------------------------------------------

begin;

-- ═══ 1 · صلاحيات المخطط ════════════════════════════════════════════════════

grant usage on schema public to authenticated, service_role;

-- ═══ 2 · صلاحيات الجداول لدور authenticated ════════════════════════════════
-- ملاحظة: RLS ما زال مفعّلًا وسياسات 0007 هي اللي بتحدد الصفوف المرئية.
-- الـ GRANT هنا بيفتح الجدول فقط، مش بيتجاوز السياسات.

-- (أ) جداول المحتوى — قراءة فقط
grant select on table
  public.courses,
  public.stories,
  public.story_lines,
  public.vocabulary_categories,
  public.words,
  public.category_words,
  public.story_line_words,
  public.challenges
to authenticated;

-- (ب) جداول يملكها المستخدم — قراءة وكتابة (السياسات تقيّدها بـ auth.uid())
grant select, insert, update on table
  public.profiles,
  public.user_preferences
to authenticated;

grant select, insert on table public.placement_tests to authenticated;

-- (ج) جداول التقدّم — قراءة فقط، والكتابة حصرًا عبر دوال SECURITY DEFINER
grant select on table
  public.user_stats,
  public.xp_events,
  public.user_story_progress,
  public.user_line_attempts,
  public.user_word_progress,
  public.user_daily_activity,
  public.user_challenge_progress
to authenticated;

-- (د) جداول استوديو الإدارة الظاهرة للقارئ العادي
do $$
begin
  if to_regclass('public.categories') is not null then
    execute 'grant select on table public.categories to authenticated';
  end if;
  if to_regclass('public.story_media') is not null then
    execute 'grant select on table public.story_media to authenticated';
  end if;
end $$;

-- (هـ) service_role يحتاج كل شيء (السكربتات و Server Actions)
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all routines  in schema public to service_role;

-- (و) anon يظل مقفولًا بالكامل — نعيد التأكيد كما في 0007
revoke all on all tables in schema public from anon;

-- (ز) أي جدول جديد لاحقًا يرث نفس النمط
alter default privileges in schema public
  grant select on tables to authenticated;
alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant all on sequences to service_role;

-- ═══ 3 · إعادة منح EXECUTE للدوال المسحوبة ════════════════════════════════
-- الدوال دي كلها SECURITY DEFINER وبتاخد p_user_id كوسيط، يعني لازم تفضل
-- ممنوعة على authenticated (وإلا يقدر أي مستخدم يمرّر id مستخدم تاني).
-- بتتنادى من Server Actions بمفتاح الخدمة فقط ⇒ service_role وبس.

do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as sig
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname in (
         'check_rate_limit',
         'award_xp',
         'touch_daily_activity',
         'record_line_attempt',
         'complete_story',
         'claim_daily_streak',
         'record_word_review',
         'ensure_word',
         'ensure_story',
         'ensure_story_line',
         'record_word_review_by_text',
         'record_line_attempt_by_slug',
         'complete_story_by_slug',
         'next_story_version',
         'admin_overview_stats',
         'user_local_date',
         'sync_onboarding_claim',
         'handle_new_user'
       )
  loop
    execute format('grant execute on function %s to service_role', fn.sig);
  end loop;
end $$;

-- الدوال اللي المفروض العميل نفسه ينفّذها
do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as sig
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname in (
         'is_admin',
         'level_for_xp',
         'upsert_story_position',
         'bump_story_views'
       )
  loop
    execute format('grant execute on function %s to authenticated, service_role', fn.sig);
  end loop;
end $$;

-- ═══ 4 · إصلاح علاقات PostgREST (PGRST200) ════════════════════════════════
-- profiles.id هو نفسه auth.users.id (PK + FK بـ on delete cascade)، فتحويل
-- المفاتيح دي إلى profiles لا يغيّر أي دلالة، لكنه يعطي PostgREST المسار
-- اللازم للـ embed المستخدم في listStoryVersions و listActivity.

-- نظّف أي قيمة يتيمة قبل إضافة القيد (مثلاً مستخدم اتمسح profile بتاعه)
do $$
begin
  if to_regclass('public.story_versions') is not null then
    update public.story_versions v
       set created_by = null
     where v.created_by is not null
       and not exists (select 1 from public.profiles p where p.id = v.created_by);
  end if;

  if to_regclass('public.admin_activity') is not null then
    update public.admin_activity a
       set actor_id = null
     where a.actor_id is not null
       and not exists (select 1 from public.profiles p where p.id = a.actor_id);
  end if;

  if to_regclass('public.story_media') is not null then
    update public.story_media m
       set created_by = null
     where m.created_by is not null
       and not exists (select 1 from public.profiles p where p.id = m.created_by);
  end if;
end $$;

-- احذف المفاتيح القديمة المتجهة إلى auth.users على الأعمدة الثلاثة
do $$
declare
  c record;
begin
  for c in
    select con.conrelid::regclass::text as tbl,
           con.conname                  as name
      from pg_constraint con
     where con.contype = 'f'
       and con.confrelid = 'auth.users'::regclass
       and con.conrelid in (
         coalesce(to_regclass('public.story_versions'), 0),
         coalesce(to_regclass('public.admin_activity'), 0),
         coalesce(to_regclass('public.story_media'),    0)
       )
  loop
    execute format('alter table %s drop constraint %I', c.tbl, c.name);
  end loop;
end $$;

-- وأضف بدلها مفاتيح متجهة إلى profiles بأسماء صريحة
do $$
begin
  if to_regclass('public.story_versions') is not null
     and not exists (
       select 1 from pg_constraint
        where conname = 'story_versions_created_by_profiles_fkey'
     )
  then
    alter table public.story_versions
      add constraint story_versions_created_by_profiles_fkey
      foreign key (created_by) references public.profiles (id) on delete set null;
  end if;

  if to_regclass('public.admin_activity') is not null
     and not exists (
       select 1 from pg_constraint
        where conname = 'admin_activity_actor_id_profiles_fkey'
     )
  then
    alter table public.admin_activity
      add constraint admin_activity_actor_id_profiles_fkey
      foreign key (actor_id) references public.profiles (id) on delete set null;
  end if;

  if to_regclass('public.story_media') is not null
     and not exists (
       select 1 from pg_constraint
        where conname = 'story_media_created_by_profiles_fkey'
     )
  then
    alter table public.story_media
      add constraint story_media_created_by_profiles_fkey
      foreign key (created_by) references public.profiles (id) on delete set null;
  end if;
end $$;

-- ═══ 5 · سياسات كتابة كانت ناقصة ══════════════════════════════════════════
-- user_word_progress كان عنده سياسة SELECT فقط. الكتابة تمر عبر
-- record_word_review (SECURITY DEFINER) فلا نحتاج سياسة INSERT للعميل،
-- لكن نضيف فهرسًا للقراءة المتكررة في شاشة المفردات.

create index if not exists user_word_progress_user_next_review_idx
  on public.user_word_progress (user_id, next_review_at);

create index if not exists user_line_attempts_user_created_idx
  on public.user_line_attempts (user_id, created_at desc);

commit;

-- ═══ 6 · أعِد تحميل كاش المخطط في PostgREST ═══════════════════════════════
-- بدون ده هتفضل تشوف PGRST200 لحد ما الـ API يعيد التشغيل.
notify pgrst, 'reload schema';
