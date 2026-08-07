/**
 * WordFlow — spaced repetition engine (SM-2 lite, tuned for vocabulary).
 *
 * Replaces the flat `XP_BY_GRADE` table in `WordFlashDeck.tsx` and gives the
 * four-button review UI (أعرفها / تقريباً / صعبة / لا أتذكرها) real
 * scheduling instead of a cosmetic score.
 */

import type { MasteryStatus, ReviewGrade, WordProgress } from '../types';

export const GRADES: ReviewGrade[] = ['known', 'almost', 'hard', 'forgot'];

export const GRADE_META: Record<
  ReviewGrade,
  {
    labelAr: string;
    emoji: string;
    xp: number;
    /** Tailwind text colour token. */
    tone: string;
    bar: string;
    hotkey: string;
  }> =
{
  known: {
    labelAr: 'أعرفها',
    emoji: '🙂',
    xp: 10,
    tone: 'text-emerald-400',
    bar: 'bg-emerald-400',
    hotkey: '1'
  },
  almost: {
    labelAr: 'تقريباً',
    emoji: '😐',
    xp: 7,
    tone: 'text-amber-400',
    bar: 'bg-amber-400',
    hotkey: '2'
  },
  hard: {
    labelAr: 'صعبة',
    emoji: '🙁',
    xp: 4,
    tone: 'text-orange-400',
    bar: 'bg-orange-500',
    hotkey: '3'
  },
  forgot: {
    labelAr: 'لا أتذكرها',
    emoji: '😞',
    xp: 2,
    tone: 'text-rose-400',
    bar: 'bg-rose-500',
    hotkey: '4'
  }
};

const EASE_DELTA: Record<ReviewGrade, number> = {
  known: 0.12,
  almost: 0,
  hard: -0.15,
  forgot: -0.25
};

const MASTERY_DELTA: Record<ReviewGrade, number> = {
  known: 18,
  almost: 10,
  hard: 3,
  forgot: -12
};

export const MIN_EASE = 1.3;
export const MAX_EASE = 2.8;

export function createProgress(wordId: string): WordProgress {
  return {
    wordId,
    mastery: 0,
    repetitions: 0,
    ease: 2.3,
    intervalDays: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
    favorite: false
  };
}

const clamp = (value: number, min: number, max: number) =>
Math.min(max, Math.max(min, value));

/** Pure — safe to reuse on the server inside `recordWordReviewByTextAction`. */
export function gradeWord(
progress: WordProgress,
grade: ReviewGrade,
now: Date = new Date())
: WordProgress {
  const ease = clamp(progress.ease + EASE_DELTA[grade], MIN_EASE, MAX_EASE);
  const repetitions = grade === 'forgot' ? 0 : progress.repetitions + 1;

  let intervalDays: number;
  if (grade === 'forgot') intervalDays = 0;else
  if (grade === 'hard')
  intervalDays = Math.max(1, Math.round(progress.intervalDays * 0.6) || 1);else
  if (repetitions <= 1) intervalDays = 1;else
  if (repetitions === 2) intervalDays = 3;else
  intervalDays = Math.round(Math.max(1, progress.intervalDays) * ease);

  const nextReview = new Date(now);
  if (intervalDays === 0) nextReview.setMinutes(nextReview.getMinutes() + 10);else
  nextReview.setDate(nextReview.getDate() + intervalDays);

  return {
    ...progress,
    ease,
    repetitions,
    intervalDays,
    mastery: clamp(progress.mastery + MASTERY_DELTA[grade], 0, 100),
    lastReviewedAt: now.toISOString(),
    nextReviewAt: nextReview.toISOString()
  };
}

export function statusOf(
progress: WordProgress | undefined,
now: Date = new Date())
: MasteryStatus {
  if (!progress || progress.repetitions === 0) return 'new';
  if (progress.mastery >= 85) return 'mastered';
  if (progress.nextReviewAt && new Date(progress.nextReviewAt) <= now)
  return 'due';
  return 'learning';
}

export const STATUS_META: Record<
  MasteryStatus,
  {labelAr: string;className: string;dot: string;}> =
{
  new: {
    labelAr: 'جديدة',
    className: 'text-sky-300 border-sky-400/25 bg-sky-400/10',
    dot: 'bg-sky-400'
  },
  learning: {
    labelAr: 'قيد التعلم',
    className: 'text-violet-300 border-violet-400/25 bg-violet-400/10',
    dot: 'bg-violet-400'
  },
  due: {
    labelAr: 'مراجعة',
    className: 'text-amber-300 border-amber-400/25 bg-amber-400/10',
    dot: 'bg-amber-400'
  },
  mastered: {
    labelAr: 'متقنة',
    className: 'text-brand-teal border-brand-teal/25 bg-brand-teal/10',
    dot: 'bg-brand-teal'
  }
};

export function xpFor(grade: ReviewGrade): number {
  return GRADE_META[grade].xp;
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}