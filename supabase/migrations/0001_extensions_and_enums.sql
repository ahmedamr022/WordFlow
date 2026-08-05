-- WordFlow · 0001 · Extensions, enums, shared helpers
-- ---------------------------------------------------------------------------
-- كل ما هو مشترك بين باقي الـ migrations يعيش هنا: الامتدادات، الأنواع
-- المعدودة (enums)، ودالة تحديث updated_at المستخدمة في كل الجداول.
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "pg_trgm";       -- بحث ILIKE سريع على المفردات
create extension if not exists "citext";        -- مقارنات نصية غير حساسة لحالة الأحرف

-- ── Enums ──────────────────────────────────────────────────────────────────
do $$ begin
  create type cefr_level as enum ('A1','A2','B1','B2','C1','C2');
exception when duplicate_object then null; end $$;

do $$ begin
  create type story_status as enum ('not_started','in_progress','completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type word_status as enum ('new','learning','learned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type xp_source as enum ('line','story','word','challenge','streak','migration');
exception when duplicate_object then null; end $$;

do $$ begin
  create type challenge_type as enum ('xp','streak','accuracy','words','stories');
exception when duplicate_object then null; end $$;

do $$ begin
  create type challenge_period as enum ('daily','weekly');
exception when duplicate_object then null; end $$;

-- ── updated_at trigger ─────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- مساعد يركّب trigger التحديث على أي جدول بسطر واحد
create or replace function public.attach_updated_at(target_table text)
returns void
language plpgsql
as $$
begin
  execute format(
    'drop trigger if exists set_updated_at on public.%I;
     create trigger set_updated_at before update on public.%I
     for each row execute function public.set_updated_at();',
    target_table, target_table
  );
end;
$$;

-- ── جدول إعدادات عام (قيم الـ XP وغيرها تتعدّل بدون ديبلوي) ────────────────
create table if not exists public.app_settings (
  key         text primary key,
  value       jsonb not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
select public.attach_updated_at('app_settings');

insert into public.app_settings (key, value, description) values
  ('xp.line_completed',   '5'::jsonb,   'XP لسطر مكتمل بدقة ≥ 90%'),
  ('xp.word_learned',     '2'::jsonb,   'XP لكلمة تنتقل لحالة learned'),
  ('xp.daily_streak',     '10'::jsonb,  'مكافأة الستريك اليومي'),
  ('rules.min_accuracy',  '90'::jsonb,  'أقل دقة تمنح XP للسطر'),
  ('rules.max_wpm',       '220'::jsonb, 'حد المعقولية لسرعة الكتابة'),
  ('rules.default_daily_goal', '50'::jsonb, 'هدف XP اليومي الافتراضي')
on conflict (key) do nothing;

alter table public.app_settings enable row level security;
-- قراءة فقط للمستخدم المسجّل، الكتابة بـ service role حصراً
create policy app_settings_read on public.app_settings
  for select to authenticated using (true);

-- دالة قراءة رقمية مختصرة تُستخدم داخل دوال الـ XP
create or replace function public.setting_int(setting_key text, fallback int)
returns int
language sql
stable
as $$
  select coalesce((select (value #>> '{}')::int from public.app_settings where key = setting_key), fallback);
$$;
