import { redirect } from "next/navigation";

import { getSessionContext, nextOnboardingStep } from "@/lib/auth/session";

/**
 * /onboarding was a 404: only a layout existed, yet /auth/callback redirected
 * here. Now it is the funnel entry point and resumes at the first unanswered
 * step.
 */
export default async function OnboardingIndexPage() {
  const { profile } = await getSessionContext();
  redirect(nextOnboardingStep(profile));
}