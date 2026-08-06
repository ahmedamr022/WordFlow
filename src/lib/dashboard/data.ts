import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_USER_STATS, type DailyActivityPoint, type UserStats } from "@/lib/userStats";
import { MAIN_STORIES } from "@/data/stories";
import { storyCover } from "@/lib/assets";
import type { CefrLevel } from "@/types/database";

/**
 * سبب البطء في الداشبورد (المشكلة رقم ٥ و ٦):
 *
 * كانت الصفحة تعرض 4 مكوّنات "use client" وكل واحد ينادي Server Action خاصة به:
 *   StatCards        -> getUserStatsAction() + getDailyActivityAction()
 *   DashboardHeader  -> getUserStatsAction() + getProfileSummaryAction()
 *   AppShellHeader   -> getProfileSummaryAction()  (نفس الاستدعاء مرة ثالثة)
 *
 * = 5 طلبات POST متتالية بعد أن يُحمَّل الـ JS، وكل واحدة منها تبدأ بـ
 * `supabase.auth.getUser()` أي رحلة شبكة كاملة إلى Supabase قبل أي استعلام.
 * يعني ~5 مرات مصادقة + ~9 استعلامات لعرض 4 أرقام، وكلها بعد الـ hydration
 * فيظهر الشريط السفلي "N" ويحس المستخدم أن الموقع تقيل.
 *
 * الحل هنا: قراءة واحدة على السيرفر، مصادقة واحدة، كل الاستعلامات في
 * Promise.all واحد، والنتيجة تُمرَّر props للمكوّنات (صارت presentational).
 * `cache()` تضمن أن layout + page + header يقرؤون نفس النتيجة بلا تكرار.
 */

export interface DashboardVocabulary {
  /** كلمات لم تُراجَع ولا مرة (repetitions = 0) */
  fresh: number;
  /** كلمات حان موعد مراجعتها الآن */
  due: number;
  /** إجمالي الكلمات في مخزون المستخدم */
  total: number;
  /** نسبة التثبيت الحقيقية = صح / (صح + خطأ) */
  retention: number | null;
}

export interface DashboardContinueStory {
  id: string;
  href: string;
  titleEn: string;
  titleAr: string;
  level: string;
  duration: string;
  cover: string;
  progress: number;
}

export interface DashboardWeekly {
  target: number;
  completed: number;
  xpReward: number;
}

export interface DashboardToday {
  xpEarned: number;
  goalXp: number;
  /** نسبة مئوية 0..100 */
  percent: number;
}

export interface DashboardProfile {
  nickname: string;
  email: string;
  level: CefrLevel;
  avatarUrl: string | null;
}

export interface DashboardData {
  profile: DashboardProfile;
  stats: UserStats;
  activity: DailyActivityPoint[];
  today: DashboardToday;
  vocabulary: DashboardVocabulary;
  continueStory: DashboardContinueStory | null;
  weekly: DashboardWeekly;
  totalStoryCount: number;
}

const WEEKLY_TARGET = 5;
const WEEKLY_XP_REWARD = 250;
const ACTIVITY_DAYS = 10;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function pct(value: number, of: number): number {
  if (of <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round(value / of * 100)));
}

/** أول قصة عليها تقدم غير مكتمل، وإلا أول قصة في الكتالوج. */
function buildContinueStory(
progressRows: Array<{
  story_id: string;
  status: string | null;
  lines_completed: number | null;
}>)
: DashboardContinueStory | null {
  const byId = new Map(progressRows.map((row) => [row.story_id, row]));

  const inProgress = MAIN_STORIES.find((story) => {
    const row = byId.get(story.id);
    return row && row.status !== "completed";
  });

  const target = inProgress ?? MAIN_STORIES[0];
  if (!target) return null;

  const row = byId.get(target.id);
  const lines = Number(row?.lines_completed ?? 0);
  const progress = lines > 0 ? pct(lines, Math.max(lines, 20)) : 0;

  return {
    id: target.id,
    href: `/story/${target.id}`,
    titleEn: target.titleEn,
    titleAr: target.titleAr,
    level: target.level,
    duration: target.duration,
    cover: storyCover(target.id),
    progress
  };
}

