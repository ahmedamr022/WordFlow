import type { NextRequest } from "next/server";

import {
  requireUser,
  enforceRateLimit,
  toResponse,
  RATE_LIMITS,
  HttpError } from
"@/lib/auth/guards";
import { ttsRequestSchema } from "@/lib/validation/schemas";
import { speechEnv } from "@/lib/env/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_VOICES = new Set([
"af_heart",
"af_bella",
"am_michael",
"bf_emma",
"bm_george"]
);

const UPSTREAM_TIMEOUT_MS = 30_000;

/** Preserves any base path configured in KOKORO_API_URL. */
function speechEndpoint(base: string): string {
  return `${base.replace(/\/+$/, "")}/v1/audio/speech`;
}

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

    const env = speechEnv();
    if (!env.KOKORO_API_URL) throw new HttpError(503, "خدمة الصوت غير مهيأة");

    const upstream = await fetch(speechEndpoint(env.KOKORO_API_URL), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: parsed.data.text,
        voice: parsed.data.voiceId,
        response_format: "mp3"
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
    }).catch(() => null);

    if (!upstream || !upstream.ok || !upstream.body) {
      throw new HttpError(502, "تعذر توليد الصوت");
    }

    void createAdminClient().
    from("ai_usage_log").
    insert({
      user_id: user.id,
      route: "/api/tts",
      prompt_tokens: parsed.data.text.length
    }).
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