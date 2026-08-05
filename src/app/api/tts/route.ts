import { NextRequest } from "next/server";
import {
  requireUser,
  enforceRateLimit,
  toResponse,
  RATE_LIMITS,
  HttpError } from
"@/lib/auth/guards";
import { ttsRequestSchema } from "@/lib/validation/schemas";
import { serverEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * إصلاحات مقابل النسخة الحالية:
 *  · الراوت كان مفتوحاً لأي زائر مجهول ⇒ requireUser() الآن إلزامي
 *  · لا rate limiting ⇒ 200 طلب/ساعة لكل مستخدم
 *  · نص المستخدم كان يُحقن مباشرة في URL طرف ثالث ⇒ تحقق بـ zod + قائمة أصوات مسموحة
 */

const ALLOWED_VOICES = new Set([
"af_heart",
"af_bella",
"am_michael",
"bf_emma",
"bm_george"]
);

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    await enforceRateLimit("tts", user.id, RATE_LIMITS.tts);

    const body = await request.json().catch(() => null);
    const parsed = ttsRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0]?.message ?? "طلب غير صالح");
    }
    if (!ALLOWED_VOICES.has(parsed.data.voiceId)) {
      throw new HttpError(400, "الصوت المطلوب غير مسموح");
    }

    const env = serverEnv();
    if (!env.KOKORO_API_URL) throw new HttpError(503, "خدمة الصوت غير مهيأة");

    const upstream = await fetch(new URL("/v1/audio/speech", env.KOKORO_API_URL), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: parsed.data.text,
        voice: parsed.data.voiceId,
        response_format: "mp3"
      }),
      cache: "no-store"
    });

    if (!upstream.ok || !upstream.body) {
      throw new HttpError(502, "تعذر توليد الصوت");
    }

    void createAdminClient().
    from("ai_usage_log").
    insert({ user_id: user.id, route: "/api/tts", prompt_tokens: parsed.data.text.length }).
    then(() => undefined);

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=3600"
      }
    });
  } catch (err) {
    return toResponse(err);
  }
}