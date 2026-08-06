import React from "react";
import { ProtectedShell } from "@/components/auth/protected-shell";

export default function ChallengesLayout({ children }: {children: React.ReactNode;}) {
  return <ProtectedShell>{children}</ProtectedShell>;
}