import { NextRequest } from "next/server";
import {
  requireUser,
  enforceRateLimit,
  toResponse,
  RATE_LIMITS,
  HttpError } from
"@/lib/auth/guards";
import { explainRequestSchema } from "@/lib/validation/schemas";
import { serverEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * كان مفتوحاً لأي زائر مجهول يحرق مفتاح Gemini المدفوع.
 * الآن: مستخدم مسجّل فقط · 20 طلب/ساعة · تحقق بـ zod · تسجيل الاستهلاك.
 */

const GEMINI_ENDPOINT =
"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    await enforceRateLimit("ai:explain", user.id, RATE_LIMITS.aiExplain);

    const body = await request.json().catch(() => null);
    const parsed = explainRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0]?.message ?? "طلب غير صالح");
    }

    const env = serverEnv();
    const prompt = [
    "أنت معلم لغة إنجليزية يشرح لمتعلم عربي.",
    `اشرح الكلمة: "${parsed.data.word}"`,
    parsed.data.context ? `في سياق الجملة: "${parsed.data.context}"` : "",
    "أعد JSON فقط بالمفاتيح: meaning_ar, part_of_speech, example_en, example_ar."].

    filter(Boolean).
    join("\n");

    const upstream = await fetch(`${GEMINI_ENDPOINT}?key=${env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
      }),
      cache: "no-store"
    });

    if (!upstream.ok) throw new HttpError(502, "تعذر جلب الشرح الآن");

    const json = await upstream.json();
    const text: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    void createAdminClient().
    from("ai_usage_log").
    insert({
      user_id: user.id,
      route: "/api/ai/explain",
      prompt_tokens: json?.usageMetadata?.promptTokenCount ?? 0,
      output_tokens: json?.usageMetadata?.candidatesTokenCount ?? 0
    }).
    then(() => undefined);

    return Response.json(JSON.parse(text), {
      headers: { "Cache-Control": "private, max-age=86400" }
    });
  } catch (err) {
    return toResponse(err);
  }
}