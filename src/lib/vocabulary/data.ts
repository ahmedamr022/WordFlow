import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * قراءة سيرفر واحدة لكل ما تحتاجه شاشات /vocabulary.
 *
 * كل رقم هنا مصدره الداتابيز — لا localStorage ولا تخمين:
 *  · الكلمات المتعلَّمة و«قيد التعلم» من `user_word_progress`.
 *  · المستحقّ للمراجعة الآن (`next_review_at <= now()` وغير مكتمل).
 *  · إجمالي الـ XP والمستوى والستريك من `user_stats` + `profiles`.
 *  · هدف اليوم من `user_preferences`، ونقاط اليوم من `user_daily_activity`.
 *
 * ملاحظة أنواع: نقرأ `*` ثم نحوّل لواجهة محلية بدل الاعتماد على أسماء أعمدة
 * قد تكون غائبة عن `src/types/database.ts` المولَّد — هذا بالضبط سبب أخطاء
 * «Property 'level' does not exist on 'profiles'» السابقة. أي عمود ناقص يرتدّ
 * لقيمة افتراضية بدل كسر الـ typecheck أو الشاشة.
 */

export interface VocabRecentWord {
  id: string;
  word: string;
  translationAr: string;
  cefrLevel: string;
}

export interface VocabularyOverview {
  isAuthenticated: boolean;
  nickname: string;
  /** مستوى المستخدم (CEFR) من `profiles.english_level`. */
  level: string;
  avatarUrl: string | null;
  /** كلمات مطبَّعة (lowercase) حالتها `learned`. */
  learnedWords: string[];
  learnedCount: number;
  learningCount: number;
  dueCount: number;
  recent: VocabRecentWord[];
  dailyXp: number;
  dailyGoalXp: number;
  xpTotal: number;
  streak: number;
}

export const EMPTY_VOCABULARY_OVERVIEW: VocabularyOverview = {
  isAuthenticated: false,
  nickname: "مستخدم",
  level: "A1",
  avatarUrl: null,
  learnedWords: [],
  learnedCount: 0,
  learningCount: 0,
  dueCount: 0,
  recent: [],
  dailyXp: 0,
  dailyGoalXp: 50,
  xpTotal: 0,
  streak: 0
};

type WordRelation = {
  id?: string;
  word?: string;
  normalized?: string;
  translation_ar?: string;
  cefr_level?: string;
} | null;

interface ProfileLike {
  nickname?: string | null;
  avatar_url?: string | null;
  english_level?: string | null;
}

interface StatsLike {
  streak_count?: number | null;
  xp_total?: number | null;
}

const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];

function firstRelation(value: unknown): WordRelation {
  if (Array.isArray(value)) return (value[0] ?? null) as WordRelation;
  return (value ?? null) as WordRelation;
}

let progressErrorLogged = false;

export const getVocabularyOverview = cache(
  async (): Promise<VocabularyOverview> => {
    const supabase = await createClient();

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return EMPTY_VOCABULARY_OVERVIEW;

    const today = new Date().toISOString().slice(0, 10);
    const nowIso = new Date().toISOString();

    const [progressRes, dueRes, profileRes, statsRes, prefsRes, todayRes] =
    await Promise.all([
    supabase.
    from("user_word_progress").
    select(
      "status, last_reviewed_at, words(id, word, normalized, translation_ar, cefr_level)"
    ).
    eq("user_id", user.id).
    in("status", ["learning", "learned"]).
    order("last_reviewed_at", { ascending: false, nullsFirst: false }).
    limit(2000),

    supabase.
    from("user_word_progress").
    select("word_id", { count: "exact", head: true }).
    eq("user_id", user.id).
    neq("status", "learned").
    lte("next_review_at", nowIso),

    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),

    supabase.from("user_stats").select("*").eq("user_id", user.id).maybeSingle(),

    supabase.
    from("user_preferences").
    select("daily_goal_xp").
    eq("user_id", user.id).
    maybeSingle(),

    supabase.
    from("user_daily_activity").
    select("xp_earned").
    eq("user_id", user.id).
    eq("activity_date", today).
    maybeSingle()]
    );

    if (progressRes.error && !progressErrorLogged) {
      progressErrorLogged = true;
      console.warn(
        `[vocabulary:overview] user_word_progress ${
        progressRes.error.code ?? ""} — ${
        progressRes.error.message}\n  ⤳ الشاشة ستعرض حالة فاضية مؤقتاً (fallback مقصود).`
      );
    }

    const rows = progressRes.data ?? [];

    const learnedWords: string[] = [];
    const recent: VocabRecentWord[] = [];
    let learnedCount = 0;
    let learningCount = 0;

    for (const row of rows) {
      const word = firstRelation((row as {words?: unknown;}).words);
      const status = String((row as {status?: string;}).status ?? "");

      if (status === "learned") {
        learnedCount += 1;

        const normalized = word?.normalized ?? word?.word?.trim().toLowerCase();
        if (normalized) learnedWords.push(normalized);

        if (recent.length < 6 && word?.word) {
          recent.push({
            id: String(word.id ?? word.word),
            word: String(word.word),
            translationAr: String(word.translation_ar ?? ""),
            cefrLevel: String(word.cefr_level ?? "B1").toUpperCase()
          });
        }
      } else {
        learningCount += 1;
      }
    }

    const profile = (profileRes.data ?? null) as unknown as ProfileLike | null;
    const stats = (statsRes.data ?? null) as unknown as StatsLike | null;

    const rawLevel = String(profile?.english_level ?? "").toUpperCase();
    const level = CEFR.includes(rawLevel) ? rawLevel : "A1";

    return {
      isAuthenticated: true,
      nickname: profile?.nickname ?? "مستخدم",
      level,
      avatarUrl: profile?.avatar_url ?? null,
      learnedWords,
      learnedCount,
      learningCount,
      dueCount: Math.max(0, Number(dueRes.count ?? 0)),
      recent,
      dailyXp: Math.max(0, Number(todayRes.data?.xp_earned ?? 0)),
      dailyGoalXp: Math.max(1, Number(prefsRes.data?.daily_goal_xp ?? 50)),
      xpTotal: Math.max(0, Number(stats?.xp_total ?? 0)),
      streak: Math.max(0, Number(stats?.streak_count ?? 0))
    };
  }
);