"use server";

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_USER_STATS } from "@/lib/userStats";
import type { UserStats, DailyActivityPoint } from "@/lib/userStats";
import type { CefrLevel } from "@/types/database";

/**
 * قراءة الإحصائيات الحقيقية من السيرفر.
 *
 * كل القراءات هنا تمر بـ RLS (عميل الجلسة، لا service role) فالمستخدم
 * لا يرى إلا صفوفه. ترجع null للزائر غير المسجَّل بدل أن ترمي، لأن الواجهة
 * تستدعيها من مكوّنات قد تُعرض قبل الدخول.
 */
export async function getUserStatsAction(): Promise<UserStats | null> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [statsRes, profileRes, attemptsRes] = await Promise.all([
  supabase.from("user_stats").select("*").eq("user_id", user.id).maybeSingle(),
  supabase.from("profiles").select("english_level").eq("id", user.id).maybeSingle(),
  supabase.
  from("user_line_attempts").
  select("accuracy").
  eq("user_id", user.id).
  eq("rejected", false).
  order("created_at", { ascending: false }).
  limit(200)]
  );

  const row = statsRes.data;
  const attempts = attemptsRes.data ?? [];
  const averageAccuracy = attempts.length ?
  Math.round(
    attempts.reduce((sum, a) => sum + Number(a.accuracy ?? 0), 0) / attempts.length
  ) :
  null;

  return {
    ...DEFAULT_USER_STATS,
    xpTotal: Number(row?.xp_total ?? 0),
    streakCount: Number(row?.streak_count ?? 0),
    longestStreak: Number(row?.longest_streak ?? 0),
    wordsLearned: Number(row?.words_learned_count ?? 0),
    storiesCompleted: Number(row?.stories_completed_count ?? 0),
    totalTimeSeconds: Number(row?.total_time_seconds ?? 0),
    averageAccuracy,
    level: profileRes.data?.english_level as CefrLevel | undefined ?? "A1",
    lastActiveDate: row?.last_active_date as string | null ?? null
  };
}

export type ProfileSummary = {
  nickname: string;
  email: string;
  level: CefrLevel;
  avatarUrl: string | null;
};

/**
 * بديل قراءة الاسم والبريد من localStorage.
 * البريد يأتي من الجلسة نفسها، والاسم والمستوى من جدول profiles عبر RLS.
 */
export async function getProfileSummaryAction(): Promise<ProfileSummary | null> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.
  from("profiles").
  select("nickname, english_level, avatar_url").
  eq("id", user.id).
  maybeSingle();

  return {
    nickname: data?.nickname as string | undefined ?? user.email?.split("@")[0] ?? "مستخدم",
    email: user.email ?? "",
    level: data?.english_level as CefrLevel | undefined ?? "A1",
    avatarUrl: data?.avatar_url as string | undefined ?? null
  };
}

/** سلسلة نشاط آخر N يوم — تغذّي الرسوم في /stats والـ sparklines في الداشبورد. */
export async function getDailyActivityAction(days = 10): Promise<DailyActivityPoint[]> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return [];

  const span = Math.min(Math.max(Math.trunc(days), 1), 365);
  const since = new Date();
  since.setDate(since.getDate() - (span - 1));

  const { data } = await supabase.
  from("user_daily_activity").
  select("activity_date, xp_earned, lines_typed, words_reviewed, stories_completed").
  eq("user_id", user.id).
  gte("activity_date", since.toISOString().slice(0, 10)).
  order("activity_date", { ascending: true });

  return (data ?? []).map((row) => ({
    date: String(row.activity_date),
    xpEarned: Number(row.xp_earned ?? 0),
    linesTyped: Number(row.lines_typed ?? 0),
    wordsReviewed: Number(row.words_reviewed ?? 0),
    storiesCompleted: Number(row.stories_completed ?? 0)
  }));
}

export type DailyGoal = {
  xpToday: number;
  goalXp: number;
  percent: number;
  streak: number;
};

/**
 * هدف اليوم الحقيقي — يغذّي حلقة «تقدم اليوم» في الشريط الجانبي.
 *
 * كانت الحلقة مرسومة بـ strokeDashoffset ثابت (67.8) ونص "73%" و"120 نقطة"
 * مكتوبين في الكود. الآن: نقاط اليوم من `user_daily_activity` والهدف من
 * `user_preferences.daily_goal_xp`، في مصادقة واحدة و Promise.all واحد.
 *
 * الشاشات التي تملك البيانات أصلاً (الداشبورد، /stories) تمرّرها كـ props
 * للشريط الجانبي فلا تدفع هذا الطلب إطلاقاً.
 */
export async function getDailyGoalAction(): Promise<DailyGoal | null> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);

  const [prefsRes, todayRes, statsRes] = await Promise.all([
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
  supabase.from("user_stats").select("streak_count").eq("user_id", user.id).maybeSingle()]
  );

  const goalXp = Math.max(1, Number(prefsRes.data?.daily_goal_xp ?? 50));
  const xpToday = Math.max(0, Number(todayRes.data?.xp_earned ?? 0));

  return {
    xpToday,
    goalXp,
    percent: Math.min(100, Math.round(xpToday / goalXp * 100)),
    streak: Math.max(0, Number(statsRes.data?.streak_count ?? 0))
  };
}