-- WordFlow · 0004 · تقدم المستخدم
-- user_story_progress · user_line_attempts · user_word_progress
-- user_daily_activity · user_stats · xp_events
-- الكتابة في كل ما هنا ممنوعة على العميل — تتم عبر دوال SECURITY DEFINER.
-- ---------------------------------------------------------------------------

create table if not exists public.user_stats (
  user_id                 uuid primary key references auth.users(id) on delete cascade,
  xp_total                bigint not null default 0 check (xp_total >= 0),
  level                   int    not null default 1 check (level >= 1),
  streak_count            int    not null default 0 check (streak_count >= 0),
  longest_streak          int    not null default 0 check (longest_streak >= 0),
  last_active_date        date,
  words_learned_count     int    not null default 0 check (words_learned_count >= 0),
  stories_completed_count int    not null default 0 check (stories_completed_count >= 0),
  total_time_seconds      bigint not null default 0 check (total_time_seconds >= 0),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
select public.attach_updated_at('user_stats');

-- الآن بعد وجود user_stats يمكن تركيب trigger إنشاء المستخدم من 0002
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- دفتر أستاذ الـ XP: كل نقطة في النظام لها سطر هنا
create table if not exists public.xp_events (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  source_type     xp_source not null,
  source_id       uuid,
  amount          int not null check (amount <> 0),
  idempotency_key text not null unique,
  created_at      timestamptz not null default now()
);
create index if not exists xp_events_user_idx on public.xp_events(user_id, created_at desc);

create table if not exists public.user_story_progress (
  user_id            uuid not null references auth.users(id) on delete cascade,
  story_id           uuid not null references public.stories(id) on delete cascade,
  status             story_status not null default 'not_started',
  current_line_index int not null default 0 check (current_line_index >= 0),
  lines_completed    int not null default 0 check (lines_completed >= 0),
  best_accuracy      numeric(5,2) check (best_accuracy between 0 and 100),
  best_wpm           numeric(6,2) check (best_wpm >= 0),
  time_spent_seconds int not null default 0 check (time_spent_seconds >= 0),
  xp_earned          int not null default 0 check (xp_earned >= 0),
  started_at         timestamptz,
  completed_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  primary key (user_id, story_id)
);
create index if not exists usp_user_status_idx on public.user_story_progress(user_id, status);
select public.attach_updated_at('user_story_progress');

-- سجل كل محاولة سطر: مصدر إحصائيات الدقة/السرعة وأساس كشف الغش
create table if not exists public.user_line_attempts (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  story_id           uuid not null references public.stories(id) on delete cascade,
  line_id            uuid not null references public.story_lines(id) on delete cascade,
  wpm                numeric(6,2) not null check (wpm >= 0),
  accuracy           numeric(5,2) not null check (accuracy between 0 and 100),
  correct_chars      int not null default 0 check (correct_chars >= 0),
  incorrect_chars    int not null default 0 check (incorrect_chars >= 0),
  total_chars        int not null default 0 check (total_chars >= 0),
  time_spent_seconds numeric(8,2) not null check (time_spent_seconds > 0),
  rejected           boolean not null default false,
  rejection_reason   text,
  created_at         timestamptz not null default now()
);
create index if not exists ula_user_idx  on public.user_line_attempts(user_id, created_at desc);
create index if not exists ula_line_idx  on public.user_line_attempts(line_id);

create table if not exists public.user_word_progress (
  user_id         uuid not null references auth.users(id) on delete cascade,
  word_id         uuid not null references public.words(id) on delete cascade,
  status          word_status not null default 'new',
  correct_count   int not null default 0 check (correct_count >= 0),
  incorrect_count int not null default 0 check (incorrect_count >= 0),
  last_reviewed_at timestamptz,
  -- أعمدة المراجعة المتباعدة: محجوزة الآن، تُفعَّل بمنطق لاحقاً بلا migration
  next_review_at  timestamptz,
  interval_days   int not null default 0 check (interval_days >= 0),
  ease_factor     numeric(4,2) not null default 2.50,
  repetitions     int not null default 0 check (repetitions >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  primary key (user_id, word_id)
);
create index if not exists uwp_due_idx on public.user_word_progress(user_id, next_review_at)
  where status <> 'learned';
select public.attach_updated_at('user_word_progress');

create table if not exists public.user_daily_activity (
  user_id           uuid not null references auth.users(id) on delete cascade,
  activity_date     date not null,
  xp_earned         int not null default 0 check (xp_earned >= 0),
  minutes_spent     int not null default 0 check (minutes_spent >= 0),
  lines_typed       int not null default 0 check (lines_typed >= 0),
  words_reviewed    int not null default 0 check (words_reviewed >= 0),
  stories_completed int not null default 0 check (stories_completed >= 0),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  primary key (user_id, activity_date)
);
create index if not exists uda_user_date_idx on public.user_daily_activity(user_id, activity_date desc);
select public.attach_updated_at('user_daily_activity');
