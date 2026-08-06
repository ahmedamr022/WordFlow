import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { positionPercent } from "@/lib/stories/percent";

/**
 * قراءة واحدة لكل ما تحتاجه شاشة /stories (وتستخدمها الداشبورد كذلك، و`cache()`
 * تضمن أنها تُنفَّذ مرة واحدة لكل طلب).
 *
 * مصادقة واحدة + `Promise.all` واحد على السيرفر ⇒ الأرقام موجودة في أول HTML
 * وصفر طلبات بعد التحميل.
 *
 * أي استعلام يفشل يرتد لصفر بدل ما يكسر الشاشة، لكن **مع رسالة تشخيص واضحة**:
 * الخطأ الذي ظهر فعلياً كان
 *   42501 permission denied for table user_story_positions
 * وهو ليس RLS (RLS ترجّع صفوفاً فاضية لا خطأ) بل GRANT ناقص على الجدول.
 * الحل: نفّذ `supabase/migrations/0010_story_positions_grants.sql`.
 */

export type StoryPositionSummary = {
  lineIndex: number;
  linesCompleted: number;
  totalLines: number;
  percent: number;
  bestAccuracy: number | null;
  bestWpm: number | null;
  completed: boolean;
  updatedAt: string | null;
};

export type StoriesOverview = {
  isAuthenticated: boolean;
  /** slug → نسبة التقدم (0-100) */
  positions: Record<string, StoryPositionSummary>;
  /** آخر قصة لمسها المستخدم فعلاً — تغذّي كارت «متابعة القراءة». */
  continueSlug: string | null;
  storiesStarted: number;
  storiesCompleted: number;
  averageAccuracy: number | null;
  wordsLearned: number;
  dailyXp: number;
  dailyGoalXp: number;
  streak: number;
};

export const EMPTY_STORIES_OVERVIEW: StoriesOverview = {
  isAuthenticated: false,
  positions: {},
  continueSlug: null,
  storiesStarted: 0,
  storiesCompleted: 0,
  averageAccuracy: null,
  wordsLearned: 0,
  dailyXp: 0,
  dailyGoalXp: 50,
  streak: 0
};

/** نطبع التشخيص مرة واحدة لكل عملية تشغيل، لا مع كل رندر. */
let positionsErrorLogged = false;

function explainPositionsError(code: string, message: string): void {
  if (positionsErrorLogged) return;
  positionsErrorLogged = true;

  const hint =
  code === "42501" ?
  "GRANT ناقص على الجدول (وليس RLS). نفّذ: supabase/migrations/0010_story_positions_grants.sql" :
  code === "42P01" ?
  "الجدول غير موجود. نفّذ: supabase db push (0009 + 0010)." :
  "راجع صلاحيات الجدول والسياسات.";

  console.warn(
    `[stories:overview] user_story_positions ${code} — ${message}\n  ⤳ ${hint}\n  ⤳ الشاشات ستعرض أصفاراً مؤقتاً (fallback مقصود) حتى تُنفَّذ الترحيلة.`
  );
}

export const getStoriesOverview = cache(async (): Promise<StoriesOverview> => {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return EMPTY_STORIES_OVERVIEW;

  const today = new Date().toISOString().slice(0, 10);

  const [positionsRes, statsRes, prefsRes, todayRes, attemptsRes] = await Promise.all([
  supabase.
  from("user_story_positions").
  select(
    "story_slug, line_index, lines_completed, total_lines, best_accuracy, best_wpm, completed_at, updated_at"
  ).
  eq("user_id", user.id).
  order("updated_at", { ascending: false }),
  supabase.
  from("user_stats").
  select("words_learned_count, streak_count").
  eq("user_id", user.id).
  maybeSingle(),
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
  maybeSingle(),
  supabase.
  from("user_line_attempts").
  select("accuracy").
  eq("user_id", user.id).
  eq("rejected", false).
  order("created_at", { ascending: false }).
  limit(200)]
  );

  if (positionsRes.error) {
    explainPositionsError(
      positionsRes.error.code ?? "unknown",
      positionsRes.error.message
    );
  }

  const rows = positionsRes.data ?? [];
  const positions: Record<string, StoryPositionSummary> = {};
  let storiesCompleted = 0;

  for (const row of rows) {
    const slug = String(row.story_slug);
    const linesCompleted = Number(row.lines_completed ?? 0);
    const totalLines = Number(row.total_lines ?? 0);
    const completed = Boolean(row.completed_at);
    if (completed) storiesCompleted += 1;

    positions[slug] = {
      lineIndex: Number(row.line_index ?? 0),
      linesCompleted,
      totalLines,
      percent: completed ? 100 : positionPercent(linesCompleted, totalLines),
      bestAccuracy:
      row.best_accuracy === null || row.best_accuracy === undefined ?
      null :
      Number(row.best_accuracy),
      bestWpm: row.best_wpm === null || row.best_wpm === undefined ? null : Number(row.best_wpm),
      completed,
      updatedAt: row.updated_at ? String(row.updated_at) : null
    };
  }

  // أول صف في القائمة هو الأحدث (order by updated_at desc) وغير مكتمل إن أمكن.
  const continueRow = rows.find((row) => !row.completed_at) ?? rows[0] ?? null;

  const attempts = attemptsRes.data ?? [];
  const averageAccuracy = attempts.length ?
  Math.round(
    attempts.reduce((sum, attempt) => sum + Number(attempt.accuracy ?? 0), 0) / attempts.length
  ) :
  null;

  return {
    isAuthenticated: true,
    positions,
    continueSlug: continueRow ? String(continueRow.story_slug) : null,
    storiesStarted: rows.length,
    storiesCompleted,
    averageAccuracy,
    wordsLearned: Math.max(0, Number(statsRes.data?.words_learned_count ?? 0)),
    dailyXp: Math.max(0, Number(todayRes.data?.xp_earned ?? 0)),
    dailyGoalXp: Math.max(1, Number(prefsRes.data?.daily_goal_xp ?? 50)),
    streak: Math.max(0, Number(statsRes.data?.streak_count ?? 0))
  };
});