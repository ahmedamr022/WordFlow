
import type { ImportLocalProgressInput } from "@/lib/validation/schemas";

/** كل مفاتيح localStorage من النسخة القديمة — تُقرأ مرة ثم تُمسح نهائياً. */
export const LEGACY_STORAGE_KEYS = [
  "wordflow_user_stats_v2",
  "wordflow_learned_words",
  "wordflow_level",
  "wordflow_nickname",
  "wordflow_user_email",
  "wordflow_user_logged",
  "wordflow_completed_stories",
] as const;

const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type Cefr = (typeof CEFR)[number];

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    : [];
}

function toCount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : 0;
}

/**
 * يقرأ التقدم القديم من المتصفح مرة واحدة.
 * يرجع null إذا لم يوجد شيء يستحق الهجرة، حتى لا نستدعي السيرفر بلا داع.
 */
export function readLegacyProgress(): ImportLocalProgressInput | null {
  if (typeof window === "undefined") return null;

  const stats = readJson<Record<string, unknown>>("wordflow_user_stats_v2") ?? {};
  const learnedFromKey = toStringArray(readJson("wordflow_learned_words"));
  const learnedFromStats = toStringArray(stats.learnedWords);
  const completed = [
    ...toStringArray(stats.completedStoryIds),
    ...toStringArray(readJson("wordflow_completed_stories")),
  ];

  const rawLevel =
    (typeof stats.level === "string" ? stats.level : null) ??
    window.localStorage.getItem("wordflow_level");
  const level = CEFR.includes(rawLevel as Cefr) ? (rawLevel as Cefr) : undefined;

  const payload: ImportLocalProgressInput = {
    xpTotal: Math.min(toCount(stats.xpTotal), 1_000_000),
    streakCount: Math.min(toCount(stats.streakCount), 3650),
    level,
    completedStorySlugs: Array.from(new Set(completed)).slice(0, 500),
    learnedWords: Array.from(
      new Set([...learnedFromKey, ...learnedFromStats].map((w) => w.trim().toLowerCase()))
    ).slice(0, 5000),
  };

  const hasSomething =
    payload.xpTotal > 0 ||
    payload.streakCount > 0 ||
    payload.completedStorySlugs.length > 0 ||
    payload.learnedWords.length > 0;

  return hasSomething ? payload : null;
}

/** يمسح كل بقايا النسخة المحلية القديمة. آمن على السيرفر (no-op). */
export function purgeLegacyStorage(): void {
  if (typeof window === "undefined") return;
  for (const key of LEGACY_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // تجاهُل: التخزين قد يكون معطّلاً
    }
  }
}