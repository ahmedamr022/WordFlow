import React from "react";

import { OnboardingShell } from "@/components/auth/onboarding-shell";

/**
 * The placement test is reachable both during onboarding and later from
 * settings, so completed users must not be bounced to /dashboard here.
 */
export default function AutoTestLayout({ children }: {children: React.ReactNode;}) {
  return <OnboardingShell allowCompleted>{children}</OnboardingShell>;
}