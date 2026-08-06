"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getLearnedWordsAction,
  recordWordReviewByTextAction } from
"@/app/actions/vocabulary";

/**
 * مصدر واحد لحالة «الكلمات المتعلَّمة» في الواجهة.
 *
 * الحالة مصدرها `user_word_progress`، والحفظ يمرّ بـ
 * `record_word_review_by_text` (SECURITY DEFINER) فينشئ صف الكلمة إن لزم ثم
 * يمنح الـ XP مرة واحدة فقط لكل كلمة.
 *
 * الجديد في هذه النسخة:
 *  · `seed` — نمرّر ترجمة الكلمة ونطقها ومستواها ومثالها، فتُنشأ في `words`
 *    عند أول تفاعل حقيقي. قبل ذلك كان الحفظ يفشل لأي كلمة لم يُدخلها الـ seed
 *    برسالة «هذه الكلمة غير موجودة في قاعدة البيانات بعد» — وهذا هو السبب
 *    المباشر لـ «التقدّم مش بيتحفظ».
 *  · `correct` — الإجابة الخاطئة تُسجَّل كخطأ بدل تسجيل كل شيء كصحيح.
 *  · `lastResult` — لعرض «+2 XP» فور الحفظ بلا طلب إضافي.
 */

export interface WordSeed {
  translationAr?: string;
  ipa?: string;
  cefrLevel?: string;
  exampleEn?: string;
  exampleAr?: string;
}

export interface WordReviewOutcome {
  word: string;
  status: string;
  xpAwarded: number;
  xpTotal: number;
}

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

function normalizeSeed(seed?: WordSeed) {
  if (!seed) return undefined;
  const level = (seed.cefrLevel ?? "").toUpperCase();
  return {
    translationAr: seed.translationAr?.slice(0, 200),
    ipa: seed.ipa?.slice(0, 120),
    cefrLevel: LEVELS.includes(level) ? level : undefined,
    exampleEn: seed.exampleEn?.slice(0, 400),
    exampleAr: seed.exampleAr?.slice(0, 400)
  };
}

export function useLearnedWords(initial: string[] = []) {
  const initialSet = useMemo(
    () => new Set(initial.map((word) => word.trim().toLowerCase()).filter(Boolean)),
    [initial]
  );

  const [learned, setLearned] = useState<Set<string>>(initialSet);
  const [isLoading, setIsLoading] = useState(initial.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<WordReviewOutcome | null>(null);

  const refresh = useCallback(async () => {
    try {
      const words = await getLearnedWordsAction();
      setLearned(new Set(words.map((word) => word.trim().toLowerCase())));
      setError(null);
    } catch {
      setError("تعذر تحميل كلماتك المحفوظة");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // لا نجلب إن كانت الصفحة بذرتنا بالفعل من السيرفر.
  useEffect(() => {
    if (initial.length > 0) {
      setIsLoading(false);
      return;
    }
    void refresh();
  }, [refresh, initial.length]);

  const isLearned = useCallback(
    (word: string) => learned.has(word.trim().toLowerCase()),
    [learned]
  );

  /** يسجّل مراجعة (صحيحة افتراضياً) ويرجّع نتيجة السيرفر أو null عند الفشل. */
  const review = useCallback(
    async (
    word: string,
    options?: {partOfSpeech?: string;correct?: boolean;seed?: WordSeed;})
    : Promise<WordReviewOutcome | null> => {
      const key = word.trim().toLowerCase();
      if (!key || pending === key) return null;

      const correct = options?.correct ?? true;
      const wasLearned = learned.has(key);
      if (wasLearned && correct) return null; // لا شيء جديد ليُحفظ

      setPending(key);
      if (correct) setLearned((prev) => new Set(prev).add(key)); // تفاؤلي

      const result = await recordWordReviewByTextAction({
        word: key,
        partOfSpeech: options?.partOfSpeech,
        correct,
        seed: normalizeSeed(options?.seed)
      });

      if (!result.ok) {
        if (correct && !wasLearned) {
          setLearned((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        }
        setError(result.error);
        setPending(null);
        return null;
      }

      // الحقيقة من السيرفر تتقدّم على التفاؤل.
setLearned((prev) => {
  const next = new Set(prev);

  if (result.data?.status === "learned") {
    next.add(key);
  } else {
    next.delete(key);
  }

  return next;
});

const outcome: WordReviewOutcome = {
  word: key,
  status: result.data?.status ?? "learning",
  xpAwarded: result.data?.xp_awarded ?? 0,
  xpTotal: result.data?.xp_total ?? 0
};

setLastResult(outcome);
setError(null);
setPending(null);
return outcome;
    },
    [learned, pending]
  );

  /** توافق خلفي مع نداءات `markLearned(word, partOfSpeech)` القديمة. */
  const markLearned = useCallback(
    async (word: string, partOfSpeech?: string, seed?: WordSeed) => {
      await review(word, { partOfSpeech, correct: true, seed });
    },
    [review]
  );

  return {
    learned,
    learnedCount: learned.size,
    isLearned,
    review,
    markLearned,
    pending,
    isLoading,
    error,
    lastResult,
    clearError: () => setError(null),
    refresh
  };
}