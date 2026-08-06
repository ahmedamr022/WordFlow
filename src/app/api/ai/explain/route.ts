import type { NextRequest } from "next/server";

import {
  requireUser,
  enforceRateLimit,
  toResponse,
  RATE_LIMITS,
  HttpError } from
"@/lib/auth/guards";
import { explainRequestSchema } from "@/lib/validation/schemas";
import { geminiEnv } from "@/lib/env/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const GEMINI_ENDPOINT =
"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const UPSTREAM_TIMEOUT_MS = 20_000;

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    await enforceRateLimit("ai:explain", user.id, RATE_LIMITS.aiExplain);

    const body = await request.json().catch(() => null);
    const parsed = explainRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0]?.message ?? "طلب غير صالح");
    }

    const env = geminiEnv();

    const prompt = [
    "أنت معلم لغة إنجليزية يشرح لمتعلم عربي.",
    `اشرح الكلمة: "${parsed.data.word}"`,
    parsed.data.context ? `في سياق الجملة: "${parsed.data.context}"` : "",
    "أعد JSON فقط بالمفاتيح: meaning_ar, part_of_speech, example_en, example_ar."].

    filter(Boolean).
    join("\n");

    const upstream = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Header, not ?key= — query strings end up in proxy and CDN logs.
        "x-goog-api-key": env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
    }).catch(() => null);

    if (!upstream || !upstream.ok) {
      throw new HttpError(502, "تعذر جلب الشرح الآن");
    }

    const json: unknown = await upstream.json().catch(() => null);

    const candidate = json as
    {
      candidates?: {content?: {parts?: {text?: string;}[];};}[];
      usageMetadata?: {promptTokenCount?: number;candidatesTokenCount?: number;};
    } |
    null;

    const text = candidate?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    let explanation: unknown;
    try {
      explanation = JSON.parse(text);
    } catch {
      // The model can return prose despite responseMimeType. A raw throw here
      // used to surface as an opaque 500.
      throw new HttpError(502, "تعذر قراءة الشرح، حاول مرة أخرى");
    }

    void createAdminClient().
    from("ai_usage_log").
    insert({
      user_id: user.id,
      route: "/api/ai/explain",
      prompt_tokens: candidate?.usageMetadata?.promptTokenCount ?? 0,
      output_tokens: candidate?.usageMetadata?.candidatesTokenCount ?? 0
    }).
    then(() => undefined);

    return Response.json(explanation, {
      headers: { "Cache-Control": "private, max-age=86400" }
    });
  } catch (err) {
    return toResponse(err);
  }
}