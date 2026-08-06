import React from "react";
import { ProtectedShell } from "@/components/auth/protected-shell";

// يغطي /story/[storyId].
export default function StoryLayout({ children }: {children: React.ReactNode;}) {
  return <ProtectedShell>{children}</ProtectedShell>;
}