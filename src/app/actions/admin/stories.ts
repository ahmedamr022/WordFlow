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
import { getStoryForAdmin, listStoryVersions } from "@/lib/admin/queries";
import { draftSchema, slugify, toDraft, type StoryDraft } from "@/lib/admin/draft";
import { defaultAppearance, normalizeAppearance } from "@/lib/stories/appearance";
import { asCefrLevel } from "@/lib/admin/level";
import { toJson } from "@/lib/json";
import { SURFACE_KEYS } from "@/types/admin";
import type { AdminStoryVersion } from "@/types/admin";

/**
 * كتابة القصص من Admin Studio.
 *
 * نموذج العمل: **Draft → Preview → Publish** (لا كتابة مباشرة على المنشور).
 *   · `saveStoryDraftAction`  → autosave كل تغيير في عمود `stories.draft` (jsonb).
 *   · `publishStoryAction`    → ينسخ المسودة إلى الأعمدة الحقيقية، يزامن الجُمل،
 *     يأخذ Snapshot في `story_versions`، ثم يُبطل الكاش للصفحات المتأثرة فقط.
 *
 * ملاحظتان على الأنواع (كانتا مصدر 8 أخطاء typecheck):
 *   · كل قيمة تُكتب في عمود jsonb تمرّ بـ `toJson()` — الأنواع المولَّدة تشترط
 *     index signature لا تملكه الـ interfaces.
 *   · `cefr_level` عمود enum، فأي نص من نموذج يمرّ بـ `asCefrLevel()`.
 */

const idSchema = z.string().uuid("معرّف قصة غير صالح");

function bustCaches(slug: string): void {
  revalidatePath("/dashboard");
  revalidatePath("/stories");
  revalidatePath(`/story/${slug}`);
  revalidatePath("/admin/stories");
}

// ── إنشاء ────────────────────────────────────────────────────────────────────

export async function createStoryAction(input: unknown): Promise<AdminResult<{slug: string;}>> {
  try {
    await assertSameOrigin();
    const identity = await requireAdmin();

    const parsed = z.
    object({
      titleEn: z.string().trim().min(2).max(160),
      titleAr: z.string().trim().max(160).default(""),
      categoryId: z.string().uuid().nullable().default(null),
      // نقبل أي نص هنا ثم نضيّقه بـ asCefrLevel — أبسط من ربط zod بشكل enum
      // قد يتغير في الداتابيز، والنتيجة واحدة: قيمة صالحة أو الافتراضي.
      cefrLevel: z.string().max(8).default("B1")
    }).
    safeParse(input);

    if (!parsed.success) return { ok: false, error: "بيانات القصة غير مكتملة" };

    const admin = createAdminClient();
    const slug = slugify(parsed.data.titleEn);

    const { data, error } = await admin.
    from("stories").
    insert({
      slug,
      title_en: parsed.data.titleEn,
      title_ar: parsed.data.titleAr,
      category_id: parsed.data.categoryId,
      cefr_level: asCefrLevel(parsed.data.cefrLevel),
      status: "draft",
      is_published: false,
      appearance: toJson(defaultAppearance()),
      updated_by: identity.user.id
    }).
    select("id, slug").
    single();

    if (error) return adminFail(error, "تعذر إنشاء القصة — تأكد أن المعرّف غير مستخدم");

    await logAdminActivity({
      actorId: identity.user.id,
      action: "story.created",
      entity: "story",
      entityId: String(data.id),
      label: parsed.data.titleEn
    });

    revalidatePath("/admin/stories");
    return adminOk({ slug: String(data.slug) });
  } catch (err) {
    return adminFail(err);
  }
}

// ── حفظ المسودة (Autosave) ───────────────────────────────────────────────────

export async function saveStoryDraftAction(
storyId: unknown,
draft: unknown)
: Promise<AdminResult<{savedAt: string;}>> {
  try {
    await assertSameOrigin();
    const identity = await requireAdmin();

    const id = idSchema.safeParse(storyId);
    if (!id.success) return { ok: false, error: id.error.issues[0]?.message ?? "معرّف غير صالح" };

    const parsed = draftSchema.safeParse(draft);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
    }

    const admin = createAdminClient();
    const savedAt = new Date().toISOString();
    const { error } = await admin.
    from("stories").
    update({
      draft: toJson({ ...parsed.data, savedAt }),
      updated_by: identity.user.id
    }).
    eq("id", id.data);

    if (error) return adminFail(error, "تعذر حفظ المسودة");
    return adminOk({ savedAt });
  } catch (err) {
    return adminFail(err);
  }
}

