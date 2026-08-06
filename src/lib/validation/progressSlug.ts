import { z } from "zod";

/**
 * مخططات التقدّم المرتبط بالمحتوى الثابت (slug/نص) بدل UUID.
 *
 * وُضعت في ملف مستقل عمداً حتى لا نضطر للكتابة فوق `schemas.ts` كاملاً —
 * الملف الأصلي يبقى كما هو، وهذه إضافة صرفة.
 */

const CEFR = z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]);

/** بذرة الكلمة: تسمح للسيرفر بإنشاء صف `words` عند أول تفاعل حقيقي. */
export const wordSeedSchema = z.object({
  translationAr: z.string().trim().max(200).optional(),
  ipa: z.string().trim().max(120).optional(),
  cefrLevel: CEFR.optional(),
  exampleEn: z.string().trim().max(400).optional(),
  exampleAr: z.string().trim().max(400).optional()
});

export const wordReviewByTextSchema = z.object({
  word: z.string().trim().min(1).max(80),
  partOfSpeech: z.string().trim().max(30).optional(),
  correct: z.boolean().default(true),
  seed: wordSeedSchema.optional()
});

export const lineAttemptBySlugSchema = z.object({
  storySlug: z.string().trim().min(1).max(120),
  storyTitleEn: z.string().trim().max(160).optional(),
  storyTitleAr: z.string().trim().max(160).optional(),
  cefrLevel: CEFR.optional(),
  lineIndex: z.number().int().min(0).max(5000),
  lineText: z.string().trim().min(1).max(1000),
  translationAr: z.string().trim().max(1000).optional(),
  wpm: z.number().min(0).max(1000),
  accuracy: z.number().min(0).max(100),
  correctChars: z.number().int().min(0).max(5000),
  incorrectChars: z.number().int().min(0).max(5000),
  seconds: z.number().min(0.1).max(3600)
});

export const completeStoryBySlugSchema = z.object({
  storySlug: z.string().trim().min(1).max(120),
  storyTitleEn: z.string().trim().max(160).optional(),
  storyTitleAr: z.string().trim().max(160).optional(),
  cefrLevel: CEFR.optional()
});

export type WordSeedInput = z.infer<typeof wordSeedSchema>;
export type WordReviewByTextInput = z.infer<typeof wordReviewByTextSchema>;
export type LineAttemptBySlugInput = z.infer<typeof lineAttemptBySlugSchema>;
export type CompleteStoryBySlugInput = z.infer<typeof completeStoryBySlugSchema>;