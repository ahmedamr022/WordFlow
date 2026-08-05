-- WordFlow · 0005 · التحديات والتشغيل
-- challenges · user_challenge_progress · rate_limits · ai_usage_log
-- ---------------------------------------------------------------------------

create table if not exists public.challenges (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title_ar       text not null,
  description_ar text,
  type           challenge_type not null,
  target_value   int not null check (target_value > 0),
  period         challenge_period not null default 'daily',
  xp_reward      int not null default 20 check (xp_reward >= 0),
  starts_at      timestamptz not null default now(),
  ends_at        timestamptz,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists challenges_active_idx on public.challenges(is_active, period, starts_at desc);
select public.attach_updated_at('challenges');

create table if not exists public.user_challenge_progress (
  user_id          uuid not null references auth.users(id) on delete cascade,
  challenge_id     uuid not null references public.challenges(id) on delete cascade,
  current_value    int not null default 0 check (current_value >= 0),
  completed_at     timestamptz,
  reward_claimed_at timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  primary key (user_id, challenge_id)
);
select public.attach_updated_at('user_challenge_progress');

-- ── Rate limiting بدون بنية تحتية إضافية ───────────────────────────────────
create table if not exists public.rate_limits (
  key           text primary key,
  window_start  timestamptz not null default now(),
  request_count int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
select public.attach_updated_at('rate_limits');

-- ذرّية: INSERT ... ON CONFLICT DO UPDATE داخل معاملة واحدة
create or replace function public.check_rate_limit(
  p_key            text,
  p_limit          int,
  p_window_seconds int
)
returns table (allowed boolean, remaining int, retry_after_seconds int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.rate_limits%rowtype;
begin
  insert into public.rate_limits (key, window_start, request_count)
  values (p_key, now(), 1)
  on conflict (key) do update
    set request_count = case
          when public.rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
          then 1
          else public.rate_limits.request_count + 1
        end,
        window_start = case
          when public.rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
          then now()
          else public.rate_limits.window_start
        end,
        updated_at = now()
  returning * into v_row;

  return query
  select
    v_row.request_count <= p_limit,
    greatest(p_limit - v_row.request_count, 0),
    greatest(
      ceil(extract(epoch from (v_row.window_start + make_interval(secs => p_window_seconds) - now())))::int,
      0
    );
end;
$$;

revoke all on function public.check_rate_limit(text,int,int) from public, anon, authenticated;

-- تنظيف دوري (يُستدعى من cron job في Supabase)
create or replace function public.prune_rate_limits()
returns void language sql security definer set search_path = public as $$
  delete from public.rate_limits where window_start < now() - interval '1 day';
$$;

-- ── مراقبة استهلاك الذكاء الاصطناعي ────────────────────────────────────────
create table if not exists public.ai_usage_log (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete set null,
  route          text not null,
  prompt_tokens  int  not null default 0,
  output_tokens  int  not null default 0,
  cost_estimate  numeric(10,6) not null default 0,
  created_at     timestamptz not null default now()
);
create index if not exists ai_usage_user_idx on public.ai_usage_log(user_id, created_at desc);
create index if not exists ai_usage_route_idx on public.ai_usage_log(route, created_at desc);
