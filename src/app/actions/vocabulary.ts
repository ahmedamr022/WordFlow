"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  HttpError,
  requireUser,
  assertSameOrigin,
  enforceRateLimit,
  RATE_LIMITS } from
"@/lib/auth/guards";
import { wordReviewSchema, vocabTestSchema } from "@/lib/validation/schemas";
import type { ActionResult } from "./auth";

function fail(err: unknown): ActionResult<never> {
  if (err instanceof HttpError) return { ok: false, error: err.message };
  return { ok: false, error: "تعذر حفظ تقدم المفردات" };
}

export type WordReviewResult = {
  status: "new" | "learning" | "learned";
  xp_awarded: number;
  xp_total: number;
};

/**
 * ملاحظة معمارية: wordId هنا هو معرّف من جدول words المركزي.
 * الكلمة التي تُتعلَّم داخل قصة (عبر story_line_words) والكلمة نفسها في قسم
 * المفردات تشيران لنفس الصف — فعدّاد «الكلمات المتعلَّمة» يبقى صحيحاً.
 */
export async function submitWordReviewAction(
input: unknown)
: Promise<ActionResult<WordReviewResult>> {
  try {
    await assertSameOrigin();
    const user = await requireUser();
    const parsed = wordReviewSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "بيانات مراجعة غير صالحة" };
    await enforceRateLimit("progress", user.id, RATE_LIMITS.progressWrite);

    const admin = createAdminClient();
    const { data, error } = await admin.rpc("record_word_review", {
      p_user_id: user.id,
      p_word_id: parsed.data.wordId,
      p_correct: parsed.data.correct
    });
    if (error) throw new HttpError(400, error.message);
    return { ok: true, data: data as WordReviewResult };
  } catch (err) {
    return fail(err);
  }
}

export async function markWordLearnedAction(input: unknown): Promise<ActionResult<WordReviewResult>> {
  return submitWordReviewAction({
    wordId: (input as {wordId?: string;})?.wordId,
    correct: true
  });
}

/** دفعة واحدة ذرّية في نهاية اختبار التصنيف. */
export async function submitVocabTestAction(
input: unknown)
: Promise<ActionResult<{learned: number;xp_total: number;}>> {
  try {
    await assertSameOrigin();
    const user = await requireUser();
    const parsed = vocabTestSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "نتائج الاختبار غير صالحة" };
    await enforceRateLimit("progress", user.id, RATE_LIMITS.progressWrite);

    const admin = createAdminClient();
    let learned = 0;
    let xpTotal = 0;

    for (const result of parsed.data.results) {
      const { data, error } = await admin.rpc("record_word_review", {
        p_user_id: user.id,
        p_word_id: result.wordId,
        p_correct: result.correct
      });
      if (error) throw new HttpError(400, error.message);
      const row = data as WordReviewResult;
      if (row.xp_awarded > 0) learned += 1;
      xpTotal = row.xp_total;
    }

    revalidatePath("/vocabulary");
    return { ok: true, data: { learned, xp_total: xpTotal } };
  } catch (err) {
    return fail(err);
  }
}

/** بحث المفردات في Postgres بفهرس pg_trgm بدل الفلترة في الذاكرة. */
export async function searchWordsAction(query: string) {
  await requireUser();
  const term = query.trim().toLowerCase().slice(0, 60);
  if (term.length < 2) return [];

  const admin = createAdminClient();
  const { data } = await admin.
  from("words").
  select("id, word, translation_ar, ipa, part_of_speech, cefr_level").
  ilike("normalized", `%${term}%`).
  limit(40);
  return data ?? [];
}