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
import { listCategories } from "@/lib/admin/queries";
import type { AdminCategory } from "@/types/admin";

/**
 * التصنيفات.
 *
 * كانت التصنيفات نصوصاً ثابتة موزّعة في الواجهة ("تاريخ"، "غموض"...). الآن
 * جدول حقيقي له اسم عربي/إنجليزي وأيقونة ولون، فتصنيف القصة يصبح علاقة لا
 * سلسلة نصية، ويمكن للأدمن إضافة تصنيف جديد بلا كود.
 *
 * الحذف: نرفض حذف تصنيف مستخدم — إخفاؤه (is_active=false) أأمن وقابل للتراجع.
 */

const categorySchema = z.object({
  slug: z.
  string().
  trim().
  min(2).
  max(60).
  regex(/^[a-z0-9-]+$/, "المعرّف: حروف إنجليزية صغيرة وأرقام وشرطات فقط"),
  nameEn: z.string().trim().min(2).max(80),
  nameAr: z.string().trim().min(1).max(80),
  descriptionAr: z.string().max(300).default(""),
  icon: z.string().max(40).default("BookOpen"),
  color: z.
  string().
  regex(/^#[0-9a-fA-F]{6}$/, "اللون يجب أن يكون بصيغة #RRGGBB").
  default("#22d3ee"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(999).default(0)
});

function toRow(input: z.infer<typeof categorySchema>) {
  return {
    slug: input.slug,
    name_en: input.nameEn,
    name_ar: input.nameAr,
    description_ar: input.descriptionAr,
    icon: input.icon,
    color: input.color,
    is_active: input.isActive,
    sort_order: input.sortOrder,
    updated_at: new Date().toISOString()
  };
}

export async function listCategoriesAction(): Promise<AdminResult<AdminCategory[]>> {
  try {
    await requireAdmin();
    return adminOk(await listCategories());
  } catch (err) {
    return adminFail(err);
  }
}

export async function saveCategoryAction(
categoryId: unknown,
input: unknown)
: Promise<AdminResult<{id: string;}>> {
  try {
    await assertSameOrigin();
    const identity = await requireAdmin();

    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
    }

    const admin = createAdminClient();
    const id = z.string().uuid().safeParse(categoryId);

    if (id.success) {
      const { error } = await admin.from("categories").update(toRow(parsed.data)).eq("id", id.data);
      if (error) return adminFail(error, "تعذر تحديث التصنيف");

      await logAdminActivity({
        actorId: identity.user.id,
        action: "category.updated",
        entity: "category",
        entityId: id.data,
        label: parsed.data.nameAr
      });

      revalidatePath("/admin/categories");
      return adminOk({ id: id.data });
    }

    const { data, error } = await admin.
    from("categories").
    insert(toRow(parsed.data)).
    select("id").
    single();

    if (error) return adminFail(error, "تعذر إنشاء التصنيف — تأكد أن المعرّف غير مستخدم");

    await logAdminActivity({
      actorId: identity.user.id,
      action: "category.created",
      entity: "category",
      entityId: String(data.id),
      label: parsed.data.nameAr
    });

    revalidatePath("/admin/categories");
    return adminOk({ id: String(data.id) });
  } catch (err) {
    return adminFail(err);
  }
}

export async function deleteCategoryAction(categoryId: unknown): Promise<AdminResult<null>> {
  try {
    await assertSameOrigin();
    const identity = await requireAdmin();

    const id = z.string().uuid().safeParse(categoryId);
    if (!id.success) return { ok: false, error: "معرّف تصنيف غير صالح" };

    const admin = createAdminClient();
    const { count } = await admin.
    from("stories").
    select("id", { count: "exact", head: true }).
    eq("category_id", id.data).
    is("deleted_at", null);

    if ((count ?? 0) > 0) {
      return {
        ok: false,
        error: `هذا التصنيف مستخدم في ${count} قصة — أخفِه بدلاً من حذفه`
      };
    }

    const { error } = await admin.from("categories").delete().eq("id", id.data);
    if (error) return adminFail(error, "تعذر حذف التصنيف");

    await logAdminActivity({
      actorId: identity.user.id,
      action: "category.deleted",
      entity: "category",
      entityId: id.data
    });

    revalidatePath("/admin/categories");
    return adminOk(null);
  } catch (err) {
    return adminFail(err);
  }
}