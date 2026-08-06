import React from "react";
import { redirect } from "next/navigation";

import { getSessionContext } from "@/lib/auth/session";

/**
 * Guard for /onboarding/*.
 *
 * Mirrors ProtectedShell against the SAME flag, which is what makes a
 * redirect loop structurally impossible:
 *   ProtectedShell : signed in AND !onboarded -> /onboarding/<step>
 *   OnboardingShell: signed in AND  onboarded -> /dashboard
 * One boolean, two complementary branches.
 *
 * `allowCompleted` lets already-onboarded users retake the placement test.
 */
export async function OnboardingShell({
  children,
  allowCompleted = false



}: {children: React.ReactNode;allowCompleted?: boolean;}) {
  const { user, isOnboarded } = await getSessionContext();

  if (!user) redirect("/login");
  if (isOnboarded && !allowCompleted) redirect("/dashboard");

  return <>{children}</>;
}