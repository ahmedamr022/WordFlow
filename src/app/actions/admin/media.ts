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
import { listStoryMedia } from "@/lib/admin/queries";
import type { AdminStoryMedia } from "@/types/admin";

/**
 * مكتبة الوسائط.
 *
 * الرفع يمرّ بالسيرفر لا مباشرة من المتصفح، لسببين:
 *   1. التحقق من النوع والحجم قبل أن يلمس الملف التخزين (منع ملفات ضخمة أو
 *      غير صور تُرفع من الواجهة).
 *   2. صف `story_media` والملف يُنشأان معاً، فلا تظهر «صورة يتيمة» في المكتبة.
 *
 * الأبعاد (width/height) تُقاس على العميل قبل الرفع وتُرسل معه — قياسها على
 * السيرفر يحتاج مكتبة صور كاملة بلا فائدة حقيقية هنا.
 */

const BUCKET = "story-media";
const MAX_BYTES = 6 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const uploadMetaSchema = z.object({
  storyId: z.string().uuid().nullable(),
  role: z.enum(["cover", "background", "scene", "modal"]).default("scene"),
  width: z.number().int().min(0).max(20000).nullable(),
  height: z.number().int().min(0).max(20000).nullable()
});

function extensionFor(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/avif") return "avif";
  return "jpg";
}

export async function uploadStoryMediaAction(
formData: FormData)
: Promise<AdminResult<AdminStoryMedia>> {
  try {
    await assertSameOrigin();
    const identity = await requireAdmin();

    const file = formData.get("file");
    if (!(file instanceof File)) return { ok: false, error: "لم يتم اختيار ملف" };
    if (file.size > MAX_BYTES) return { ok: false, error: "الحد الأقصى لحجم الصورة 6 ميجابايت" };
    if (!ALLOWED.includes(file.type)) {
      return { ok: false, error: "الصيغ المدعومة: JPG, PNG, WebP, AVIF" };
    }

    const meta = uploadMetaSchema.safeParse({
      storyId: formData.get("storyId") as string | null || null,
      role: formData.get("role") as string | null || "scene",
      width: formData.get("width") ? Number(formData.get("width")) : null,
      height: formData.get("height") ? Number(formData.get("height")) : null
    });
    if (!meta.success) return { ok: false, error: "بيانات الصورة غير صالحة" };

    const admin = createAdminClient();
    const folder = meta.data.storyId ?? "library";
    const path = `${folder}/${Date.now().toString(36)}-${Math.random().
    toString(36).
    slice(2, 8)}.${extensionFor(file.type)}`;

    const { error: uploadError } = await admin.storage.
    from(BUCKET).
    upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });

    if (uploadError) return adminFail(uploadError, "تعذر رفع الصورة");

    const {
      data: { publicUrl }
    } = admin.storage.from(BUCKET).getPublicUrl(path);

    const { data, error } = await admin.
    from("story_media").
    insert({
      story_id: meta.data.storyId,
      url: publicUrl,
      role: meta.data.role,
      width: meta.data.width,
      height: meta.data.height,
      bytes: file.size,
      mime: file.type,
      created_by: identity.user.id
    }).
    select("id, story_id, url, role, width, height, bytes, sort_order, created_at").
    single();

    if (error) {
      // تنظيف: لا نترك ملفاً بلا صف.
      await admin.storage.from(BUCKET).remove([path]);
      return adminFail(error, "تعذر تسجيل الصورة في المكتبة");
    }

    await logAdminActivity({
      actorId: identity.user.id,
      action: "media.uploaded",
      entity: "media",
      entityId: String(data.id),
      label: file.name
    });

    revalidatePath("/admin/media");

    return adminOk({
      id: String(data.id),
      storyId: String(data.story_id ?? ""),
      url: String(data.url),
      role: data.role as AdminStoryMedia["role"],
      width: data.width === null ? null : Number(data.width),
      height: data.height === null ? null : Number(data.height),
      bytes: data.bytes === null ? null : Number(data.bytes),
      sortOrder: Number(data.sort_order ?? 0),
      createdAt: String(data.created_at)
    });
  } catch (err) {
    return adminFail(err);
  }
}

export async function deleteStoryMediaAction(mediaId: unknown): Promise<AdminResult<null>> {
  try {
    await assertSameOrigin();
    const identity = await requireAdmin();

    const id = z.string().uuid().safeParse(mediaId);
    if (!id.success) return { ok: false, error: "معرّف صورة غير صالح" };

    const admin = createAdminClient();
    const { data } = await admin.
    from("story_media").
    select("url").
    eq("id", id.data).
    maybeSingle();

    const { error } = await admin.from("story_media").delete().eq("id", id.data);
    if (error) return adminFail(error, "تعذر حذف الصورة");

    // نحذف الملف فقط إن كان مرفوعاً عندنا (الصور القديمة في public/ تبقى).
    const url = String(data?.url ?? "");
    const marker = `/${BUCKET}/`;
    const index = url.indexOf(marker);
    if (index > -1) {
      await admin.storage.from(BUCKET).remove([url.slice(index + marker.length)]);
    }

    await logAdminActivity({
      actorId: identity.user.id,
      action: "media.deleted",
      entity: "media",
      entityId: id.data
    });

    revalidatePath("/admin/media");
    return adminOk(null);
  } catch (err) {
    return adminFail(err);
  }
}

export async function reorderStoryMediaAction(
storyId: unknown,
orderedIds: unknown)
: Promise<AdminResult<null>> {
  try {
    await assertSameOrigin();
    await requireAdmin();

    const id = z.string().uuid().safeParse(storyId);
    const ids = z.array(z.string().uuid()).max(60).safeParse(orderedIds);
    if (!id.success || !ids.success) return { ok: false, error: "طلب غير صالح" };

    const admin = createAdminClient();
    await Promise.all(
      ids.data.map((mediaId, index) =>
      admin.
      from("story_media").
      update({ sort_order: index }).
      eq("id", mediaId).
      eq("story_id", id.data)
      )
    );

    return adminOk(null);
  } catch (err) {
    return adminFail(err);
  }
}

export async function listMediaAction(
storyId?: unknown)
: Promise<AdminResult<AdminStoryMedia[]>> {
  try {
    await requireAdmin();
    const id = z.string().uuid().safeParse(storyId);
    return adminOk(await listStoryMedia(id.success ? id.data : null));
  } catch (err) {
    return adminFail(err);
  }
}