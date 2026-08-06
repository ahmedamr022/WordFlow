-- WordFlow · 0008 · onboarding is one flag, and it is backfilled
-- ---------------------------------------------------------------------------
-- NOTE: the audit document numbered this migration 0006, but 0006 and 0007
-- already exist in this repo (0006_xp_streak_functions.sql,
-- 0007_rls_policies.sql). It is renumbered to 0008 so `supabase db push`
-- applies it in the correct order.
--
-- Root cause this migration closes:
--   Routing used to depend on auth.users.raw_app_meta_data ->> 'onboarding_completed',
--   a claim written ONLY by sync_onboarding_claim(), which fires ONLY when
--   profiles.onboarding_completed_at transitions NULL -> NOT NULL, which is
--   written ONLY by completeOnboardingAction. Every account created before
--   that action existed therefore read as "never onboarded" forever and was
--   redirected to /onboarding/nickname on every protected route.
--
--   The application now reads profiles.onboarding_completed_at directly, so
--   the claim is advisory only. This migration backfills the column for users
--   who demonstrably already finished onboarding.
-- ---------------------------------------------------------------------------

-- 1) Backfill: anyone with a nickname AND a chosen level has finished.
update public.profiles p
   set onboarding_completed_at = coalesce(p.created_at, now())
 where p.onboarding_completed_at is null
   and p.nickname is not null
   and btrim(p.nickname) <> ''
   and p.english_level is not null;

-- 2) Anyone who ever took a placement test has finished.
update public.profiles p
   set onboarding_completed_at = coalesce(t.taken_at, p.created_at, now())
  from (
    select user_id, min(taken_at) as taken_at
      from public.placement_tests
     group by user_id
  ) t
 where p.id = t.user_id
   and p.onboarding_completed_at is null
   and p.nickname is not null
   and btrim(p.nickname) <> '';

-- 3) The routing gate is a hot predicate — index it.
create index if not exists profiles_onboarding_completed_at_idx
  on public.profiles (id)
  where onboarding_completed_at is not null;

-- 4) Keep the JWT claim in sync in BOTH directions, and on INSERT too, so a
--    row seeded as already-complete does not get a stale claim.
create or replace function public.sync_onboarding_claim()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_completed boolean := new.onboarding_completed_at is not null;
begin
  if tg_op = 'UPDATE'
     and (old.onboarding_completed_at is not null) = v_completed then
    return new;
  end if;

  update auth.users
     set raw_app_meta_data =
         coalesce(raw_app_meta_data, '{}'::jsonb)
         || jsonb_build_object('onboarding_completed', v_completed)
   where id = new.id;

  return new;
end;
$$;

drop trigger if exists sync_onboarding_claim on public.profiles;

create trigger sync_onboarding_claim
  after insert or update of onboarding_completed_at on public.profiles
  for each row execute function public.sync_onboarding_claim();

-- 5) Re-sync the claim for every backfilled row.
update auth.users u
   set raw_app_meta_data =
       coalesce(u.raw_app_meta_data, '{}'::jsonb)
       || jsonb_build_object('onboarding_completed', p.onboarding_completed_at is not null)
  from public.profiles p
 where p.id = u.id;
