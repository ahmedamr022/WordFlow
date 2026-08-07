/**
 * WordFlow — single source of truth for learner progress.
 *
 * In the real app the reducer body stays identical; only `persist()` changes
 * (swap localStorage for `recordWordReviewByTextAction`). Every screen reads
 * progress from here, so the words page, the detail panel and the review modal
 * can never disagree about a word's state.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState } from
'react';
import type {
  MasteryStatus,
  ReviewGrade,
  VocabularyCategory,
  VocabularyWord,
  WordProgress } from
'../types';
import { ALL_WORDS, VOCABULARY_CATEGORIES } from '../data/vocabulary';
import { createProgress, gradeWord, statusOf, xpFor } from '../utils/srs';

const STORAGE_KEY = 'wordflow_word_progress_v3';

export interface CategoryStats {
  total: number;
  mastered: number;
  learning: number;
  due: number;
  fresh: number;
  percent: number;
  addedThisWeek: number;
}

interface VocabularyContextValue {
  progress: Record<string, WordProgress>;
  xp: number;
  dailyXp: number;
  dailyGoalXp: number;
  streak: number;
  getProgress: (wordId: string) => WordProgress;
  getStatus: (wordId: string) => MasteryStatus;
  grade: (wordId: string, grade: ReviewGrade) => void;
  toggleFavorite: (wordId: string) => void;
  markLearning: (wordId: string) => void;
  resetWord: (wordId: string) => void;
  statsFor: (category: VocabularyCategory) => CategoryStats;
  overallStats: CategoryStats;
  dueWords: (limit?: number) => VocabularyWord[];
  favoriteWords: () => VocabularyWord[];
  levelDistribution: Array<{level: string;count: number;percent: number;}>;
}

const VocabularyContext = createContext<VocabularyContextValue | null>(null);

/** Deterministic seed so the demo opens on a believable, non-empty state. */
function seedProgress(): Record<string, WordProgress> {
  const seeded: Record<string, WordProgress> = {};
  ALL_WORDS.forEach((word, index) => {
    const bucket = index % 5;
    if (bucket === 0) return; // stays new
    const base = createProgress(word.id);
    const now = Date.now();
    if (bucket === 1) {
      seeded[word.id] = {
        ...base,
        mastery: 92,
        repetitions: 5,
        ease: 2.5,
        intervalDays: 12,
        lastReviewedAt: new Date(now - 3 * 86400000).toISOString(),
        nextReviewAt: new Date(now + 9 * 86400000).toISOString()
      };
    } else if (bucket === 2) {
      seeded[word.id] = {
        ...base,
        mastery: 48,
        repetitions: 2,
        intervalDays: 3,
        lastReviewedAt: new Date(now - 4 * 86400000).toISOString(),
        nextReviewAt: new Date(now - 3600000).toISOString() // due
      };
    } else if (bucket === 3) {
      seeded[word.id] = {
        ...base,
        mastery: 35,
        repetitions: 1,
        intervalDays: 1,
        lastReviewedAt: new Date(now - 86400000).toISOString(),
        nextReviewAt: new Date(now + 2 * 86400000).toISOString()
      };
    } else {
      seeded[word.id] = {
        ...base,
        mastery: 88,
        repetitions: 4,
        intervalDays: 8,
        favorite: index % 9 === 0,
        lastReviewedAt: new Date(now - 2 * 86400000).toISOString(),
        nextReviewAt: new Date(now + 6 * 86400000).toISOString()
      };
    }
  });
  return seeded;
}

function readStored(): Record<string, WordProgress> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as Record<string, WordProgress> : null;
  } catch {
    return null;
  }
}

