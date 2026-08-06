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
  requireOwner,
  type AdminResult } from
"@/lib/auth/admin";
import { asCefrLevel } from "@/lib/admin/level";

/**
 * إدارة المستخدمين.
 *
 * ثلاث عمليات فقط، وكل واحدة مقيّدة عن قصد:
 *   · تغيير الدور   → للمالك حصراً. أدمن يرقّي نفسه أو غيره = ثغرة تصعيد صلاحيات.
 *   · التعليق       → `role = 'suspended'` (0015). لا حذف: حذف الحساب يمسح
 *     تقدّمه وXP ولا رجعة فيه، والتعليق يوقف الوصول ويبقى قابلاً للتراجع.
 *   · تعديل المستوى → لتصحيح نتيجة اختبار تحديد المستوى بعد شكوى مستخدم.
 *
 * لا توجد هنا عملية «حذف مستخدم» عمداً — تُطلب من الدعم بإجراء يدوي موثّق.
 */

const userIdSchema = z.string().uuid("معرّف مستخدم غير صالح");

export async function setUserRoleAction(
userId: unknown,
role: unknown)
: Promise<AdminResult<{role: string;}>> {
  try {
    await assertSameOrigin();
    const identity = await requireOwner();

    const id = userIdSchema.safeParse(userId);
    const parsed = z.enum(["user", "admin", "owner"]).safeParse(role);
    if (!id.success || !parsed.success) return { ok: false, error: "طلب غير صالح" };

    if (id.data === identity.user.id && parsed.data !== "owner") {
      return { ok: false, error: "لا يمكنك إنزال صلاحيات حسابك أنت" };
    }

    const admin = createAdminClient();
    const { error } = await admin.
    from("profiles").
    update({ role: parsed.data, updated_at: new Date().toISOString() }).
    eq("id", id.data);

    if (error) return adminFail(error, "تعذر تغيير دور المستخدم");

    await logAdminActivity({
      actorId: identity.user.id,
      action: "user.role_changed",
      entity: "user",
      entityId: id.data,
      label: parsed.data,
      meta: { role: parsed.data }
    });

    revalidatePath("/admin/users");
    return adminOk({ role: parsed.data });
  } catch (err) {
    return adminFail(err);
  }
}

export async function setUserSuspendedAction(
userId: unknown,
suspended: unknown)
: Promise<AdminResult<{suspended: boolean;}>> {
  try {
    await assertSameOrigin();
    const identity = await requireAdmin();

    const id = userIdSchema.safeParse(userId);
    const flag = z.boolean().safeParse(suspended);
    if (!id.success || !flag.success) return { ok: false, error: "طلب غير صالح" };

    if (id.data === identity.user.id) {
      return { ok: false, error: "لا يمكنك تعليق حسابك أنت" };
    }

    const admin = createAdminClient();
    const { data: current } = await admin.
    from("profiles").
    select("role, nickname").
    eq("id", id.data).
    maybeSingle();

    if (current?.role === "owner") {
      return { ok: false, error: "لا يمكن تعليق حساب المالك" };
    }

    const { error } = await admin.
    from("profiles").
    update({
      role: flag.data ? "suspended" : "user",
      updated_at: new Date().toISOString()
    }).
    eq("id", id.data);

    if (error) return adminFail(error, "تعذر تحديث حالة الحساب");

    await logAdminActivity({
      actorId: identity.user.id,
      action: flag.data ? "user.suspended" : "user.restored",
      entity: "user",
      entityId: id.data,
      label: String(current?.nickname ?? "")
    });

    revalidatePath("/admin/users");
    return adminOk({ suspended: flag.data });
  } catch (err) {
    return adminFail(err);
  }
}

export async function setUserLevelAction(
userId: unknown,
level: unknown)
: Promise<AdminResult<{level: string;}>> {
  try {
    await assertSameOrigin();
    const identity = await requireAdmin();

    const id = userIdSchema.safeParse(userId);
    if (!id.success) return { ok: false, error: "معرّف مستخدم غير صالح" };

    const nextLevel = asCefrLevel(level);
    const admin = createAdminClient();
    const { error } = await admin.
    from("profiles").
    update({ english_level: nextLevel, updated_at: new Date().toISOString() }).
    eq("id", id.data);

    if (error) return adminFail(error, "تعذر تحديث مستوى المستخدم");

    await logAdminActivity({
      actorId: identity.user.id,
      action: "user.level_changed",
      entity: "user",
      entityId: id.data,
      label: nextLevel
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/progress");
    return adminOk({ level: nextLevel });
  } catch (err) {
    return adminFail(err);
  }
}