import React from "react";

import { OnboardingShell } from "@/components/auth/onboarding-shell";

export default function OnboardingLayout({ children }: {children: React.ReactNode;}) {
  return <OnboardingShell>{children}</OnboardingShell>;
}