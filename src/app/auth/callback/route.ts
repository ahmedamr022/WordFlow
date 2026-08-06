import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { siteOrigin } from "@/lib/env/public";
import { safeInternalPath } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * OAuth / PKCE code exchange.
 *
 * Redirects are built from the CANONICAL origin (NEXT_PUBLIC_SITE_URL), not
 * from request.nextUrl.origin, which is attacker-influenceable behind a proxy
 * via the Host header.
 *
 * Destination is decided from profiles.onboarding_completed_at — the same
 * flag ProtectedShell uses — so the callback can never disagree with the
 * shells and cause a bounce.
 */
export async function GET(request: NextRequest) {
  const origin = siteOrigin();
  const { searchParams } = request.nextUrl;

  const oauthError = searchParams.get("error_description") ?? searchParams.get("error");
  if (oauthError) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
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