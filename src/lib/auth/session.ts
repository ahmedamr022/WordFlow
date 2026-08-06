import "server-only";

import { cache } from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { CefrLevel } from "@/types/database";

/**
 * THE single definition of "who is this and are they onboarded".
 *
 * Before: three competing definitions —
 *   · middleware read a JWT claim (app_metadata.onboarding_completed) that is
 *     only ever written by a DB trigger on a transition almost no row makes;
 *   · the login page checked four nullable profile columns in the browser;
 *   · /auth/callback checked profiles.onboarding_completed_at.
 * They disagreed, so every logged-in user was bounced to /onboarding/nickname.
 *
 * After: profiles.onboarding_completed_at, read on the server, once.
 *
 * `cache()` dedupes across the whole React render pass, so a layout + page +
 * nested shell all reading this issue ONE auth call and ONE profile query.
 */

export type OnboardingProfile = {
  nickname: string | null;
  country: string | null;
  native_language: string | null;
  english_level: CefrLevel | null;
  onboarding_completed_at: string | null;
};

export type SessionContext = {
  user: User | null;
  profile: OnboardingProfile | null;
  isOnboarded: boolean;
};

/** Ordered onboarding funnel. Order here IS the product order. */
export const ONBOARDING_STEPS = [
"/onboarding/nickname",
"/onboarding/language",
"/onboarding/country",
"/onboarding/level"] as
const;

export const ONBOARDING_ENTRY = ONBOARDING_STEPS[0];

const EMPTY: SessionContext = { user: null, profile: null, isOnboarded: false };

export const getSessionContext = cache(async (): Promise<SessionContext> => {
  const supabase = await createClient();

  // getUser() validates the token against Supabase. Never trust getSession()
  // for authorization — it only decodes a cookie.
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) return EMPTY;

  const { data } = await supabase.
  from("profiles").
  select("nickname, country, native_language, english_level, onboarding_completed_at").
  eq("id", user.id).
  maybeSingle();

  const profile: OnboardingProfile | null = data ?
  {
    nickname: data.nickname as string | null ?? null,
    country: data.country as string | null ?? null,
    native_language: data.native_language as string | null ?? null,
    english_level: data.english_level as CefrLevel | null ?? null,
    onboarding_completed_at: data.onboarding_completed_at as string | null ?? null
  } :
  null;

  return {
    user,
    profile,
    isOnboarded: Boolean(profile?.onboarding_completed_at)
  };
});

/**
 * Resume the funnel at the first unanswered question instead of always
 * restarting at step 1.
 */
export function nextOnboardingStep(profile: OnboardingProfile | null): string {
  if (!profile) return ONBOARDING_STEPS[0];
  if (!profile.nickname) return ONBOARDING_STEPS[0];
  if (!profile.native_language) return ONBOARDING_STEPS[1];
  if (!profile.country) return ONBOARDING_STEPS[2];
  return ONBOARDING_STEPS[3];
}

/** Only internal, non-protocol-relative paths may be used as redirect targets. */
export function safeInternalPath(
value: string | null | undefined,
fallback = "/dashboard")
: string {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  if (value.includes("\\")) return fallback;
  return value;
}