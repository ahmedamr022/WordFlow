"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { HttpError, requireUser, assertSameOrigin } from "@/lib/auth/guards";
import { importLocalProgressSchema } from "@/lib/validation/schemas";
import type { ActionResult } from "./auth";

/**
 * هجرة لمرة واحدة من localStorage إلى السيرفر.
 * المنطق: «الأعلى يفوز» — لا نخفض أي رقم موجود على السيرفر.
 * الحماية: مفتاح idempotency ثابت لكل مستخدم، فالتنفيذ مرتين لا يضاعف الـ XP.
 *
 * ملاحظة: قائمة مفاتيح localStorage القديمة انتقلت إلى
 * src/lib/storage/legacyKeys.ts — ملف "use server" لا يجوز أن يصدّر ثوابت.
 */
export async function importLocalProgressAction(
input: unknown)
: Promise<ActionResult<{imported: boolean;xp_total: number;}>> {
  try {
    await assertSameOrigin();
    const user = await requireUser();
    const parsed = importLocalProgressSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "بيانات الهجرة غير صالحة" };

    const admin = createAdminClient();

    // 1) هل تمت الهجرة من قبل؟
    const { data: existing } = await admin.
    from("xp_events").
    select("id").
    eq("idempotency_key", `migration:${user.id}`).
    maybeSingle();

    if (existing) {
      const { data: current } = await admin.
      from("user_stats").
      select("xp_total").
      eq("user_id", user.id).
      maybeSingle();
      return { ok: true, data: { imported: false, xp_total: Number(current?.xp_total ?? 0) } };
    }

    // 2) الفرق فقط بين المحلي والسيرفر (الأعلى يفوز)
    const { data: stats } = await admin.
    from("user_stats").
    select("xp_total, streak_count, longest_streak, words_learned_count").
    eq("user_id", user.id).
    maybeSingle();

    const serverXp = Number(stats?.xp_total ?? 0);
    const delta = Math.max(parsed.data.xpTotal - serverXp, 0);

    const { data: total, error: xpError } = await admin.rpc("award_xp", {
      p_user_id: user.id,
      p_source_type: "migration",
      p_source_id: "",
      p_amount: delta > 0 ? delta : 1, // سطر واحد على الأقل ليُعلَّم أن الهجرة تمت
      p_idempotency_key: `migration:${user.id}`
    });
    if (xpError) throw new HttpError(400, xpError.message);

    // 3) الستريك: الأعلى يفوز أيضاً
    const bestStreak = Math.max(
      parsed.data.streakCount,
      Number(stats?.longest_streak ?? 0),
      Number(stats?.streak_count ?? 0)
    );
    await admin.from("user_stats").update({ longest_streak: bestStreak }).eq("user_id", user.id);

    // 4) القصص المكتملة عبر slug
    if (parsed.data.completedStorySlugs.length) {
      const { data: storyRows } = await admin.
      from("stories").
      select("id").
      in("slug", parsed.data.completedStorySlugs);
      for (const story of storyRows ?? []) {
        await admin.rpc("complete_story", { p_user_id: user.id, p_story_id: story.id });
      }
    }

    // 5) الكلمات المتعلَّمة عبر النص المطبَّع
    if (parsed.data.learnedWords.length) {
      const normalized = parsed.data.learnedWords.map((w) => w.trim().toLowerCase());
      const { data: wordRows } = await admin.
      from("words").
      select("id").
      in("normalized", normalized);

      if (wordRows?.length) {
        await admin.from("user_word_progress").upsert(
          wordRows.map((w) => ({
            user_id: user.id,
            word_id: w.id,
            status: "learned" as const,
            correct_count: 3,
            last_reviewed_at: new Date().toISOString()
          })),
          { onConflict: "user_id,word_id", ignoreDuplicates: true }
        );

        // العدّاد لا يُخفَّض أبداً — الأعلى يفوز
        const learnedTotal = Math.max(
          wordRows.length,
          Number(stats?.words_learned_count ?? 0)
        );
        await admin.
        from("user_stats").
        update({ words_learned_count: learnedTotal }).
        eq("user_id", user.id);
      }
    }

    revalidatePath("/dashboard");
    return { ok: true, data: { imported: true, xp_total: Number(total ?? 0) } };
  } catch (err) {
    if (err instanceof HttpError) return { ok: false, error: err.message };
    return { ok: false, error: "تعذر نقل تقدمك القديم" };
  }
}