import type { CefrLevel } from "@/types/database";

/**
 * مستويات CEFR كقيمة واحدة معروفة للتطبيق كله.
 *
 * عمود `stories.cefr_level` من نوع enum في Postgres، فالمولّد يعطيه اتحاداً
 * صارماً. أي `string` قادم من نموذج أو من الـ URL يجب أن يمرّ من هنا قبل أن
 * يُكتب أو يُستعمل في فلتر — وإلا يرفضه TypeScript (وهو محقّ: قيمة خاطئة
 * تعني خطأ 22P02 من الداتابيز في وقت التشغيل).
 */

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export const CEFR_LABELS: Record<CefrLevel, string> = {
  A1: "مبتدئ",
  A2: "مبتدئ+",
  B1: "متوسط",
  B2: "متوسط عالٍ",
  C1: "متقدم",
  C2: "متقدم عالٍ"
};

export const CEFR_COLORS: Record<CefrLevel, string> = {
  A1: "#22d3ee",
  A2: "#a855f7",
  B1: "#34d399",
  B2: "#f43f5e",
  C1: "#f59e0b",
  C2: "#60a5fa"
};

export function isCefrLevel(value: unknown): value is CefrLevel {
  return typeof value === "string" && (CEFR_LEVELS as readonly string[]).includes(value);
}

/** يحوّل أي نص إلى مستوى صالح، مع افتراضي آمن. */
export function asCefrLevel(value: unknown, fallback: CefrLevel = "B1"): CefrLevel {
  if (isCefrLevel(value)) return value;
  if (typeof value === "string" && isCefrLevel(value.toUpperCase())) {
    return value.toUpperCase() as CefrLevel;
  }
  return fallback;
}

/** للفلاتر: يرجّع `null` عند "الكل" بدل تمرير قيمة وهمية للاستعلام. */
export function asCefrFilter(value: unknown): CefrLevel | null {
  if (!value || value === "all") return null;
  return isCefrLevel(value) ? value : null;
}

export function levelLabel(value: unknown): string {
  return isCefrLevel(value) ? CEFR_LABELS[value] : "غير محدد";
}

export function levelColor(value: unknown): string {
  return isCefrLevel(value) ? CEFR_COLORS[value] : "#64748b";
}