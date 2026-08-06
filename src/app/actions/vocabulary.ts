"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rpcAny } from "@/lib/supabase/rpc";
import {
  HttpError,
  requireUser,
  assertSameOrigin,
  enforceRateLimit,
  RATE_LIMITS } from
"@/lib/auth/guards";
import { wordReviewSchema, vocabTestSchema } from "@/lib/validation/schemas";
import { wordReviewByTextSchema } from "@/lib/validation/progressSlug";
import type { ActionResult } from "./auth";

/**
 * ── لماذا لم يكن تقدّم الكلمات يُحفظ؟ ───────────────────────────────────────
 * النسخة السابقة من `markWordLearnedByTextAction` كانت تبحث عن الكلمة في جدول
 * `words`، وإن لم تجدها ترجع:
 *     «هذه الكلمة غير موجودة في قاعدة البيانات بعد»
 * وجدول `words` لا يمتلئ إلا بسكربت seed لم يُشغَّل على أغلب البيئات. فكل ضغطة
 * «تعلّمت هذه الكلمة» كانت تفشل بصمت تقريباً، ويُرجَع العلم التفاؤلي للخلف.
 *
 * الآن: `record_word_review_by_text` (هجرة 0016) تنشئ صف الكلمة عند أول تفاعل
 * حقيقي — بنفس المفتاح الفريد (normalized, part_of_speech) الذي يستخدمه الـ
 * seed، فلا ازدواج لاحقاً — ثم تنادي `record_word_review` كما هي.
 *
 * كذلك: صحّة الإجابة صارت تُمرَّر فعلاً (`correct`) بدل تثبيتها على `true`،
 * فمنطق إعادة الجدولة في `record_word_review` يعمل كما صُمِّم.
 */

function fail(err: unknown): ActionResult<never> {
  if (err instanceof HttpError) return { ok: false, error: err.message };
  return { ok: false, error: "تعذر حفظ تقدم المفردات" };
}

export type WordReviewResult = {
  status: "new" | "learning" | "learned";
  xp_awarded: number;
  xp_total: number;
  word_id?: string;
};

/** مراجعة كلمة بمعرّفها في جدول words (المسار المستقبلي بعد هجرة المحتوى). */
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

    revalidatePath("/vocabulary");
    return { ok: true, data: data as unknown as WordReviewResult };
  } catch (err) {
    return fail(err);
  }
}

/**
 * المسار الحيّ لواجهة /vocabulary: الكلمة تُعرَّف بنصها + نوعها، والسيرفر
 * يضمن وجود صفّها ثم يسجّل المراجعة ويمنح الـ XP مرة واحدة.
 */
export async function recordWordReviewByTextAction(
input: unknown)
: Promise<ActionResult<WordReviewResult>> {
  try {
    await assertSameOrigin();
    const user = await requireUser();
    const parsed = wordReviewByTextSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "كلمة غير صالحة" };
    await enforceRateLimit("progress", user.id, RATE_LIMITS.progressWrite);

    const admin = createAdminClient();
    const seed = parsed.data.seed ?? {};

    const { data, error } = await rpcAny<WordReviewResult>(
      admin,
      "record_word_review_by_text",
      {
        p_user_id: user.id,
        p_word: parsed.data.word,
        p_part_of_speech: parsed.data.partOfSpeech ?? "unknown",
        p_correct: parsed.data.correct,
        p_translation_ar: seed.translationAr ?? null,
        p_ipa: seed.ipa ?? null,
        p_cefr: seed.cefrLevel ?? "A1",
        p_example_en: seed.exampleEn ?? null,
        p_example_ar: seed.exampleAr ?? null
      }
    );
    if (error) {
      console.error("[vocabulary:reviewByText]", error.code ?? "", error.message);
      throw new HttpError(400, "تعذر حفظ تقدم المفردات، حاول مرة أخرى");
    }

    revalidatePath("/vocabulary");
    return {
      ok: true,
      data: data ?? { status: "learning", xp_awarded: 0, xp_total: 0 }
    };
  } catch (err) {
    return fail(err);
  }
}

/** توافق خلفي: نفس المسار أعلاه بإجابة صحيحة. */
export async function markWordLearnedByTextAction(
input: unknown)
: Promise<ActionResult<WordReviewResult>> {
  const payload = (input ?? {}) as Record<string, unknown>;
  return recordWordReviewByTextAction({ ...payload, correct: true });
}

/** الكلمات المتعلَّمة للمستخدم الحالي كنصوص مطبَّعة — تغذّي علامات ✓ في الواجهة. */
export async function getLearnedWordsAction(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase.
  from("user_word_progress").
  select("status, words(normalized)").
  eq("user_id", user.id).
  eq("status", "learned");

  return (data ?? []).
  map((row) => {
    const rel = row.words as {normalized?: string;} | {normalized?: string;}[] | null;
    const item = Array.isArray(rel) ? rel[0] : rel;
    return item?.normalized ?? "";
  }).
  filter(Boolean);
}

/** دفعة واحدة في نهاية اختبار التصنيف (المسار القائم على UUID). */
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
      const row = data as unknown as WordReviewResult;
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