"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  HttpError,
  requireUser,
  assertSameOrigin,
  enforceRateLimit,
  RATE_LIMITS } from
"@/lib/auth/guards";
import { positionPercent } from "@/lib/stories/percent";
import type { ActionResult } from "./auth";

/**
 * موقع القراءة الحقيقي داخل القصة.
 *
 * لماذا جدول جديد ولا نستخدم `user_story_progress`؟
 *   `user_story_progress.story_id` من نوع uuid ومرتبط بجدول `stories`، والواجهة
 *   تتعامل مع slug نصي ("titanic-legend"). الجدول `user_story_positions` بمفتاح
 *   نصي ويعمل قبل وبعد ترحيل المحتوى للداتابيز (0009_story_positions.sql).
 *
 * ── إصلاح «مش بيتم حفظ الجملة» ─────────────────────────────────────────────
 * كانت الكتابة تسمح لأي استدعاء بأن يكتب فوق `line_index`، والواجهة ترسل
 * حفظين متقاربين لكل انتقال (واحد فوري بالدقة، وواحد مؤجَّل بدون دقة). أي
 * وصول بترتيب معكوس كان يرجّع الموقع للخلف — وفي أسوأ حالة يمحوه إلى 0.
 * الآن كل حفظ يعلن **نيّته**:
 *   · "auto"   → تقدم طبيعي؛ الداتابيز لا تسمح بالرجوع للخلف (greatest).
 *   · "manual" → المستخدم رجع لجملة سابقة بنفسه؛ نحترم القيمة.
 *   · "reset"  → إعادة القصة من أولها.
 * (انظر 0013_story_position_fix.sql)
 */

const slugSchema = z.
string().
trim().
min(1).
max(120).
regex(/^[A-Za-z0-9._-]+$/, "معرّف قصة غير صالح");

const savePositionSchema = z.object({
  storySlug: slugSchema,
  lineIndex: z.number().int().min(0).max(5000),
  linesCompleted: z.number().int().min(0).max(5000),
  totalLines: z.number().int().min(0).max(5000),
  accuracy: z.number().min(0).max(100).nullable().optional(),
  wpm: z.number().min(0).max(400).nullable().optional(),
  secondsSpent: z.number().int().min(0).max(86400).optional(),
  completed: z.boolean().optional(),
  indexSource: z.enum(["auto", "manual", "reset"]).optional()
});

export type StoryPositionSaveInput = z.input<typeof savePositionSchema>;

export type StoryPosition = {
  storySlug: string;
  lineIndex: number;
  linesCompleted: number;
  totalLines: number;
  percent: number;
  bestAccuracy: number | null;
  bestWpm: number | null;
  timeSpentSeconds: number;
  completed: boolean;
};

function fail(err: unknown): ActionResult<never> {
  if (err instanceof HttpError) return { ok: false, error: err.message };
  return { ok: false, error: "تعذر حفظ موقعك في القصة، حاول مرة أخرى" };
}

/** حفظ الموقع الحالي — تُستدعى عند الانتقال بين الجُمل وعند إنهاء القصة. */
export async function saveStoryPositionAction(input: unknown): Promise<ActionResult> {
  try {
    await assertSameOrigin();
    const user = await requireUser();
    const parsed = savePositionSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "بيانات الموقع غير صالحة" };
    await enforceRateLimit("progress", user.id, RATE_LIMITS.progressWrite);

    const admin = createAdminClient();
    const { error } = await admin.rpc("upsert_story_position", {
      p_user_id: user.id,
      p_story_slug: parsed.data.storySlug,
      p_line_index: parsed.data.lineIndex,
      p_lines_completed: parsed.data.linesCompleted,
      p_total_lines: parsed.data.totalLines,
      p_accuracy: parsed.data.accuracy ?? undefined,
      p_wpm: parsed.data.wpm ?? undefined,
      p_seconds: parsed.data.secondsSpent ?? 0,
      p_completed: parsed.data.completed ?? false,
      p_index_source: parsed.data.indexSource ?? "auto"
    });

    if (error) {
      console.error("[storyPosition:save]", error.code ?? "", error.message);
      return { ok: false, error: "تعذر حفظ موقعك في القصة، حاول مرة أخرى" };
    }

    if (parsed.data.completed) {
      revalidatePath("/dashboard");
      revalidatePath("/stories");
    }
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

/**
 * قراءة موقع قصة واحدة. ترجع null للزائر أو لو الجدول لسه مش مُرحَّل،
 * فالواجهة تبدأ من أول جملة بدل ما تنكسر.
 */
export async function getStoryPositionAction(
storySlug: unknown)
: Promise<StoryPosition | null> {
  const parsed = slugSchema.safeParse(storySlug);
  if (!parsed.success) return null;

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.
  from("user_story_positions").
  select(
    "story_slug, line_index, lines_completed, total_lines, best_accuracy, best_wpm, time_spent_seconds, completed_at"
  ).
  eq("user_id", user.id).
  eq("story_slug", parsed.data).
  maybeSingle();

  if (error) {
    console.error("[storyPosition:get]", error.code ?? "", error.message);
    return null;
  }
  if (!data) return null;

  const linesCompleted = Number(data.lines_completed ?? 0);
  const totalLines = Number(data.total_lines ?? 0);

  return {
    storySlug: String(data.story_slug),
    lineIndex: Number(data.line_index ?? 0),
    linesCompleted,
    totalLines,
    percent: positionPercent(linesCompleted, totalLines),
    bestAccuracy:
    data.best_accuracy === null || data.best_accuracy === undefined ?
    null :
    Number(data.best_accuracy),
    bestWpm:
    data.best_wpm === null || data.best_wpm === undefined ? null : Number(data.best_wpm),
    timeSpentSeconds: Number(data.time_spent_seconds ?? 0),
    completed: Boolean(data.completed_at)
  };
}