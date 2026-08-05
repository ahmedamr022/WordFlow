import { useState, useEffect, useRef, useCallback } from "react";
import { StoryLine, TypingMetrics } from "../types";
import { SoundEffects } from "../lib/audio/soundEffects";

interface UseTypingEngineProps {
  lines: StoryLine[];
  onComplete?: () => void;
}

export function useTypingEngine({ lines, onComplete }: UseTypingEngineProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [typedChars, setTypedChars] = useState("");
  const [errors, setErrors] = useState<boolean[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<TypingMetrics>({
    wpm: 0,
    accuracy: 100,
    correctChars: 0,
    incorrectChars: 0,
    totalCharsTyped: 0,
    timeSpentSeconds: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const completedWordsCount = useRef(0);
  const advanceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentLine = lines && lines.length > 0 ? lines[currentLineIndex] : undefined;
  const rawTargetText = currentLine?.text || "";
  const targetText = rawTargetText.replace(/[.,!?;:'"”-]+$/g, "");

  const resetState = useCallback(() => {
    setTypedChars("");
    setErrors([]);
    setStartTime(null);
    completedWordsCount.current = 0;
    setMetrics({
      wpm: 0,
      accuracy: 100,
      correctChars: 0,
      incorrectChars: 0,
      totalCharsTyped: 0,
      timeSpentSeconds: 0,
    });
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const resetLine = useCallback(() => {
    if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
    resetState();
  }, [resetState]);

  const restart = useCallback(() => {
    if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
    setCurrentLineIndex(0);
    setIsCompleted(false);
    resetState();
  }, [resetState]);

  const goToLine = useCallback(
    (index: number) => {
      if (!lines || lines.length === 0) return;
      const next = Math.max(0, Math.min(index, lines.length - 1));
      if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
      setIsCompleted(false);
      setCurrentLineIndex(next);
    },
    [lines]
  );

  const goNext = useCallback(() => {
    goToLine(currentLineIndex + 1);
  }, [currentLineIndex, goToLine]);

  const goPrev = useCallback(() => {
    goToLine(currentLineIndex - 1);
  }, [currentLineIndex, goToLine]);

  useEffect(() => {
    resetState();
  }, [currentLineIndex, resetState]);

  useEffect(() => {
    return () => {
      if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
    };
  }, []);

  const processInput = useCallback(
    (val: string) => {
      if (!targetText || isCompleted) return;

      if (!startTime && val.length > 0) {
        setStartTime(Date.now());
      }

      if (val.length > targetText.length) return;

      const newErrors = val
        .split("")
        .map((char, index) => char.toLowerCase() !== targetText[index]?.toLowerCase());

      if (val.length > typedChars.length) {
        if (newErrors[val.length - 1]) {
          SoundEffects.playKeyError();
        } else {
          SoundEffects.playKeyClick();
        }
      }

      setTypedChars(val);
      setErrors(newErrors);

      // تنظيف الكلمات والمقارنة الدقيقة لتفعيل صوت صحة الكلمة (Word Success Sound)
      const cleanTargetWords = targetText
        .split(/\s+/)
        .map((w) => w.replace(/[^a-zA-Z0-9]/g, "").toLowerCase())
        .filter(Boolean);

      const isSpaceOrEnd = val.endsWith(" ") || val.length === targetText.length;
      const currentTypedWords = val
        .trim()
        .split(/\s+/)
        .map((w) => w.replace(/[^a-zA-Z0-9]/g, "").toLowerCase())
        .filter(Boolean);

      let currentCompletedWords = 0;
      currentTypedWords.forEach((word, idx) => {
        if (cleanTargetWords[idx] && word === cleanTargetWords[idx]) {
          if (idx < currentTypedWords.length - 1 || isSpaceOrEnd) {
            currentCompletedWords++;
          }
        }
      });

      // تشغيل الصوت عند اكتمال كلمة جديدة فقط بشرط ألا تكون الكلمة الأخيرة بالجملة
      if (
        currentCompletedWords > completedWordsCount.current &&
        currentCompletedWords < cleanTargetWords.length
      ) {
        SoundEffects.playWordSuccess();
      }
      completedWordsCount.current = currentCompletedWords;

      const totalTyped = val.length;
      const errorCount = newErrors.filter(Boolean).length;
      const correctTyped = totalTyped - errorCount;
      const accuracy = totalTyped > 0 ? Math.round((correctTyped / totalTyped) * 100) : 100;

      let wpm = 0;
      let elapsedSeconds = 0;
      if (startTime) {
        elapsedSeconds = Math.max(1, (Date.now() - startTime) / 1000);
        wpm = Math.round(correctTyped / 5 / (elapsedSeconds / 60));
      }

      setMetrics({
        wpm: Math.max(0, wpm),
        accuracy: Math.max(0, accuracy),
        correctChars: correctTyped,
        incorrectChars: errorCount,
        totalCharsTyped: totalTyped,
        timeSpentSeconds: Math.round(elapsedSeconds),
      });

      const cleanTyped = val.toLowerCase().replace(/[^a-zA-Z0-9]/g, "").trim();
      const cleanTarget = targetText.toLowerCase().replace(/[^a-zA-Z0-9]/g, "").trim();

      // عند إنهاء السطر كاملاً بنجاح
      if (cleanTyped === cleanTarget && cleanTarget.length > 0) {
        SoundEffects.playLineSuccess(); // تشغيل صوت النجاح المميز في نهاية الجملة
        if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
        advanceTimeout.current = setTimeout(() => {
          if (currentLineIndex < lines.length - 1) {
            setCurrentLineIndex((prev) => prev + 1);
          } else {
            setIsCompleted(true);
            onComplete?.();
          }
        }, 1200);
      }
    },
    [targetText, isCompleted, startTime, typedChars.length, currentLineIndex, lines.length, onComplete]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processInput(e.target.value);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        processInput(typedChars.slice(0, -1));
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        resetLine();
        return;
      }

      if (e.key.length === 1 && e.key !== "\\") {
        e.preventDefault();
        processInput(typedChars + e.key);
      }
    },
    [typedChars, processInput, resetLine]
  );

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const isLineComplete = typedChars.length > 0 && typedChars.length === targetText.length;

  return {
    currentLineIndex,
    currentLine,
    targetText,
    inputRef,
    typedChars,
    errors,
    currentIndex: typedChars.length,
    handleInputChange,
    handleKeyDown,
    focusInput,
    metrics,
    isLineComplete,
    isCompleted,
    resetLine,
    restart,
    goToLine,
    goNext,
    goPrev,
  };
}