import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminActivity, requireAdmin } from "@/lib/auth/admin";
import type { AdminStoryMedia } from "@/types/admin";

/**
 * رفع صور القصص — Route Handler لا Server Action.
 *
 * سبب هذا الملف هو الخطأ الذي كان يظهر حرفياً في المشروع:
 *   «Body exceeded 1 MB limit … serverActions#bodySizeLimit»
 *
 * Server Actions في Next.js محدودة بـ 1MB للجسم (request body) افتراضياً،
 * والرفع كان يمرّ عبر `uploadStoryMediaAction` بـ FormData. أي صورة غلاف
 * حقيقية (٢–٥ ميجا) كانت تُرفض **قبل** أن يعمل تحققنا الخاص الذي يسمح بـ 6MB،
 * فتبدو النتيجة كأن الأدمن «لا يحفظ الصور ولا يعدّلها».
 *
 * Route Handlers ليست محدودة بهذا السقف، فالرفع يعمل حتى 15MB هنا. مع ذلك
 * أبقينا حداً صريحاً + تحقّق نوع، ولا نزال ننشئ صف `story_media` مع الملف حتى
 * لا تظهر «صورة يتيمة» في المكتبة.
 *
 * ملاحظة: العميل (`useMediaUpload`) يضغط الصور الكبيرة قبل الرفع، فالمستخدم
 * لن يصل لهذا الحد عملياً — لكن الحد موجود كخط دفاع أخير.
 */

const BUCKET = "story-media";
const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const metaSchema = z.object({
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

function fail(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

/** حماية CSRF بسيطة: الطلب يجب أن يأتي من نفس الأصل. */
function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // بعض المتصفحات لا ترسل origin لطلبات same-origin
  const host = request.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) return fail("طلب غير مصرّح به", 403);

    const identity = await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return fail("لم يتم اختيار ملف");
    if (file.size === 0) return fail("الملف فارغ");
    if (file.size > MAX_BYTES) return fail("الحد الأقصى لحجم الصورة 15 ميجابايت");
    if (!ALLOWED.includes(file.type)) {
      return fail("الصيغ المدعومة: JPG, PNG, WebP, AVIF");
    }

    const meta = metaSchema.safeParse({
      storyId: formData.get("storyId") as string | null || null,
      role: formData.get("role") as string | null || "scene",
      width: formData.get("width") ? Number(formData.get("width")) : null,
      height: formData.get("height") ? Number(formData.get("height")) : null
    });
    if (!meta.success) return fail("بيانات الصورة غير صالحة");

    const admin = createAdminClient();
    const folder = meta.data.storyId ?? "library";
    const path = `${folder}/${Date.now().toString(36)}-${Math.random().
    toString(36).
    slice(2, 8)}.${extensionFor(file.type)}`;

    const { error: uploadError } = await admin.storage.
    from(BUCKET).
    upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });

    if (uploadError) return fail(`تعذر رفع الصورة: ${uploadError.message}`, 500);

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
      return fail(`تعذر تسجيل الصورة في المكتبة: ${error.message}`, 500);
    }

    await logAdminActivity({
      actorId: identity.user.id,
      action: "media.uploaded",
      entity: "media",
      entityId: String(data.id),
      label: file.name
    });

    revalidatePath("/admin/media");

    const item: AdminStoryMedia = {
      id: String(data.id),
      storyId: String(data.story_id ?? ""),
      url: String(data.url),
      role: data.role as AdminStoryMedia["role"],
      width: data.width === null ? null : Number(data.width),
      height: data.height === null ? null : Number(data.height),
      bytes: data.bytes === null ? null : Number(data.bytes),
      sortOrder: Number(data.sort_order ?? 0),
      createdAt: String(data.created_at)
    };

    return NextResponse.json({ ok: true, data: item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "تعذر رفع الصورة";
    return fail(message, 500);
  }
}