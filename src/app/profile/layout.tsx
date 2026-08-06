import React from "react";
import { ProtectedShell } from "@/components/auth/protected-shell";

export default function ProfileLayout({ children }: {children: React.ReactNode;}) {
  return <ProtectedShell>{children}</ProtectedShell>;
}