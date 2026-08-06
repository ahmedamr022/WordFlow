import type { Json } from "@/types/database";

/**
 * جسر الأنواع بين واجهاتنا (interfaces) وأعمدة jsonb.
 *
 * المشكلة: `Json` في الأنواع المولَّدة يشترط index signature
 * (`{ [k: string]: Json | undefined }`)، و`interface` في TypeScript لا يحصل
 * على index signature ضمني أبداً — لذلك `StoryAppearance` و`StoryAccess`
 * و`Record<string, unknown>` تُرفض عند الكتابة في عمود jsonb رغم أن قيمتها
 * وقت التشغيل JSON صحيح 100%.
 *
 * الحل الصحيح هو تصريح واحد مركزي بدل عشرات الكاستات المتناثرة: كل ما يُكتب
 * في jsonb يمرّ من هنا، فيبقى موضع الخطر واضحاً وقابلاً للمراجعة.
 *
 * الاستعمال:
 *   appearance: toJson(normalizeAppearance(raw))
 *   meta: toJson({ status, sentences: 12 })
 */
export function toJson<T>(value: T): Json {
  return value as unknown as Json;
}

/** نفس الفكرة لكن يسمح بـ null (أعمدة jsonb القابلة للفراغ مثل `draft`). */
export function toJsonOrNull<T>(value: T | null | undefined): Json | null {
  if (value === null || value === undefined) return null;
  return toJson(value);
}

/** قراءة آمنة لكائن jsonb قادم من الداتابيز. */
export function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}