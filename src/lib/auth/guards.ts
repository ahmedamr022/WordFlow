import "server-only";

import { headers } from "next/headers";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteOrigin } from "@/lib/env/public";

/** Uniform error, later mapped to 401/403/429/503. */
export class HttpError extends Error {
  constructor(
  public readonly status: number,
  message: string,
  public readonly retryAfterSeconds?: number)
  {
    super(message);
    this.name = "HttpError";
  }
}

/**
 * First line of every Server Action and Route Handler.
 * getUser() verifies the token with Supabase — getSession() only decodes a
 * cookie and must never be used for authorization.
 */
export async function requireUser(): Promise<User> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new HttpError(401, "يجب تسجيل الدخول");
  }

  const isEmailProvider = data.user.app_metadata?.provider === "email";
  if (isEmailProvider && !data.user.email_confirmed_at) {
    throw new HttpError(403, "يرجى تأكيد بريدك الإلكتروني أولاً");
  }

  return data.user;
}

/**
 * CSRF defence in depth for write paths.
 *
 * Before: compared Origin against NEXT_PUBLIC_SITE_URL only, so every Vercel
 * preview deployment 403'd on sign-in, onboarding and settings.
 * After: the request's own Host is also accepted, which is exactly what
 * same-origin means. Next 16 additionally performs its own Server Action
 * origin check; this covers Route Handlers too.
 */
export async function assertSameOrigin(): Promise<void> {
  const h = await headers();
  const origin = h.get("origin");

  // Same-origin navigations and Server Action invocations may omit Origin.
  if (!origin) return;

  const allowed = new Set<string>([siteOrigin()]);

  const forwardedHost = h.get("x-forwarded-host") ?? h.get("host");
  if (forwardedHost) {
    const proto = h.get("x-forwarded-proto") ?? "https";
    allowed.add(`${proto}://${forwardedHost}`);
  }

  if (!allowed.has(origin)) {
    throw new HttpError(403, "طلب من مصدر غير مسموح");
  }
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown");

}

export type RateLimitRule = {limit: number;windowSeconds: number;};

export const RATE_LIMITS = {
  signIn: { limit: 5, windowSeconds: 15 * 60 },
  passwordReset: { limit: 3, windowSeconds: 60 * 60 },
  aiExplain: { limit: 20, windowSeconds: 60 * 60 },
  tts: { limit: 200, windowSeconds: 60 * 60 },
  progressWrite: { limit: 120, windowSeconds: 60 }
} satisfies Record<string, RateLimitRule>;

type RateLimitRow = {allowed?: boolean;retry_after_seconds?: number;};

/**
 * Atomic Postgres check_rate_limit.
 *
 * The rpc may return either a bare boolean or a single-row table depending on
 * the migration, so both shapes are handled explicitly instead of being
 * force-cast.
 *
 * Fails CLOSED: if the limiter itself is down we do not throw the expensive
 * routes wide open.
 */
export async function enforceRateLimit(
scope: string,
identifier: string,
rule: RateLimitRule)
: Promise<void> {
  const admin = createAdminClient();

  const { data, error } = await admin.rpc("check_rate_limit", {
    p_key: `${scope}:${identifier}`,
    p_limit: rule.limit,
    p_window_seconds: rule.windowSeconds
  });

  if (error) {
    console.error("[rate-limit] rpc failed", { scope, message: error.message });
    throw new HttpError(503, "تعذر التحقق من حد الطلبات، حاول لاحقاً");
  }

  if (typeof data === "boolean") {
    if (!data) {
      throw new HttpError(429, "عدد محاولات كبير، حاول بعد قليل", rule.windowSeconds);
    }
    return;
  }

  const row = (Array.isArray(data) ? data[0] : data) as RateLimitRow | null | undefined;

  if (row && row.allowed === false) {
    throw new HttpError(
      429,
      "عدد محاولات كبير، حاول بعد قليل",
      row.retry_after_seconds ?? rule.windowSeconds
    );
  }
}

/** Maps HttpError to a Response for API routes. Never leaks internals. */
export function toResponse(err: unknown): Response {
  if (err instanceof HttpError) {
    return Response.json(
      { error: err.message },
      {
        status: err.status,
        headers: err.retryAfterSeconds ?
        { "Retry-After": String(err.retryAfterSeconds) } :
        undefined
      }
    );
  }

  console.error("[api] unhandled", err);
  return Response.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
}