// ── النشر ────────────────────────────────────────────────────────────────────

export async function publishStoryAction(
storyId: unknown,
draft: unknown,
summary?: unknown)
: Promise<AdminResult<{slug: string;}>> {
  try {
    await assertSameOrigin();
    const identity = await requireAdmin();

    const id = idSchema.safeParse(storyId);
    if (!id.success) return { ok: false, error: "معرّف قصة غير صالح" };

    const parsed = draftSchema.safeParse(draft);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
    }

    const admin = createAdminClient();
    const data = parsed.data;

    // 1) Snapshot للحالة الحالية قبل الكتابة — أساس «الرجوع لإصدار سابق».
    const previous = await getStoryForAdmin(id.data);
    if (previous) {
      const { data: versionNumber } = await admin.rpc("next_story_version", {
        p_story_id: id.data
      });
      await admin.from("story_versions").insert({
        story_id: id.data,
        version: Number(versionNumber ?? 1),
        snapshot: toJson(toDraft(previous)),
        summary:
        typeof summary === "string" && summary.trim() !== "" ?
        summary.trim().slice(0, 240) :
        "تحديث القصة",
        created_by: identity.user.id
      });
    }

    // 2) الأعمدة الحقيقية.
    const { error: storyError } = await admin.
    from("stories").
    update({
      slug: data.seo.slug,
      title_en: data.titleEn,
      title_ar: data.titleAr,
      description_en: data.descriptionEn,
      description_ar: data.descriptionAr,
      category_id: data.categoryId,
      cefr_level: asCefrLevel(data.cefrLevel),
      difficulty: data.difficulty,
      estimated_minutes: data.estimatedMinutes,
      xp_reward: data.xpReward,
      cover_image: data.coverImage,
      bg_image: data.bgImage,
      status: data.status,
      is_published: data.status === "published",
      access: toJson(data.access),
      appearance: toJson(normalizeAppearance(data.appearance)),
      seo: toJson(data.seo),
      draft: null,
      updated_by: identity.user.id,
      updated_at: new Date().toISOString()
    }).
    eq("id", id.data);

    if (storyError) return adminFail(storyError, "تعذر نشر القصة");

    // 3) مزامنة الجُمل: upsert للموجود، وحذف الزائد فقط.
    if (data.sentences.length > 0) {
      const rows = data.sentences.
      slice().
      sort((a, b) => a.lineIndex - b.lineIndex).
      map((sentence, index) => ({
        story_id: id.data,
        line_index: index,
        text: sentence.text,
        translation_ar: sentence.translationAr,
        level: sentence.level || data.cefrLevel,
        vocabulary: toJson(sentence.vocabulary)
      }));

      const { error: linesError } = await admin.
      from("story_lines").
      upsert(rows, { onConflict: "story_id,line_index" });

      if (linesError) return adminFail(linesError, "تعذر حفظ جُمل القصة");
    }

    const { error: pruneError } = await admin.
    from("story_lines").
    delete().
    eq("story_id", id.data).
    gte("line_index", data.sentences.length);

    if (pruneError) console.error("[admin:prune-lines]", pruneError.message);

    await logAdminActivity({
      actorId: identity.user.id,
      action: "story.published",
      entity: "story",
      entityId: id.data,
      label: data.titleEn,
      meta: { status: data.status, sentences: data.sentences.length }
    });

    bustCaches(data.seo.slug);
    if (previous && previous.slug !== data.seo.slug) bustCaches(previous.slug);

    return adminOk({ slug: data.seo.slug });
  } catch (err) {
    return adminFail(err);
  }
}

// ── الحالة والقفل ────────────────────────────────────────────────────────────

