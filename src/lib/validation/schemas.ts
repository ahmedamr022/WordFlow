import { z } from "zod";

/**
 * القاعدة: كل Server Action تبدأ بـ schema.parse().
 * التحقق في المتصفح للتجربة فقط ولا يُوثق به أبداً.
 */

const CEFR = z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]);

export const emailSchema = z.
string().
trim().
toLowerCase().
email("بريد إلكتروني غير صالح").
max(254);

export const passwordSchema = z.
string().
min(8, "كلمة المرور 8 أحرف على الأقل").
max(72, "كلمة المرور طويلة جداً").
regex(/[A-Za-z]/, "يجب أن تحتوي على حرف واحد على الأقل").
regex(/[0-9]/, "يجب أن تحتوي على رقم واحد على الأقل");

export const nicknameSchema = z.
string().
trim().
min(2, "الاسم حرفان على الأقل").
max(50, "الاسم 50 حرفاً كحد أقصى");

// ── الحساب ─────────────────────────────────────────────────────────────────
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  nickname: nicknameSchema
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "كلمة المرور مطلوبة").max(72)
});

export const requestPasswordResetSchema = z.object({ email: emailSchema });

export const updatePasswordSchema = z.
object({ password: passwordSchema, confirm: z.string() }).
refine((v) => v.password === v.confirm, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirm"]
});

export const profileSchema = z.object({
  nickname: nicknameSchema.optional(),
  country: z.string().trim().max(60).optional(),
  native_language: z.string().trim().max(30).optional(),
  english_level: CEFR.optional(),
  avatar_url: z.string().url().max(500).optional(),
  timezone: z.string().trim().max(60).optional()
});

export const preferencesSchema = z.object({
  voice_id: z.string().trim().max(80).optional(),
  playback_speed: z.number().min(0.5).max(2).optional(),
  daily_goal_xp: z.number().int().min(10).max(1000).optional(),
  sound_enabled: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  email_notifications: z.boolean().optional()
});

export const placementTestSchema = z.object({
  answers: z.array(z.object({ questionId: z.string(), answer: z.string().max(500) })).max(100),
  score: z.number().int().min(0).max(1000),
  resulting_level: CEFR
});

// ── التقدم ─────────────────────────────────────────────────────────────────
export const lineAttemptSchema = z.object({
  lineId: z.string().uuid(),
  wpm: z.number().min(0).max(1000),
  accuracy: z.number().min(0).max(100),
  correctChars: z.number().int().min(0).max(5000),
  incorrectChars: z.number().int().min(0).max(5000),
  seconds: z.number().min(0.1).max(3600)
});

export const storyIdSchema = z.object({ storyId: z.string().uuid() });

export const wordReviewSchema = z.object({
  wordId: z.string().uuid(),
  correct: z.boolean()
});

export const vocabTestSchema = z.object({
  categoryId: z.string().uuid(),
  results: z.
  array(z.object({ wordId: z.string().uuid(), correct: z.boolean() })).
  min(1).
  max(200)
});

// ── هجرة localStorage ──────────────────────────────────────────────────────
export const importLocalProgressSchema = z.object({
  xpTotal: z.number().int().min(0).max(1_000_000),
  streakCount: z.number().int().min(0).max(3650),
  level: CEFR.optional(),
  completedStorySlugs: z.array(z.string().max(120)).max(500).default([]),
  learnedWords: z.array(z.string().max(80)).max(5000).default([])
});

// ── مدخلات راوتات الـ API ──────────────────────────────────────────────────
export const ttsRequestSchema = z.object({
  text: z.string().trim().min(1).max(600, "النص أطول من الحد المسموح"),
  voiceId: z.
  string().
  regex(/^[a-zA-Z0-9_-]{2,40}$/, "معرّف صوت غير مسموح")
});

export const explainRequestSchema = z.object({
  word: z.string().trim().min(1).max(80),
  context: z.string().trim().max(600).optional()
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LineAttemptInput = z.infer<typeof lineAttemptSchema>;
export type ImportLocalProgressInput = z.infer<typeof importLocalProgressSchema>;