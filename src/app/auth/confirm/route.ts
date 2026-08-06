import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { siteOrigin } from "@/lib/env/public";
import { safeInternalPath } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Single entry point for every emailed link: signup confirmation, password
 * recovery, email change, magic link.
 *
 * `type` is now VALIDATED against a whitelist instead of being cast with
 * `as EmailOtpType`, which accepted arbitrary attacker-supplied strings.
 */

const VALID_OTP_TYPES = new Set<EmailOtpType>([
"signup",
"invite",
"magiclink",
"recovery",
"email_change",
"email"]
);

function parseOtpType(value: string | null): EmailOtpType | null {
  if (!value) return null;
  return VALID_OTP_TYPES.has(value as EmailOtpType) ? value as EmailOtpType : null;
}

export async function GET(request: NextRequest) {
  const origin = siteOrigin();
  const { searchParams } = request.nextUrl;

  const tokenHash = searchParams.get("token_hash");
  const type = parseOtpType(searchParams.get("type"));

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/login?error=invalid_link`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=expired_link`);
  }

  // Recovery hands the user a short-lived session whose only purpose is
  // setting a new password.
  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  const { data: profile } = await supabase.
  from("profiles").
  select("onboarding_completed_at").
  eq("id", data.user.id).
  maybeSingle();

  if (!profile?.onboarding_completed_at) {
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  const next = safeInternalPath(searchParams.get("next"), "/dashboard");
  return NextResponse.redirect(`${origin}${next}`);
}