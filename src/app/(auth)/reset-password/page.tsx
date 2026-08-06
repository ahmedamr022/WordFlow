import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSessionContext } from "@/lib/auth/session";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "كلمة مرور جديدة — WordFlow"
};

/**
 * Reached from /auth/confirm after verifyOtp({ type: "recovery" }).
 *
 * The recovery session is a real session, so we can verify it server-side and
 * send strangers back to /forgot-password instead of rendering a form that is
 * guaranteed to 401 on submit.
 */
export default async function ResetPasswordPage() {
  const { user } = await getSessionContext();
  if (!user) redirect("/forgot-password?error=expired_link");

  return <ResetPasswordForm />;
}