import "server-only";

import { cache } from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { HttpError, requireUser } from "@/lib/auth/guards";
import { toJson } from "@/lib/json";

/**
 * صلاحيات Admin Studio.
 *
 * المصدر عمود واحد: `profiles.role` (user | admin | owner | suspended) —
 * انظر 0014_admin_studio.sql.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * لماذا كان الضغط على «Admin Studio» يرجّعك للداشبورد؟
 *
 * البطاقة في الشريط الجانبي تظهر عبر `isCurrentUserAdmin()` وهي **متسامحة**:
 * تجرّب service-role ثم ترتدّ لقراءة صف المستخدم بعميل RLS.
 * أما `requireAdmin()` — حارس `/admin` — فكانت **service-role فقط**. فلو
 * `SUPABASE_SERVICE_ROLE_KEY` غائب أو خاطئ في البيئة، `createAdminClient()`
 * ترمي، فيلتقط `admin/layout.tsx` الاستثناء ويعمل `redirect("/dashboard")`.
 * النتيجة الحرفية: الكارت ظاهر، والضغط عليه يرجّعك للداشبورد كل مرة.
 *
 * الإصلاح: الحارس صار يستخدم **نفس مصدر الحقيقة** الذي يستخدمه علم الواجهة —
 * service-role أولاً، ثم صف المستخدم نفسه عبر RLS (سياسة `profiles` تسمح
 * للمستخدم بقراءة صفّه فقط، فلا تسريب). الصرامة لم تنقص: من ليس
 * `admin`/`owner` ما زال يأخذ 403؛ ما تغيّر أن الأدمن الحقيقي لم يعد يُطرد
 * بسبب متغيّر بيئة ناقص.
 * ─────────────────────────────────────────────────────────────────────────
 */

export type AdminRole = "admin" | "owner";

export interface AdminIdentity {
  user: User;
  role: AdminRole;
  nickname: string;
  avatarUrl: string | null;
}

export type AdminResult<T = undefined> =
{ok: true;data: T;} |
{ok: false;error: string;};

export function adminOk<T>(data: T): AdminResult<T> {
  return { ok: true, data };
}

export function adminFail(err: unknown, fallback = "تعذر تنفيذ العملية"): AdminResult<never> {
  if (err instanceof HttpError) return { ok: false, error: err.message };
  if (err instanceof Error) {
    console.error("[admin]", err.message);
  } else {
    console.error("[admin]", err);
  }
  return { ok: false, error: fallback };
}

interface ProfileRow {
  role?: string | null;
  nickname?: string | null;
  avatar_url?: string | null;
}

/** نحذّر مرة واحدة لكل تشغيل، لا مع كل رندر. */
let serviceRoleWarned = false;

function warnServiceRole(err: unknown) {
  if (serviceRoleWarned) return;
  serviceRoleWarned = true;
  console.warn(
    "[admin] service-role غير متاح — تم الارتداد لعميل RLS. راجع SUPABASE_SERVICE_ROLE_KEY.\n  ⤳",
    err instanceof Error ? err.message : err
  );
}

/**
 * صف الملف الشخصي للمستخدم الحالي.
 * يجرّب service-role ثم يرتدّ لعميل RLS. يرمي 503 فقط إذا فشل المساران معاً.
 */
async function readOwnProfile(userId: string): Promise<ProfileRow | null> {
  // 1) المسار المفضّل: service-role (يتجاوز RLS تماماً).
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.
    from("profiles").
    select("role, nickname, avatar_url").
    eq("id", userId).
    maybeSingle();

    if (!error) return (data ?? null) as ProfileRow | null;
    console.warn("[admin:guard] service-role query:", error.code ?? "", error.message);
  } catch (err) {
    warnServiceRole(err);
  }

  // 2) الارتداد: صف المستخدم نفسه عبر RLS.
  const supabase = await createClient();
  const { data, error } = await supabase.
  from("profiles").
  select("role, nickname, avatar_url").
  eq("id", userId).
  maybeSingle();

  if (error) {
    console.error("[admin:guard] RLS fallback:", error.code ?? "", error.message);
    throw new HttpError(503, "تعذر التحقق من الصلاحيات، حاول لاحقاً");
  }

  return (data ?? null) as ProfileRow | null;
}

/** يرمي 403 لغير الأدمن. مُخزَّن لكل طلب حتى لا نكرر الاستعلام في نفس الرندر. */
export const requireAdmin = cache(async function requireAdmin(): Promise<AdminIdentity> {
  const user = await requireUser();
  const data = await readOwnProfile(user.id);

  const role = normalizeRole(data?.role);
  if (role !== "admin" && role !== "owner") {
    // سطر تشخيص واحد واضح بدل ارتداد صامت للداشبورد.
    console.warn(`[admin:guard] role="${role || "(فارغ)"}" للمستخدم ${user.id} — رُفض الدخول`);
    throw new HttpError(403, "هذه الصفحة مخصصة لمديري المنصة");
  }

  return {
    user,
    role,
    nickname: data?.nickname ?? "Admin",
    avatarUrl: data?.avatar_url ?? null
  };
});

/** يرمي 403 لغير المالك — للعمليات الحسّاسة (ترقية أدمن، تعليق حساب). */
export async function requireOwner(): Promise<AdminIdentity> {
  const identity = await requireAdmin();
  if (identity.role !== "owner") {
    throw new HttpError(403, "هذه العملية مخصصة لمالك المنصة فقط");
  }
  return identity;
}

/**
 * تطبيع القيمة القادمة من العمود: مسافات زائدة أو حالة أحرف مختلفة
 * (`" Admin"`, `"ADMIN"`) كانت تُفشل المقارنة الحرفية بصمت.
 */
function normalizeRole(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/**
 * دور المستخدم الحالي، أو `null` للزائر. لا يرمي أبداً.
 * يُستخدم في الواجهة فقط (إظهار «Admin Studio»)، والحماية الحقيقية في
 * `src/app/admin/layout.tsx` عبر `requireAdmin()`.
 */
export const getCurrentUserRole = cache(async function getCurrentUserRole(): Promise<
  string | null>
{
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  try {
    const data = await readOwnProfile(user.id);
    return normalizeRole(data?.role);
  } catch {
    return null;
  }
});

/**
 * فحص هادئ للاستخدام في الواجهة (إظهار عنصر «Admin Studio» في الشريط الجانبي)
 * — لا يرمي أبداً، فالمستخدم العادي لا يجب أن يرى أي خطأ.
 *
 * ملاحظة مهمة: هذه الدالة و`requireAdmin()` صارتا تقرآن من **نفس** المسار
 * (`readOwnProfile`)، فلا يمكن بعد الآن أن تظهر البطاقة لمستخدم يرفضه الحارس.
 */
export const isCurrentUserAdmin = cache(async function isCurrentUserAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === "admin" || role === "owner";
});

/**
 * يسجّل حدثاً في سجل الأدمن. لا يفشل العملية الأصلية أبداً لو تعذّر التسجيل —
 * سجلّ ناقص أهون من نشر قصة يفشل بسبب جدول تدقيق.
 */
export async function logAdminActivity(input: {
  actorId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  label?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("admin_activity").insert({
      actor_id: input.actorId,
      action: input.action,
      entity: input.entity,
      entity_id: input.entityId ?? null,
      label: input.label ?? "",
      meta: toJson(input.meta ?? {})
    });
  } catch (err) {
    console.error("[admin:activity]", err);
  }
}