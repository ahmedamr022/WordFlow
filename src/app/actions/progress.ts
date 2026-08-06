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
import { lineAttemptSchema, storyIdSchema } from "@/lib/validation/schemas";
import type { ActionResult } from "./auth";

/**
 * كل كتابة تقدم تمر من هنا بالشكل الموحّد:
 * requireUser() → schema.parse() → checkRateLimit() → RPC ذرّية → revalidatePath
 * العميل لا يملك أي صلاحية كتابة على جداول التقدم (انظر 0007_rls_policies.sql).
 */

function fail(err: unknown): ActionResult<never> {
  if (err instanceof HttpError) return { ok: false, error: err.message };
  return { ok: false, error: "تعذر حفظ تقدمك، حاول مرة أخرى" };
}

/**
 * لا نمرّر نص خطأ Postgres للمتصفح: أسماء الأعمدة والقيود تكشف المخطط.
 * نسجّله على السيرفر ونرمي رسالة عربية آمنة.
 */
function dbFailure(scope: string, error: {message: string;code?: string;}): HttpError {
  console.error(`[progress:${scope}]`, error.code ?? "", error.message);
  return new HttpError(400, "تعذر حفظ تقدمك، حاول مرة أخرى");
}

export async function startStoryAction(input: unknown): Promise<ActionResult> {
  try {
    await assertSameOrigin();
    const user = await requireUser();
    const parsed = storyIdSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "معرّف قصة غير صالح" };
    await enforceRateLimit("progress", user.id, RATE_LIMITS.progressWrite);

    const admin = createAdminClient();
    const { error } = await admin.from("user_story_progress").upsert(
      {
        user_id: user.id,
        story_id: parsed.data.storyId,
        status: "in_progress",
        started_at: new Date().toISOString()
      },
      { onConflict: "user_id,story_id", ignoreDuplicates: true }
    );
    if (error) throw dbFailure("startStory", error);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export type LineAttemptResult = {
  accepted: boolean;
  reason?: string;
  xp_awarded: number;
  xp_total: number;
};

/**
 * تُستدعى بعد كل سطر. حواجز المعقولية تُطبَّق داخل Postgres
 * (record_line_attempt) فلا يمكن الالتفاف عليها من العميل.
 */
export async function submitLineAttemptAction(
input: unknown)
: Promise<ActionResult<LineAttemptResult>> {
  try {
    await assertSameOrigin();
    const user = await requireUser();
    const parsed = lineAttemptSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "بيانات المحاولة غير صالحة" };
    await enforceRateLimit("progress", user.id, RATE_LIMITS.progressWrite);

    const admin = createAdminClient();
    const { data, error } = await admin.rpc("record_line_attempt", {
      p_user_id: user.id,
      p_line_id: parsed.data.lineId,
      p_wpm: parsed.data.wpm,
      p_accuracy: parsed.data.accuracy,
      p_correct: parsed.data.correctChars,
      p_incorrect: parsed.data.incorrectChars,
      p_seconds: parsed.data.seconds
    });
    if (error) throw dbFailure("lineAttempt", error);

    return { ok: true, data: data as LineAttemptResult };
  } catch (err) {
    return fail(err);
  }
}

export async function completeStoryAction(
input: unknown)
: Promise<ActionResult<{xp_total: number;xp_awarded: number;}>> {
  try {
    await assertSameOrigin();
    const user = await requireUser();
    const parsed = storyIdSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "معرّف قصة غير صالح" };
    await enforceRateLimit("progress", user.id, RATE_LIMITS.progressWrite);

    const admin = createAdminClient();
    const { data, error } = await admin.rpc("complete_story", {
      p_user_id: user.id,
      p_story_id: parsed.data.storyId
    });
    if (error) throw dbFailure("completeStory", error);

    revalidatePath("/dashboard");
    revalidatePath("/stats");
    return { ok: true, data: data as {xp_total: number;xp_awarded: number;} };
  } catch (err) {
    return fail(err);
  }
}

/** مكافأة الستريك اليومي — idempotent بمفتاح اليوم المحلي للمستخدم. */
export async function claimDailyStreakAction(): Promise<ActionResult<{xp_total: number;}>> {
  try {
    await assertSameOrigin();
    const user = await requireUser();
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("claim_daily_streak", { p_user_id: user.id });
    if (error) throw dbFailure("claimStreak", error);
    revalidatePath("/dashboard");
    return { ok: true, data: { xp_total: Number(data ?? 0) } };
  } catch (err) {
    return fail(err);
  }
}

/**
 * أُزيلت `getUserStats()` من هذا الملف.
 *
 * كانت: بلا try/catch (فـ requireUser() ترمي على الزائر → استثناء Server Action
 * غير معالَج = 500 بدل رد لطيف)، وتستخدم select("*")، ولا يستدعيها أي ملف
 * في المشروع. النسخة الحيّة والمستخدمة فعلاً هي getUserStatsAction في
 * src/app/actions/stats.ts — استوردها من هناك.
 */