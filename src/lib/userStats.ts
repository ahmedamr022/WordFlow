
import type { CefrLevel } from "@/types/database";

/** شكل الإحصائيات الموحّد بين السيرفر والعميل. لا تخزين محلي هنا إطلاقاً. */
export interface UserStats {
  xpTotal: number;
  streakCount: number;
  longestStreak: number;
  wordsLearned: number;
  storiesCompleted: number;
  totalTimeSeconds: number;
  averageAccuracy: number | null;
  level: CefrLevel;
  lastActiveDate: string | null;
}

export const DEFAULT_USER_STATS: UserStats = {
  xpTotal: 0,
  streakCount: 0,
  longestStreak: 0,
  wordsLearned: 0,
  storiesCompleted: 0,
  totalTimeSeconds: 0,
  averageAccuracy: null,
  level: "A1",
  lastActiveDate: null,
};

/** نقطة واحدة في سلسلة النشاط اليومي (user_daily_activity). */
export interface DailyActivityPoint {
  date: string;
  xpEarned: number;
  linesTyped: number;
  wordsReviewed: number;
  storiesCompleted: number;
}