export function VocabularyProvider({
  children


}: {children: React.ReactNode;}) {
  const [progress, setProgress] = useState<Record<string, WordProgress>>(() => {
    if (typeof window === 'undefined') return seedProgress();
    return readStored() ?? seedProgress();
  });
  const [dailyXp, setDailyXp] = useState(1250);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {

      /* storage disabled — state stays in memory */}
  }, [progress]);

  const getProgress = useCallback(
    (wordId: string) => progress[wordId] ?? createProgress(wordId),
    [progress]
  );

  const getStatus = useCallback(
    (wordId: string) => statusOf(progress[wordId]),
    [progress]
  );

  const grade = useCallback((wordId: string, value: ReviewGrade) => {
    setProgress((current) => ({
      ...current,
      [wordId]: gradeWord(current[wordId] ?? createProgress(wordId), value)
    }));
    setDailyXp((current) => current + xpFor(value));
  }, []);

  const toggleFavorite = useCallback((wordId: string) => {
    setProgress((current) => {
      const existing = current[wordId] ?? createProgress(wordId);
      return {
        ...current,
        [wordId]: { ...existing, favorite: !existing.favorite }
      };
    });
  }, []);

  const markLearning = useCallback((wordId: string) => {
    setProgress((current) => {
      if (current[wordId]?.repetitions) return current;
      return {
        ...current,
        [wordId]: gradeWord(createProgress(wordId), 'almost')
      };
    });
  }, []);

  const resetWord = useCallback((wordId: string) => {
    setProgress((current) => ({ ...current, [wordId]: createProgress(wordId) }));
  }, []);

  const statsFor = useCallback(
    (category: VocabularyCategory): CategoryStats => {
      const counts = { mastered: 0, learning: 0, due: 0, fresh: 0 };
      let masterySum = 0;

      for (const word of category.words) {
        const status = statusOf(progress[word.id]);
        masterySum += progress[word.id]?.mastery ?? 0;
        if (status === 'mastered') counts.mastered += 1;else
        if (status === 'due') counts.due += 1;else
        if (status === 'learning') counts.learning += 1;else
        counts.fresh += 1;
      }

      const total = category.words.length || 1;
      return {
        total: category.words.length,
        ...counts,
        percent: Math.round(masterySum / total),
        addedThisWeek: category.words.length % 7 + 4
      };
    },
    [progress]
  );

  const overallStats = useMemo<CategoryStats>(() => {
    const merged: VocabularyCategory = {
      ...VOCABULARY_CATEGORIES[0],
      words: ALL_WORDS
    };
    return statsFor(merged);
  }, [statsFor]);

  const dueWords = useCallback(
    (limit?: number) => {
      const list = ALL_WORDS.filter((word) => {
        const status = statusOf(progress[word.id]);
        return status === 'due' || status === 'new';
      }).sort((a, b) => {
        const pa = progress[a.id]?.mastery ?? 0;
        const pb = progress[b.id]?.mastery ?? 0;
        return pa - pb;
      });
      return limit ? list.slice(0, limit) : list;
    },
    [progress]
  );

  const favoriteWords = useCallback(
    () => ALL_WORDS.filter((word) => progress[word.id]?.favorite),
    [progress]
  );

  const levelDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    for (const word of ALL_WORDS)
    counts.set(word.cefrLevel, (counts.get(word.cefrLevel) ?? 0) + 1);
    const total = ALL_WORDS.length || 1;
    return Array.from(counts.entries()).
    sort((a, b) => a[0].localeCompare(b[0])).
    map(([level, count]) => ({
      level,
      count,
      percent: Math.round(count / total * 100)
    }));
  }, []);

  const value = useMemo<VocabularyContextValue>(
    () => ({
      progress,
      xp: 12_480,
      dailyXp,
      dailyGoalXp: 2000,
      streak: 12,
      getProgress,
      getStatus,
      grade,
      toggleFavorite,
      markLearning,
      resetWord,
      statsFor,
      overallStats,
      dueWords,
      favoriteWords,
      levelDistribution
    }),
    [
    progress,
    dailyXp,
    getProgress,
    getStatus,
    grade,
    toggleFavorite,
    markLearning,
    resetWord,
    statsFor,
    overallStats,
    dueWords,
    favoriteWords,
    levelDistribution]

  );

  return (
    <VocabularyContext.Provider value={value}>
      {children}
    </VocabularyContext.Provider>);

}

export function useVocabulary(): VocabularyContextValue {
  const context = useContext(VocabularyContext);
  if (!context)
  throw new Error('useVocabulary must be used inside <VocabularyProvider>');
  return context;
}