export async function setStoryStatusAction(
storyId: unknown,
status: unknown)
: Promise<AdminResult<{status: string;}>> {
  try {
    await assertSameOrigin();
    const identity = await requireAdmin();

    const id = idSchema.safeParse(storyId);
    const nextStatus = z.enum(["published", "draft", "locked"]).safeParse(status);
    if (!id.success || !nextStatus.success) return { ok: false, error: "طلب غير صالح" };

    const admin = createAdminClient();
    const { data: current } = await admin.
    from("stories").
    select("slug, title_en, access").
    eq("id", id.data).
    maybeSingle();

    const access = (current?.access ?? {}) as Record<string, unknown>;
    const { error } = await admin.
    from("stories").
    update({
      status: nextStatus.data,
      is_published: nextStatus.data === "published",
      access: toJson({ ...access, locked: nextStatus.data === "locked" }),
      updated_by: identity.user.id,
      updated_at: new Date().toISOString()
    }).
    eq("id", id.data);

    if (error) return adminFail(error, "تعذر تحديث حالة القصة");

    await logAdminActivity({
      actorId: identity.user.id,
      action: nextStatus.data === "locked" ? "story.locked" : `story.${nextStatus.data}`,
      entity: "story",
      entityId: id.data,
      label: String(current?.title_en ?? "")
    });

    if (current?.slug) bustCaches(String(current.slug));
    return adminOk({ status: nextStatus.data });
  } catch (err) {
    return adminFail(err);
  }
}

export async function updateStoryAccessAction(
storyId: unknown,
access: unknown)
: Promise<AdminResult<{locked: boolean;}>> {
  try {
    await assertSameOrigin();
    const identity = await requireAdmin();

    const id = idSchema.safeParse(storyId);
    const parsed = z.
    object({
      locked: z.boolean(),
      lockType: z.enum(["hidden", "visible"]),
      lockMessage: z.string().max(240)
    }).
    safeParse(access);

    if (!id.success || !parsed.success) return { ok: false, error: "طلب غير صالح" };

    const admin = createAdminClient();
    const { data: current } = await admin.
    from("stories").
    select("slug, title_en, status").
    eq("id", id.data).
    maybeSingle();

    const nextStatus = parsed.data.locked ?
    "locked" :
    current?.status === "locked" ?
    "published" :
    String(current?.status ?? "published");

    const { error } = await admin.
    from("stories").
    update({
      access: toJson(parsed.data),
      status: nextStatus,
      is_published: nextStatus === "published",
      updated_by: identity.user.id,
      updated_at: new Date().toISOString()
    }).
    eq("id", id.data);

    if (error) return adminFail(error, "تعذر تحديث صلاحية الوصول");

    await logAdminActivity({
      actorId: identity.user.id,
      action: parsed.data.locked ? "story.locked" : "story.unlocked",
      entity: "story",
      entityId: id.data,
      label: String(current?.title_en ?? "")
    });

    if (current?.slug) bustCaches(String(current.slug));
    return adminOk({ locked: parsed.data.locked });
  } catch (err) {
    return adminFail(err);
  }
}

// ── تكرار وحذف ───────────────────────────────────────────────────────────────

export async function duplicateStoryAction(
storyId: unknown)
: Promise<AdminResult<{slug: string;}>> {
  try {
    await assertSameOrigin();
    const identity = await requireAdmin();

    const id = idSchema.safeParse(storyId);
    if (!id.success) return { ok: false, error: "معرّف قصة غير صالح" };

    const source = await getStoryForAdmin(id.data);
    if (!source) return { ok: false, error: "القصة غير موجودة" };

    const admin = createAdminClient();
    const slug = slugify(`${source.slug}-copy-${Date.now().toString(36).slice(-4)}`);

    const { data: created, error } = await admin.
    from("stories").
    insert({
      slug,
      title_en: `${source.titleEn} (Copy)`,
      title_ar: source.titleAr,
      description_en: source.descriptionEn,
      description_ar: source.descriptionAr,
      category_id: source.categoryId,
      cefr_level: asCefrLevel(source.cefrLevel),
      difficulty: source.difficulty,
      estimated_minutes: source.estimatedMinutes,
      xp_reward: source.xpReward,
      cover_image: source.coverImage,
      bg_image: source.bgImage,
      status: "draft",
      is_published: false,
      access: toJson(source.access),
      appearance: toJson(source.appearance),
      updated_by: identity.user.id
    }).
    select("id, slug").
    single();

    if (error) return adminFail(error, "تعذر تكرار القصة");

    if (source.sentences.length > 0) {
      await admin.from("story_lines").insert(
        source.sentences.map((sentence, index) => ({
          story_id: created.id,
          line_index: index,
          text: sentence.text,
          translation_ar: sentence.translationAr,
          level: sentence.level,
          vocabulary: toJson(sentence.vocabulary)
        }))
      );
    }

    await logAdminActivity({
      actorId: identity.user.id,
      action: "story.duplicated",
      entity: "story",
      entityId: String(created.id),
      label: source.titleEn
    });

    revalidatePath("/admin/stories");
    return adminOk({ slug: String(created.slug) });
  } catch (err) {
    return adminFail(err);
  }
}

