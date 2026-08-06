"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { assertSameOrigin } from "@/lib/auth/guards";
import {
  adminFail,
  adminOk,
  logAdminActivity,
  requireAdmin,
  type AdminResult } from
"@/lib/auth/admin";
import { listSettings } from "@/lib/admin/queries";
import { toJson } from "@/lib/json";
import type { AdminSetting } from "@/types/admin";

/**
 * إعدادات المنصة.
 *
 * كل الإعدادات صفوف في `app_settings` (key/jsonb) لا متغيّرات بيئة: تغيير
 * قيمة XP أو فتح/غلق التسجيل لا يجب أن يحتاج ديبلوي. القيم تُكتب كما هي
 * (رقم/نص/منطقي) لا كنص دائماً، حتى تقرأها دوال SQL مثل `setting_int` بلا
 * تحويل.
 */

const entrySchema = z.object({
  key: z.string().trim().min(2).max(80),
  value: z.union([z.string().max(400), z.number(), z.boolean()])
});

export async function listSettingsAction(): Promise<AdminResult<AdminSetting[]>> {
  try {
    await requireAdmin();
    return adminOk(await listSettings());
  } catch (err) {
    return adminFail(err);
  }
}

export async function saveSettingsAction(entries: unknown): Promise<AdminResult<null>> {
  try {
    await assertSameOrigin();
    const identity = await requireAdmin();

    const parsed = z.array(entrySchema).min(1).max(60).safeParse(entries);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
    }

    const admin = createAdminClient();
    const now = new Date().toISOString();

    // تحديث صف صف: المفاتيح قليلة، و upsert جماعي كان سيمسح عمود description.
    const results = await Promise.all(
      parsed.data.map((entry) =>
      admin.
      from("app_settings").
      update({ value: toJson(entry.value), updated_at: now }).
      eq("key", entry.key)
      )
    );

    const failed = results.find((result) => result.error);
    if (failed?.error) return adminFail(failed.error, "تعذر حفظ الإعدادات");

    await logAdminActivity({
      actorId: identity.user.id,
      action: "settings.updated",
      entity: "settings",
      label: `${parsed.data.length} إعداد`,
      meta: { keys: parsed.data.map((entry) => entry.key) }
    });

    revalidatePath("/admin/settings");
    return adminOk(null);
  } catch (err) {
    return adminFail(err);
  }
}