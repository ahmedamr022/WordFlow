import React from "react";
import { ProtectedShell } from "@/components/auth/protected-shell";

// يغطي /vocabulary و /vocabulary/test معاً.
export default function VocabularyLayout({ children }: {children: React.ReactNode;}) {
  return <ProtectedShell>{children}</ProtectedShell>;
}