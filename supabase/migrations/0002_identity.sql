-- WordFlow · 0002 · الهوية والحساب
-- profiles (توسيع) · user_preferences · placement_tests
-- + trigger on_auth_user_created الذي يفكّ انسداد تسجيل الدخول بـ OAuth
-- ---------------------------------------------------------------------------

-- ── profiles ───────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade
);

alter table public.profiles
  add column if not exists nickname              text,
  add column if not exists country               text,
  add column if not exists native_language       text default 'ar',
  add column if not exists english_level         cefr_level,
  add column if not exists avatar_url            text,
  add column if not exists interface_language    text not null default 'ar',
  add column if not exists timezone              text not null default 'Africa/Cairo',
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists last_seen_at          timestamptz,
  add column if not exists created_at            timestamptz not null default now(),
  add column if not exists updated_at            timestamptz not null default now();

alter table public.profiles
  add constraint profiles_nickname_len check (nickname is null or char_length(nickname) between 2 and 50)
  not valid;

select public.attach_updated_at('profiles');

-- منع تعديل المفتاح الأساسي من أي مسار
create or replace function public.profiles_lock_id()
returns trigger language plpgsql as $$
begin
  if new.id is distinct from old.id then
    raise exception 'profiles.id is immutable';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_lock_id on public.profiles;
create trigger profiles_lock_id before update on public.profiles
  for each row execute function public.profiles_lock_id();

-- ── user_preferences ───────────────────────────────────────────────────────
create table if not exists public.user_preferences (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  voice_id            text,
  playback_speed      numeric(3,2) not null default 1.00 check (playback_speed between 0.50 and 2.00),
  daily_goal_xp       int not null default 50 check (daily_goal_xp between 10 and 1000),
  sound_enabled       boolean not null default true,
  theme               text not null default 'system' check (theme in ('light','dark','system')),
  email_notifications boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
select public.attach_updated_at('user_preferences');

-- ── placement_tests ────────────────────────────────────────────────────────
create table if not exists public.placement_tests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  answers         jsonb not null default '[]'::jsonb,
  score           int   not null default 0 check (score >= 0),
  resulting_level cefr_level not null,
  taken_at        timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists placement_tests_user_idx on public.placement_tests(user_id, taken_at desc);
select public.attach_updated_at('placement_tests');

-- ── إنشاء المستخدم تلقائياً (email/password + OAuth على حد سواء) ───────────
-- المشكلة الحالية: /auth/callback يعمل signOut لأي مستخدم OAuth لا يملك صف
-- profiles. الحل المعماري: نضمن وجود الصف لحظة إنشاء الحساب في auth.users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'nickname',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, 'learner'), '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id, daily_goal_xp)
  values (new.id, public.setting_int('rules.default_daily_goal', 50))
  on conflict (user_id) do nothing;

  insert into public.user_stats (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- ملاحظة: الـ trigger نفسه يُركَّب في 0004 بعد إنشاء user_stats.

-- ── مزامنة علم الـ onboarding مع app_metadata ──────────────────────────────
-- بيخلّي middleware يقرأ الحالة من الـ JWT مباشرة بدل استعلام على كل طلب.
create or replace function public.sync_onboarding_claim()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.onboarding_completed_at is not null
     and (old.onboarding_completed_at is null) then
    update auth.users
       set raw_app_meta_data =
           coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('onboarding_completed', true)
     where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_onboarding_claim on public.profiles;
create trigger sync_onboarding_claim after update on public.profiles
  for each row execute function public.sync_onboarding_claim();
