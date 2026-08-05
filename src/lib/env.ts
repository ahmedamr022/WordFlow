import { z } from "zod";

/**
 * التحقق من متغيرات البيئة وقت الإقلاع.
 * القاعدة: نفشل بصوت عالٍ بدل ما نشتغل بقيم وهمية بصمت.
 * ممنوع منعاً باتاً وجود أي قيمة احتياطية (fallback) لمفتاح حقيقي في الكود.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL يجب أن يكون رابطاً صالحاً"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(40, "NEXT_PUBLIC_SUPABASE_ANON_KEY مفقود أو قصير"),
  NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL مطلوب لتوجيهات OAuth وروابط إعادة التعيين")
});

const serverSchema = publicSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(40, "SUPABASE_SERVICE_ROLE_KEY مفقود"),
  GEMINI_API_KEY: z.string().min(10, "GEMINI_API_KEY مفقود"),
  ELEVENLABS_API_KEY: z.string().min(10).optional(),
  KOKORO_API_URL: z.string().url().optional()
});

export type PublicEnv = z.infer<typeof publicSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

function fail(issues: z.ZodIssue[]): never {
  const details = issues.map((i) => `  · ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`\n[env] إعدادات البيئة غير صالحة:\n${details}\n`);
}

let cachedPublic: PublicEnv | null = null;
let cachedServer: ServerEnv | null = null;

/** آمن للمتصفح والسيرفر. */
export function publicEnv(): PublicEnv {
  if (cachedPublic) return cachedPublic;
  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL
  });
  if (!parsed.success) fail(parsed.error.issues);
  cachedPublic = parsed.data;
  return cachedPublic;
}

/** سيرفر فقط — يرمي فوراً لو استُدعي في المتصفح. */
export function serverEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("[env] serverEnv() لا يجوز استدعاؤها من المتصفح");
  }
  if (cachedServer) return cachedServer;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) fail(parsed.error.issues);
  cachedServer = parsed.data;
  return cachedServer;
}