import { headers } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicEnv } from "@/lib/env";

/** خطأ موحّد يترجم لاحقاً إلى 401/403/429. */
export class HttpError extends Error {
  constructor(
  public status: number,
  message: string,
  public retryAfterSeconds?: number)
  {
    super(message);
    this.name = "HttpError";
  }
}

/**
 * يُستدعى في أول كل Server Action وكل Route Handler.
 * ملاحظة: getUser() تتحقق من التوكن مع Supabase — لا نعتمد على getSession().
 */
export async function requireUser(): Promise<User> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new HttpError(401, "يجب تسجيل الدخول");
  }
  if (!data.user.email_confirmed_at && data.user.app_metadata.provider === "email") {
    throw new HttpError(403, "يرجى تأكيد بريدك الإلكتروني أولاً");
  }
  return data.user;
}

/** حماية CSRF لطلبات الكتابة: نرفض أي Origin غريب. */
export async function assertSameOrigin(): Promise<void> {
  const h = await headers();
  const origin = h.get("origin");
  if (!origin) return; // طلبات same-origin من Next لا ترسل Origin دائماً
  const allowed = new URL(publicEnv().NEXT_PUBLIC_SITE_URL).origin;
  if (origin !== allowed) {
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

/** حدود الطلبات المتفق عليها في الخطة. */
export const RATE_LIMITS = {
  signIn: { limit: 5, windowSeconds: 15 * 60 },
  passwordReset: { limit: 3, windowSeconds: 60 * 60 },
  aiExplain: { limit: 20, windowSeconds: 60 * 60 },
  tts: { limit: 200, windowSeconds: 60 * 60 },
  progressWrite: { limit: 120, windowSeconds: 60 }
} satisfies Record<string, RateLimitRule>;

/**
 * يستدعي دالة Postgres الذرّية check_rate_limit.
 * يرمي HttpError(429) مع Retry-After عند التجاوز.
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
    // فشل مغلق: لو منظومة الحد معطّلة لا نفتح الباب على مصراعيه للراوتات المكلفة
    throw new HttpError(503, "تعذر التحقق من حد الطلبات، حاول لاحقاً");
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (row && row.allowed === false) {
    throw new HttpError(
      429,
      "عدد محاولات كبير، حاول بعد قليل",
      row.retry_after_seconds ?? rule.windowSeconds
    );
  }
}

/** يحوّل HttpError إلى Response لراوتات الـ API. */
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