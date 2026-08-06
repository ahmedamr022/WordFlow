import React from "react";
import { redirect } from "next/navigation";

import { getSessionContext, nextOnboardingStep } from "@/lib/auth/session";

/**
 * The real authorization boundary for signed-in areas.
 *
 * proxy.ts is an optimisation, not a guard: it is bypassable, it is ignored
 * for excluded paths, and one matcher typo silently exposes a whole section.
 * This runs inside the render, on the server, with a verified token.
 *
 * It also owns the onboarding gate, so there is exactly ONE place in the
 * codebase that can send a user to /onboarding.
 */
export async function ProtectedShell({ children }: {children: React.ReactNode;}) {
  const { user, profile, isOnboarded } = await getSessionContext();

  if (!user) redirect("/login");
  if (!isOnboarded) redirect(nextOnboardingStep(profile));

  return <>{children}</>;
}