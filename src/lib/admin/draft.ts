import { z } from "zod";

import type { AdminStory } from "@/types/admin";

/**
 * عقد المسودة (Draft) بين محرّر الاستوديو والسيرفر.
 *
 * يعيش في lib لا داخل ملف `"use server"` لأن ملفات Server Actions لا يجوز أن
 * تُصدِّر إلا دوالاً async — ومع ذلك نحتاج نفس المخطط (schema) على العميل
 * للتحقق الفوري قبل الإرسال. مخطط واحد = لا فرصة لاختلاف القواعد بين الجهتين.
 *
 * تحديث هذه الدفعة:
 *   · `fit` صار أربعة أوضاع، و`scale` حتى 3، وأُضيف `blur`.
 *   · `imageUrl` / `coverImage` / `bgImage` صارت 1000 حرفاً بدل 500 — روابط
 *     Supabase Storage الطويلة (اسم مشروع + مجلد قصة + hash) كانت تقترب من
 *     الحدّ القديم فيفشل الحفظ التلقائي برسالة «بيانات غير صالحة» غامضة.
 *   · نرفض صراحةً روابط base64 (`data:`) مع رسالة مفهومة — سببها الحقيقي أن
 *     الصورة لم تُرفَع بعد، وحفظها كنص هو ما كان يفجّر حد 1MB في السيرفر.
 */

const imagePath = z.
string().
max(1000, "مسار الصورة طويل جداً").
refine((value) => !value.startsWith("data:"), {
  message: "ارفع الصورة أولاً من تبويب الوسائط بدل لصقها كـ base64"
}).
nullable();

export const surfaceSchema = z.object({
  imageUrl: imagePath,
  positionX: z.number().min(0).max(100),
  positionY: z.number().min(0).max(100),
  scale: z.number().min(1).max(3),
  brightness: z.number().min(0.4).max(1.6),
  contrast: z.number().min(0.4).max(1.6),
  saturation: z.number().min(0).max(2),
  overlay: z.number().min(0).max(100),
  fit: z.enum(["cover", "contain", "width", "height"]),
  blur: z.boolean().default(true)
});

export const sentenceSchema = z.object({
  id: z.string().max(64),
  lineIndex: z.number().int().min(0).max(2000),
  text: z.string().trim().min(1, "الجملة لا يمكن أن تكون فارغة").max(600),
  translationAr: z.string().max(800).default(""),
  level: z.string().max(8).default(""),
  vocabulary: z.array(z.string().max(60)).max(24).default([])
});

export const draftSchema = z.object({
  titleEn: z.string().trim().min(1, "العنوان الإنجليزي مطلوب").max(160),
  titleAr: z.string().trim().max(160).default(""),
  descriptionEn: z.string().max(1200).default(""),
  descriptionAr: z.string().max(1200).default(""),
  categoryId: z.string().uuid().nullable(),
  cefrLevel: z.string().max(8),
  difficulty: z.string().max(24),
  estimatedMinutes: z.number().int().min(1).max(240),
  xpReward: z.number().int().min(0).max(2000),
  coverImage: imagePath,
  bgImage: imagePath,
  status: z.enum(["published", "draft", "locked"]),
  access: z.object({
    locked: z.boolean(),
    lockType: z.enum(["hidden", "visible"]),
    lockMessage: z.string().max(240)
  }),
  appearance: z.object({
    storyPage: surfaceSchema,
    modal: surfaceSchema,
    storyToday: surfaceSchema,
    card: surfaceSchema
  }),
  seo: z.object({
    slug: z.
    string().
    trim().
    min(1).
    max(120).
    regex(/^[a-z0-9-]+$/, "المعرّف: حروف إنجليزية صغيرة وأرقام وشرطات فقط"),
    metaTitle: z.string().max(180).default(""),
    metaDescription: z.string().max(400).default("")
  }),
  sentences: z.array(sentenceSchema).max(600)
});

export type StoryDraft = z.infer<typeof draftSchema>;

/** القصة الكاملة → شكل المسودة. نقطة البداية لكل جلسة تحرير. */
export function toDraft(story: AdminStory): StoryDraft {
  return {
    titleEn: story.titleEn,
    titleAr: story.titleAr,
    descriptionEn: story.descriptionEn,
    descriptionAr: story.descriptionAr,
    categoryId: story.categoryId,
    cefrLevel: story.cefrLevel,
    difficulty: story.difficulty,
    estimatedMinutes: story.estimatedMinutes,
    xpReward: story.xpReward,
    coverImage: story.coverImage,
    bgImage: story.bgImage,
    status: story.status,
    access: story.access,
    appearance: story.appearance,
    seo: story.seo,
    sentences: story.sentences
  };
}

export function slugify(value: string): string {
  return (
    value.
    toLowerCase().
    trim().
    replace(/[^a-z0-9\s-]/g, "").
    replace(/\s+/g, "-").
    replace(/-+/g, "-").
    slice(0, 90) || `story-${Date.now().toString(36)}`);

}

/** مقارنة سطحية سريعة لمعرفة «هل هناك تغييرات غير محفوظة؟» بدون deep-equal ثقيل. */
export function draftFingerprint(draft: StoryDraft): string {
  return JSON.stringify(draft);
}

/**
 * رسالة خطأ مفهومة من أخطاء zod.
 * قبلها كانت الواجهة تقول «بيانات غير صالحة» فقط، فلا يعرف الأدمن أي حقل.
 */
export function describeDraftIssues(error: z.ZodError): string {
  const first = error.issues[0];
  if (!first) return "بيانات غير صالحة";
  const path = first.path.join(" › ");
  return path ? `${path}: ${first.message}` : first.message;
}