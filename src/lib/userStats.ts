export interface UserStats {
  xpTotal: number;
  streakCount: number;
  wordsLearned: number;
  storiesCompleted: number;
  level: string;
  completedStoryIds: string[];
  learnedWords: string[];
}

const DEFAULT_STATS: UserStats = {
  xpTotal: 0,
  streakCount: 1,
  wordsLearned: 0,
  storiesCompleted: 0,
  level: "A1",
  completedStoryIds: [],
  learnedWords: [],
};

export class UserStatsService {
  private static STORAGE_KEY = "wordflow_user_stats_v2";

  public static getStats(): UserStats {
    if (typeof window === "undefined") return DEFAULT_STATS;
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return DEFAULT_STATS;
  }

  public static recordStoryCompletion(storyId: string, wordCount: number, xpEarned: number = 50) {
    const stats = this.getStats();
    if (!stats.completedStoryIds.includes(storyId)) {
      stats.completedStoryIds.push(storyId);
      stats.storiesCompleted = stats.completedStoryIds.length;
    }
    stats.xpTotal += xpEarned;
    stats.wordsLearned += wordCount;

    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
    }
    return stats;
  }

  public static setLevel(level: string) {
    const stats = this.getStats();
    stats.level = level;
    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
    }
  }
}
