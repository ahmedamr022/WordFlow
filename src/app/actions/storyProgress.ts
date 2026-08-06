"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { rpcAny } from "@/lib/supabase/rpc";
import {
  HttpError,
  requireUser,
  assertSameOrigin,
  enforceRateLimit,
  RATE_LIMITS } from
"@/lib/auth/guards";
import {
  lineAttemptBySlugSchema,
  completeStoryBySlugSchema } from
"@/lib/validation/progressSlug";
import type { ActionResult } from "./auth";

/**
 * تقدّم القراءة الحقيقي.
 *
 * ── لماذا لم يكن أي شيء يُحفظ؟ ──────────────────────────────────────────────
 * `submitLineAttemptAction` و `completeStoryAction` في `progress.ts` تعملان
 * بـ UUID من `story_lines` / `stories`. لكن صفحة القراءة تعمل على المحتوى
 * الثابت (`src/data/stories.ts`) بمعرّفات نصية، فلم يكن ممكناً استدعاؤهما —
 * ولذلك لم يكن لهما **أي** call site في المشروع كله. النتيجة: المستخدم يكتب
 * قصة كاملة ولا يُكتب سطر واحد في `user_line_attempts` ولا `xp_events` ولا
 * `user_story_progress`؛ الشيء الوحيد المحفوظ كان «موقع القراءة» فقط.
 *
 * هنا نمرّر الـ slug ونص السطر، ودوال 0016 ترفع القصة/السطر إلى الداتابيز عند
 * أول محاولة ثم تنادي نفس دوال 0006 — فتبقى كل حواجز مكافحة الغش ومنطق الـ XP
 * كما هي بلا أي تخفيف.
 */

function fail(err: unknown): ActionResult<never> {
  if (err instanceof HttpError) return { ok: false, error: err.message };
  return { ok: false, error: "تعذر حفظ تقدمك، حاول مرة أخرى" };
}

function dbFailure(scope: string, error: {message: string;code?: string;}): HttpError {
  console.error(`[storyProgress:${scope}]`, error.code ?? "", error.message);
  return new HttpError(400, "تعذر حفظ تقدمك، حاول مرة أخرى");
}

export type LineAttemptOutcome = {
  accepted: boolean;
  reason?: string;
  xp_awarded: number;
  xp_total: number;
};

/** تُستدعى بعد كل جملة مكتملة. */
export async function submitLineAttemptBySlugAction(
input: unknown)
: Promise<ActionResult<LineAttemptOutcome>> {
  try {
    await assertSameOrigin();
    const user = await requireUser();
    const parsed = lineAttemptBySlugSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "بيانات المحاولة غير صالحة" };
    await enforceRateLimit("progress", user.id, RATE_LIMITS.progressWrite);

    const admin = createAdminClient();
    const { data, error } = await rpcAny<LineAttemptOutcome>(
      admin,
      "record_line_attempt_by_slug",
      {
        p_user_id: user.id,
        p_story_slug: parsed.data.storySlug,
        p_line_index: parsed.data.lineIndex,
        p_line_text: parsed.data.lineText,
        p_translation_ar: parsed.data.translationAr ?? null,
        p_story_title_en: parsed.data.storyTitleEn ?? null,
        p_story_title_ar: parsed.data.storyTitleAr ?? null,
        p_cefr: parsed.data.cefrLevel ?? "A1",
        p_wpm: parsed.data.wpm,
        p_accuracy: parsed.data.accuracy,
        p_correct: parsed.data.correctChars,
        p_incorrect: parsed.data.incorrectChars,
        p_seconds: parsed.data.seconds
      }
    );
    if (error) throw dbFailure("lineAttempt", error);

    return {
      ok: true,
      data: data ?? { accepted: false, xp_awarded: 0, xp_total: 0 }
    };
  } catch (err) {
    return fail(err);
  }
}

/** تُستدعى مرة واحدة عند إنهاء آخر جملة — المكافأة idempotent في الداتابيز. */
export async function completeStoryBySlugAction(
input: unknown)
: Promise<ActionResult<{xp_total: number;xp_awarded: number;}>> {
  try {
    await assertSameOrigin();
    const user = await requireUser();
    const parsed = completeStoryBySlugSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "معرّف قصة غير صالح" };
    await enforceRateLimit("progress", user.id, RATE_LIMITS.progressWrite);

    const admin = createAdminClient();
    const { data, error } = await rpcAny<{xp_total: number;xp_awarded: number;}>(
      admin,
      "complete_story_by_slug",
      {
        p_user_id: user.id,
        p_story_slug: parsed.data.storySlug,
        p_story_title_en: parsed.data.storyTitleEn ?? null,
        p_story_title_ar: parsed.data.storyTitleAr ?? null,
        p_cefr: parsed.data.cefrLevel ?? "A1"
      }
    );
    if (error) throw dbFailure("completeStory", error);

    revalidatePath("/dashboard");
    revalidatePath("/stories");
    revalidatePath("/stats");
    return { ok: true, data: data ?? { xp_total: 0, xp_awarded: 0 } };
  } catch (err) {
    return fail(err);
  }
}