/**
 * حذف ناعم (soft delete): نضع `deleted_at` ولا نمسّ صفاً واحداً من تقدّم
 * المستخدمين. حذف نهائي لقصة يعني تدمير تقدم قد يكون لمئات الحسابات.
 */
export async function deleteStoryAction(storyId: unknown): Promise<AdminResult<null>> {
  try {
    await assertSameOrigin();
    const identity = await requireAdmin();

    const id = idSchema.safeParse(storyId);
    if (!id.success) return { ok: false, error: "معرّف قصة غير صالح" };

    const admin = createAdminClient();
    const { data: current } = await admin.
    from("stories").
    select("slug, title_en").
    eq("id", id.data).
    maybeSingle();

    const { error } = await admin.
    from("stories").
    update({
      deleted_at: new Date().toISOString(),
      status: "draft",
      is_published: false,
      updated_by: identity.user.id
    }).
    eq("id", id.data);

    if (error) return adminFail(error, "تعذر حذف القصة");

    await logAdminActivity({
      actorId: identity.user.id,
      action: "story.deleted",
      entity: "story",
      entityId: id.data,
      label: String(current?.title_en ?? "")
    });

    if (current?.slug) bustCaches(String(current.slug));
    return adminOk(null);
  } catch (err) {
    return adminFail(err);
  }
}

// ── الإصدارات ────────────────────────────────────────────────────────────────

export async function getStoryVersionsAction(
storyId: unknown)
: Promise<AdminResult<AdminStoryVersion[]>> {
  try {
    await requireAdmin();
    const id = idSchema.safeParse(storyId);
    if (!id.success) return { ok: false, error: "معرّف قصة غير صالح" };
    return adminOk(await listStoryVersions(id.data));
  } catch (err) {
    return adminFail(err);
  }
}

export async function restoreStoryVersionAction(
storyId: unknown,
versionId: unknown)
: Promise<AdminResult<StoryDraft>> {
  try {
    await assertSameOrigin();
    const identity = await requireAdmin();

    const id = idSchema.safeParse(storyId);
    const vId = z.string().uuid().safeParse(versionId);
    if (!id.success || !vId.success) return { ok: false, error: "طلب غير صالح" };

    const admin = createAdminClient();
    const { data, error } = await admin.
    from("story_versions").
    select("snapshot, version").
    eq("id", vId.data).
    eq("story_id", id.data).
    maybeSingle();

    if (error || !data) return { ok: false, error: "الإصدار غير موجود" };

    const parsed = draftSchema.safeParse(data.snapshot);
    if (!parsed.success) return { ok: false, error: "هذا الإصدار قديم ولا يمكن قراءته" };

    // الاستعادة تعود كمسودة: الأدمن يعاينها ثم ينشرها بنفسه.
    await admin.
    from("stories").
    update({ draft: toJson(parsed.data), updated_by: identity.user.id }).
    eq("id", id.data);

    await logAdminActivity({
      actorId: identity.user.id,
      action: "story.version_restored",
      entity: "story",
      entityId: id.data,
      label: `v${data.version}`
    });

    return adminOk(parsed.data);
  } catch (err) {
    return adminFail(err);
  }
}

/** يضمن أن كل قصة تحمل إعدادات مظهر كاملة — يُستدعى مرة عند فتح الاستوديو. */
export async function ensureAppearanceAction(storyId: unknown): Promise<AdminResult<null>> {
  try {
    await requireAdmin();
    const id = idSchema.safeParse(storyId);
    if (!id.success) return { ok: false, error: "معرّف قصة غير صالح" };

    const admin = createAdminClient();
    const { data } = await admin.
    from("stories").
    select("appearance").
    eq("id", id.data).
    maybeSingle();

    const raw = (data?.appearance ?? {}) as Record<string, unknown>;
    const missing = SURFACE_KEYS.some((key) => !raw[key]);
    if (missing) {
      await admin.
      from("stories").
      update({ appearance: toJson(normalizeAppearance(raw)) }).
      eq("id", id.data);
    }
    return adminOk(null);
  } catch (err) {
    return adminFail(err);
  }
}