export const getDashboardData = cache(async (): Promise<DashboardData | null> => {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const activitySince = isoDaysAgo(ACTIVITY_DAYS - 1);
  const weekSince = isoDaysAgo(6);

  // مصادقة واحدة فوق، ثم كل الاستعلامات على التوازي.
  const [
  statsRes,
  profileRes,
  prefsRes,
  attemptsRes,
  activityRes,
  wordTotalRes,
  wordDueRes,
  wordFreshRes,
  wordScoreRes,
  storyProgressRes] =
  await Promise.all([
  supabase.from("user_stats").select("*").eq("user_id", user.id).maybeSingle(),
  supabase.
  from("profiles").
  select("nickname, english_level, avatar_url").
  eq("id", user.id).
  maybeSingle(),
  supabase.
  from("user_preferences").
  select("daily_goal_xp").
  eq("user_id", user.id).
  maybeSingle(),
  supabase.
  from("user_line_attempts").
  select("accuracy").
  eq("user_id", user.id).
  eq("rejected", false).
  order("created_at", { ascending: false }).
  limit(200),
  supabase.
  from("user_daily_activity").
  select("activity_date, xp_earned, lines_typed, words_reviewed, stories_completed").
  eq("user_id", user.id).
  gte("activity_date", activitySince).
  order("activity_date", { ascending: true }),
  supabase.
  from("user_word_progress").
  select("word_id", { count: "exact", head: true }).
  eq("user_id", user.id),
  supabase.
  from("user_word_progress").
  select("word_id", { count: "exact", head: true }).
  eq("user_id", user.id).
  lte("next_review_at", new Date().toISOString()),
  supabase.
  from("user_word_progress").
  select("word_id", { count: "exact", head: true }).
  eq("user_id", user.id).
  eq("repetitions", 0),
  supabase.
  from("user_word_progress").
  select("correct_count, incorrect_count").
  eq("user_id", user.id).
  limit(500),
  supabase.
  from("user_story_progress").
  select("story_id, status, lines_completed").
  eq("user_id", user.id)]
  );

  const statsRow = statsRes.data;
  const profileRow = profileRes.data;

  const attempts = attemptsRes.data ?? [];
  const averageAccuracy = attempts.length ?
  Math.round(
    attempts.reduce((sum, row) => sum + Number(row.accuracy ?? 0), 0) / attempts.length
  ) :
  null;

  const level = profileRow?.english_level as CefrLevel | null ?? "A1";

  const stats: UserStats = {
    ...DEFAULT_USER_STATS,
    xpTotal: Number(statsRow?.xp_total ?? 0),
    streakCount: Number(statsRow?.streak_count ?? 0),
    longestStreak: Number(statsRow?.longest_streak ?? 0),
    wordsLearned: Number(statsRow?.words_learned_count ?? 0),
    storiesCompleted: Number(statsRow?.stories_completed_count ?? 0),
    totalTimeSeconds: Number(statsRow?.total_time_seconds ?? 0),
    averageAccuracy,
    level,
    lastActiveDate: statsRow?.last_active_date as string | null ?? null
  };

  const activity: DailyActivityPoint[] = (activityRes.data ?? []).map((row) => ({
    date: String(row.activity_date),
    xpEarned: Number(row.xp_earned ?? 0),
    linesTyped: Number(row.lines_typed ?? 0),
    wordsReviewed: Number(row.words_reviewed ?? 0),
    storiesCompleted: Number(row.stories_completed ?? 0)
  }));

  const key = todayKey();
  const goalXp = Number(prefsRes.data?.daily_goal_xp ?? 100) || 100;
  const xpToday = activity.find((point) => point.date === key)?.xpEarned ?? 0;

  const scoreRows = wordScoreRes.data ?? [];
  const correct = scoreRows.reduce((sum, row) => sum + Number(row.correct_count ?? 0), 0);
  const incorrect = scoreRows.reduce((sum, row) => sum + Number(row.incorrect_count ?? 0), 0);

  const completedThisWeek = activity.
  filter((point) => point.date >= weekSince).
  reduce((sum, point) => sum + point.storiesCompleted, 0);

  return {
    profile: {
      nickname:
      profileRow?.nickname as string | null ?? user.email?.split("@")[0] ?? "مستخدم",
      email: user.email ?? "",
      level,
      avatarUrl: profileRow?.avatar_url as string | null ?? null
    },
    stats,
    activity,
    today: {
      xpEarned: xpToday,
      goalXp,
      percent: pct(xpToday, goalXp)
    },
    vocabulary: {
      fresh: wordFreshRes.count ?? 0,
      due: wordDueRes.count ?? 0,
      total: wordTotalRes.count ?? stats.wordsLearned,
      retention: correct + incorrect > 0 ? Math.round(correct / (correct + incorrect) * 100) : null
    },
    continueStory: buildContinueStory(storyProgressRes.data ?? []),
    weekly: {
      target: WEEKLY_TARGET,
      completed: Math.min(completedThisWeek, WEEKLY_TARGET),
      xpReward: WEEKLY_XP_REWARD
    },
    totalStoryCount: MAIN_STORIES.length
  };
});