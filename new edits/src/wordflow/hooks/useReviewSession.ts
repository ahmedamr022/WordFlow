/**
 * WordFlow — review session state machine.
 *
 * intro → session → summary, with the word queue built from the learner's
 * real SRS state instead of a random slice. The same hook powers:
 *   • "ابدأ المراجعة" from the dashboard
 *   • "ابدأ جلسة تعلم" from a category rail
 *   • "راجع هذه الكلمة" from the word detail panel (queue of one)
 */

import { useCallback, useMemo, useState } from 'react';
import type {
  ReviewAnswer,
  ReviewGrade,
  ReviewSummary,
  VocabularyWord } from
'../types';
import { useVocabulary } from './useVocabulary';
import { statusOf, xpFor } from '../utils/srs';

export type ReviewPhase = 'idle' | 'intro' | 'session' | 'summary';

export interface ReviewConfig {
  /** Words with the lowest mastery. */
  weak: boolean;
  /** Words whose next review date has passed. */
  forgotten: boolean;
  /** Words never studied. */
  fresh: boolean;
}

const DEFAULT_CONFIG: ReviewConfig = {
  weak: true,
  forgotten: true,
  fresh: true
};

const MAX_SESSION = 24;

export function useReviewSession() {
  const { progress, grade: gradeWordInStore } = useVocabulary();

  const [phase, setPhase] = useState<ReviewPhase>('idle');
  const [pool, setPool] = useState<VocabularyWord[]>([]);
  const [label, setLabel] = useState('مراجعة اليوم');
  const [config, setConfig] = useState<ReviewConfig>(DEFAULT_CONFIG);
  const [queue, setQueue] = useState<VocabularyWord[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<ReviewAnswer[]>([]);
  const [startedAt, setStartedAt] = useState(0);
  const [endedAt, setEndedAt] = useState(0);

  /** Words the current config would pick — drives the intro modal counters. */
  const selection = useMemo(() => {
    const picked = pool.filter((word) => {
      const status = statusOf(progress[word.id]);
      const mastery = progress[word.id]?.mastery ?? 0;
      if (status === 'new') return config.fresh;
      if (status === 'due') return config.forgotten;
      return config.weak && mastery < 70;
    });

    // Lowest mastery first: attention goes where it is needed.
    return picked.
    sort(
      (a, b) =>
      (progress[a.id]?.mastery ?? 0) - (progress[b.id]?.mastery ?? 0)
    ).
    slice(0, MAX_SESSION);
  }, [pool, progress, config]);

  const estimatedXp = selection.length * 8;
  const estimatedMinutes = Math.max(1, Math.round(selection.length * 0.35));

  const openIntro = useCallback(
    (words: VocabularyWord[], sessionLabel = 'مراجعة اليوم') => {
      setPool(words);
      setLabel(sessionLabel);
      setConfig(DEFAULT_CONFIG);
      setAnswers([]);
      setIndex(0);
      setPhase('intro');
    },
    []
  );

  /** Skips the intro — used by "راجع هذه الكلمة" for a single word. */
  const startImmediately = useCallback(
    (words: VocabularyWord[], sessionLabel = 'مراجعة سريعة') => {
      if (words.length === 0) return;
      setPool(words);
      setLabel(sessionLabel);
      setQueue(words.slice(0, MAX_SESSION));
      setAnswers([]);
      setIndex(0);
      setStartedAt(Date.now());
      setPhase('session');
    },
    []
  );

  const begin = useCallback(() => {
    if (selection.length === 0) return;
    setQueue(selection);
    setAnswers([]);
    setIndex(0);
    setStartedAt(Date.now());
    setPhase('session');
  }, [selection]);

  const submit = useCallback(
    (value: ReviewGrade) => {
      const word = queue[index];
      if (!word) return;
      gradeWordInStore(word.id, value);
      setAnswers((current) => [
      ...current,
      { wordId: word.id, grade: value, xp: xpFor(value) }]
      );

      if (index + 1 >= queue.length) {
        setEndedAt(Date.now());
        setPhase('summary');
      } else {
        setIndex((current) => current + 1);
      }
    },
    [queue, index, gradeWordInStore]
  );

  /** Puts the word back at the end of the queue instead of losing it. */
  const skip = useCallback(() => {
    if (queue.length <= 1) return;
    setQueue((current) => {
      const next = [...current];
      const [word] = next.splice(index, 1);
      next.push(word);
      return next;
    });
  }, [queue.length, index]);

  const finishEarly = useCallback(() => {
    setEndedAt(Date.now());
    setPhase(answers.length > 0 ? 'summary' : 'idle');
  }, [answers.length]);

  const close = useCallback(() => {
    setPhase('idle');
    setQueue([]);
    setAnswers([]);
    setIndex(0);
  }, []);

  const summary = useMemo<ReviewSummary>(() => {
    const counts = { known: 0, almost: 0, hard: 0, forgot: 0 };
    let xp = 0;
    for (const answer of answers) {
      counts[answer.grade] += 1;
      xp += answer.xp;
    }
    return {
      total: queue.length,
      answers,
      xp,
      durationMs: Math.max(0, (endedAt || Date.now()) - startedAt),
      counts
    };
  }, [answers, queue.length, startedAt, endedAt]);

  return {
    phase,
    label,
    config,
    setConfig,
    selection,
    estimatedXp,
    estimatedMinutes,
    queue,
    index,
    current: queue[index],
    answers,
    summary,
    openIntro,
    startImmediately,
    begin,
    submit,
    skip,
    finishEarly,
    close
  };
}