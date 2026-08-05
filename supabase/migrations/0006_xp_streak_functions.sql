-- WordFlow · 0006 · منطق الـ XP والستريك على السيرفر
-- كل نقطة XP تمر من award_xp، وكل تغيير في user_stats يحدث عبر trigger.
-- لا توجد طريقة للعميل لتعديل هذه الأرقام مباشرة.
-- ---------------------------------------------------------------------------

-- ── مستوى المستخدم من إجمالي الـ XP ────────────────────────────────────────
create or replace function public.level_for_xp(p_xp bigint)
returns int language sql immutable as $$
  select greatest(1, floor(sqrt(greatest(p_xp, 0)::numeric / 50))::int + 1);
$$;

-- ── يوم المستخدم بتوقيته المحلي (حاسم للستريك في مصر والخليج) ──────────────
create or replace function public.user_local_date(p_user_id uuid, p_at timestamptz default now())
returns date
language sql
stable
security definer
set search_path = public
as $$
  select (p_at at time zone coalesce(
    (select timezone from public.profiles where id = p_user_id),
    'Africa/Cairo'
  ))::date;
$$;

-- ── تحديث النشاط اليومي + إعادة حساب الستريك ───────────────────────────────
create or replace function public.touch_daily_activity(
  p_user_id           uuid,
  p_xp                int default 0,
  p_minutes           int default 0,
  p_lines             int default 0,
  p_words             int default 0,
  p_stories           int default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today   date := public.user_local_date(p_user_id);
  v_last    date;
  v_streak  int;
  v_longest int;
begin
  insert into public.user_daily_activity as d
    (user_id, activity_date, xp_earned, minutes_spent, lines_typed, words_reviewed, stories_completed)
  values (p_user_id, v_today, greatest(p_xp,0), greatest(p_minutes,0), greatest(p_lines,0),
          greatest(p_words,0), greatest(p_stories,0))
  on conflict (user_id, activity_date) do update
    set xp_earned         = d.xp_earned + greatest(p_xp,0),
        minutes_spent     = d.minutes_spent + greatest(p_minutes,0),
        lines_typed       = d.lines_typed + greatest(p_lines,0),
        words_reviewed    = d.words_reviewed + greatest(p_words,0),
        stories_completed = d.stories_completed + greatest(p_stories,0),
        updated_at        = now();

  select last_active_date, streak_count, longest_streak
    into v_last, v_streak, v_longest
    from public.user_stats where user_id = p_user_id for update;

  if v_last is null then
    v_streak := 1;
  elsif v_last = v_today then
    v_streak := greatest(coalesce(v_streak, 1), 1);          -- نفس اليوم: ثبات
  elsif v_last = v_today - 1 then
    v_streak := coalesce(v_streak, 0) + 1;                   -- اليوم التالي: +1
  else
    v_streak := 1;                                           -- فجوة: إعادة
  end if;

  update public.user_stats
     set streak_count     = v_streak,
         longest_streak   = greatest(coalesce(v_longest, 0), v_streak),
         last_active_date = v_today,
         updated_at       = now()
   where user_id = p_user_id;
end;
$$;

-- ── trigger: كل صف في xp_events يحدّث المجاميع في نفس المعاملة ─────────────
create or replace function public.apply_xp_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_stats (user_id) values (new.user_id)
  on conflict (user_id) do nothing;

  update public.user_stats
     set xp_total   = greatest(xp_total + new.amount, 0),
         level      = public.level_for_xp(greatest(xp_total + new.amount, 0)),
         updated_at = now()
   where user_id = new.user_id;

  perform public.touch_daily_activity(new.user_id, greatest(new.amount, 0));
  return new;
end;
$$;

drop trigger if exists apply_xp_event on public.xp_events;
create trigger apply_xp_event after insert on public.xp_events
  for each row execute function public.apply_xp_event();

-- ── منح XP بشكل ذرّي ومحصّن ضد التكرار ─────────────────────────────────────
create or replace function public.award_xp(
  p_user_id         uuid,
  p_source_type     xp_source,
  p_source_id       uuid,
  p_amount          int,
  p_idempotency_key text
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare v_total bigint;
begin
  if p_amount <> 0 then
    insert into public.xp_events (user_id, source_type, source_id, amount, idempotency_key)
    values (p_user_id, p_source_type, p_source_id, p_amount, p_idempotency_key)
    on conflict (idempotency_key) do nothing;   -- الضغط المزدوج لا يمنح مكافأة مرتين
  end if;

  select xp_total into v_total from public.user_stats where user_id = p_user_id;
  return coalesce(v_total, 0);
end;
$$;

-- ── تسجيل محاولة سطر مع حواجز المعقولية ────────────────────────────────────
create or replace function public.record_line_attempt(
  p_user_id  uuid,
  p_line_id  uuid,
  p_wpm      numeric,
  p_accuracy numeric,
  p_correct  int,
  p_incorrect int,
  p_seconds  numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_line      public.story_lines%rowtype;
  v_total     int := greatest(p_correct, 0) + greatest(p_incorrect, 0);
  v_max_wpm   int := public.setting_int('rules.max_wpm', 220);
  v_min_acc   int := public.setting_int('rules.min_accuracy', 90);
  v_line_xp   int := public.setting_int('xp.line_completed', 5);
  v_reason    text;
  v_xp        int := 0;
  v_total_xp  bigint;
begin
  select * into v_line from public.story_lines where id = p_line_id;
  if not found then
    raise exception 'line_not_found';
  end if;

  -- حواجز المعقولية: سرعة خارقة، زمن أقل من الحد الفيزيائي، أو طول لا يطابق السطر
  if p_wpm > v_max_wpm then
    v_reason := 'wpm_above_limit';
  elsif p_seconds < (v_line.char_count::numeric / 25.0) then
    v_reason := 'time_below_physical_minimum';
  elsif v_total > v_line.char_count * 2 or v_total < floor(v_line.char_count * 0.5) then
    v_reason := 'char_count_mismatch';
  end if;

  insert into public.user_line_attempts
    (user_id, story_id, line_id, wpm, accuracy, correct_chars, incorrect_chars,
     total_chars, time_spent_seconds, rejected, rejection_reason)
  values
    (p_user_id, v_line.story_id, p_line_id, p_wpm, p_accuracy, greatest(p_correct,0),
     greatest(p_incorrect,0), v_total, greatest(p_seconds, 0.01),
     v_reason is not null, v_reason);

  if v_reason is not null then
    return jsonb_build_object('accepted', false, 'reason', v_reason, 'xp_awarded', 0);
  end if;

  insert into public.user_story_progress as sp
    (user_id, story_id, status, current_line_index, lines_completed,
     best_accuracy, best_wpm, time_spent_seconds, started_at)
  values
    (p_user_id, v_line.story_id, 'in_progress', v_line.line_index + 1, 1,
     p_accuracy, p_wpm, ceil(p_seconds)::int, now())
  on conflict (user_id, story_id) do update
    set status             = case when sp.status = 'completed' then 'completed' else 'in_progress' end,
        current_line_index = greatest(sp.current_line_index, v_line.line_index + 1),
        lines_completed    = sp.lines_completed + 1,
        best_accuracy      = greatest(coalesce(sp.best_accuracy, 0), p_accuracy),
        best_wpm           = greatest(coalesce(sp.best_wpm, 0), p_wpm),
        time_spent_seconds = sp.time_spent_seconds + ceil(p_seconds)::int,
        started_at         = coalesce(sp.started_at, now()),
        updated_at         = now();

  update public.user_stats
     set total_time_seconds = total_time_seconds + ceil(p_seconds)::int
   where user_id = p_user_id;

  perform public.touch_daily_activity(
    p_user_id, 0, greatest(round(p_seconds / 60)::int, 0), 1, 0, 0
  );

  if p_accuracy >= v_min_acc then
    v_xp := v_line_xp;
    v_total_xp := public.award_xp(
      p_user_id, 'line', p_line_id, v_xp,
      'line:' || p_user_id::text || ':' || p_line_id::text
    );
  else
    select xp_total into v_total_xp from public.user_stats where user_id = p_user_id;
  end if;

  return jsonb_build_object(
    'accepted', true, 'xp_awarded', v_xp, 'xp_total', coalesce(v_total_xp, 0)
  );
end;
$$;

-- ── إكمال قصة (منح المكافأة مرة واحدة فقط) ─────────────────────────────────
create or replace function public.complete_story(p_user_id uuid, p_story_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_story public.stories%rowtype;
  v_was_completed boolean;
  v_total bigint;
begin
  select * into v_story from public.stories where id = p_story_id and is_published;
  if not found then raise exception 'story_not_found'; end if;

  select status = 'completed' into v_was_completed
    from public.user_story_progress where user_id = p_user_id and story_id = p_story_id;

  insert into public.user_story_progress as sp
    (user_id, story_id, status, xp_earned, started_at, completed_at)
  values (p_user_id, p_story_id, 'completed', v_story.xp_reward, now(), now())
  on conflict (user_id, story_id) do update
    set status       = 'completed',
        xp_earned    = greatest(sp.xp_earned, v_story.xp_reward),
        completed_at = coalesce(sp.completed_at, now()),
        updated_at   = now();

  if coalesce(v_was_completed, false) is false then
    perform public.touch_daily_activity(p_user_id, 0, 0, 0, 0, 1);
    update public.user_stats
       set stories_completed_count = (
             select count(*) from public.user_story_progress
             where user_id = p_user_id and status = 'completed')
     where user_id = p_user_id;
  end if;

  v_total := public.award_xp(
    p_user_id, 'story', p_story_id, v_story.xp_reward,
    'story:' || p_user_id::text || ':' || p_story_id::text
  );

  return jsonb_build_object(
    'xp_total', v_total,
    'xp_awarded', case when coalesce(v_was_completed,false) then 0 else v_story.xp_reward end
  );
end;
$$;

-- ── مراجعة/تعلّم كلمة ──────────────────────────────────────────────────────
create or replace function public.record_word_review(
  p_user_id uuid,
  p_word_id uuid,
  p_correct boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status word_status;
  v_new_status word_status;
  v_xp int := 0;
  v_total bigint;
begin
  insert into public.user_word_progress as w (user_id, word_id, status)
  values (p_user_id, p_word_id, 'learning')
  on conflict (user_id, word_id) do nothing;

  select status into v_status from public.user_word_progress
   where user_id = p_user_id and word_id = p_word_id;

  update public.user_word_progress as w
     set correct_count    = w.correct_count + (case when p_correct then 1 else 0 end),
         incorrect_count  = w.incorrect_count + (case when p_correct then 0 else 1 end),
         repetitions      = case when p_correct then w.repetitions + 1 else 0 end,
         last_reviewed_at = now(),
         -- منطق فاصل بسيط الآن؛ الأعمدة جاهزة لـ FSRS لاحقاً بلا migration
         interval_days    = case when p_correct then least(greatest(w.interval_days,1) * 2, 180) else 1 end,
         next_review_at   = now() + make_interval(days =>
                              case when p_correct then least(greatest(w.interval_days,1) * 2, 180) else 1 end),
         status           = case
                              when p_correct and w.correct_count + 1 >= 3 then 'learned'::word_status
                              when w.status = 'learned' and not p_correct then 'learning'::word_status
                              else greatest(w.status, 'learning'::word_status)
                            end,
         updated_at       = now()
   where w.user_id = p_user_id and w.word_id = p_word_id
   returning w.status into v_new_status;

  if v_new_status = 'learned' and v_status is distinct from 'learned' then
    v_xp := public.setting_int('xp.word_learned', 2);
    v_total := public.award_xp(
      p_user_id, 'word', p_word_id, v_xp,
      'word:' || p_user_id::text || ':' || p_word_id::text
    );
    update public.user_stats
       set words_learned_count = (
             select count(*) from public.user_word_progress
             where user_id = p_user_id and status = 'learned')
     where user_id = p_user_id;
  else
    select xp_total into v_total from public.user_stats where user_id = p_user_id;
  end if;

  perform public.touch_daily_activity(p_user_id, 0, 0, 0, 1, 0);

  return jsonb_build_object('status', v_new_status, 'xp_awarded', v_xp, 'xp_total', coalesce(v_total,0));
end;
$$;

-- ── مكافأة الستريك اليومي (مرة واحدة لكل يوم محلي) ─────────────────────────
create or replace function public.claim_daily_streak(p_user_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare v_today date := public.user_local_date(p_user_id);
begin
  return public.award_xp(
    p_user_id, 'streak', null, public.setting_int('xp.daily_streak', 10),
    'streak:' || p_user_id::text || ':' || v_today::text
  );
end;
$$;

-- الدوال الحساسة لا تُستدعى من العميل مباشرة — فقط من Server Actions
revoke all on function public.award_xp(uuid, xp_source, uuid, int, text) from public, anon, authenticated;
revoke all on function public.touch_daily_activity(uuid,int,int,int,int,int) from public, anon, authenticated;
revoke all on function public.record_line_attempt(uuid,uuid,numeric,numeric,int,int,numeric) from public, anon, authenticated;
revoke all on function public.complete_story(uuid,uuid) from public, anon, authenticated;
revoke all on function public.record_word_review(uuid,uuid,boolean) from public, anon, authenticated;
revoke all on function public.claim_daily_streak(uuid) from public, anon, authenticated;
