import { useState, useEffect, useRef, useCallback } from "react";
import { StoryLine, TypingMetrics } from "@/types";
import { SoundEffects } from "@/lib/audio/soundEffects";

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

  // حماية من الحالات التي تكون فيها مصفوفة lines فارغة أو غير معرّفة
  const currentLine = lines && lines.length > 0 ? lines[currentLineIndex] : undefined;

  // الحماية من قراءة text من undefined
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

  const restart = useCallback(() => {
    setCurrentLineIndex(0);
    setIsCompleted(false);
    resetState();
  }, [resetState]);

  useEffect(() => {
    resetState();
  }, [currentLineIndex, resetState]);

  const processInput = useCallback(
    (val: string) => {
      if (!targetText || isCompleted) return;

      if (!startTime && val.length > 0) {
        setStartTime(Date.now());
      }

      if (val.length > targetText.length) return;

      if (val.length > typedChars.length) {
        SoundEffects.playKeyClick();
      }

      const newErrors = val
        .split("")
        .map((char, index) => char.toLowerCase() !== targetText[index]?.toLowerCase());

      setTypedChars(val);
      setErrors(newErrors);

      const typedWords = val.trim().split(/\s+/).filter(Boolean);
      const targetWords = targetText.split(/\s+/).filter(Boolean);

      let currentCompletedWords = 0;
      typedWords.forEach((word, idx) => {
        if (
          targetWords[idx] &&
          word.toLowerCase() === targetWords[idx].toLowerCase().replace(/[.,!?;:'"”-]/g, "")
        ) {
          currentCompletedWords++;
        }
      });

      if (currentCompletedWords > completedWordsCount.current) {
        completedWordsCount.current = currentCompletedWords;
        SoundEffects.playWordSuccess();
      }

      const totalTyped = val.length;
      const errorCount = newErrors.filter(Boolean).length;
      const correctTyped = totalTyped - errorCount;
      const accuracy = totalTyped > 0 ? Math.round((correctTyped / totalTyped) * 100) : 100;

      let wpm = 0;
      let elapsedSeconds = 0;
      if (startTime) {
        elapsedSeconds = Math.max(1, (Date.now() - startTime) / 1000);
        wpm = Math.round((correctTyped / 5) / (elapsedSeconds / 60));
      }

      setMetrics({
        wpm: Math.max(0, wpm),
        accuracy: Math.max(0, accuracy),
        correctChars: correctTyped,
        incorrectChars: errorCount,
        totalCharsTyped: totalTyped,
        timeSpentSeconds: Math.round(elapsedSeconds),
      });

      const cleanTyped = val.toLowerCase().replace(/[.,!?;:'"”-]/g, "").trim();
      const cleanTarget = targetText.toLowerCase().replace(/[.,!?;:'"”-]/g, "").trim();

      if (cleanTyped === cleanTarget && cleanTarget.length > 0) {
        SoundEffects.playLineSuccess();
        setTimeout(() => {
          if (currentLineIndex < lines.length - 1) {
            setCurrentLineIndex((prev) => prev + 1);
          } else {
            setIsCompleted(true);
            onComplete?.();
          }
        }, 1500);
      }
    },
    [targetText, isCompleted, startTime, typedChars.length, currentLineIndex, lines.length, onComplete]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processInput(e.target.value);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        processInput(typedChars.slice(0, -1));
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        processInput(typedChars + e.key);
      }
    },
    [typedChars, processInput]
  );

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return {
    currentLineIndex,
    currentLine,
    inputRef,
    typedChars,
    errors,
    currentIndex: typedChars.length,
    handleInputChange,
    handleKeyDown,
    focusInput,
    metrics,
    isCompleted,
    restart,
  };
}