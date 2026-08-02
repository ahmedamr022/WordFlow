import { useState, useEffect, useRef, useCallback } from "react";
import { StoryLine, TypingMetrics } from "@/types";
import { SoundEffects } from "@/lib/audio/soundEffects";

interface UseTypingEngineProps {
  currentLine: StoryLine;
  onLineComplete: () => void;
}

export function useTypingEngine({ currentLine, onLineComplete }: UseTypingEngineProps) {
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

  // Clean target text: strip trailing periods and punctuation marks so user never needs to type them
  const rawTargetText = currentLine.text;
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

  useEffect(() => {
    resetState();
  }, [currentLine, resetState]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    // Allow typing up to target text length
    if (val.length > targetText.length) return;

    // Play mechanical key click on character input
    if (val.length > typedChars.length) {
      SoundEffects.playKeyClick();
    }

    // Case-insensitive & punctuation-aware character comparison
    const newErrors = val
      .split("")
      .map((char, index) => char.toLowerCase() !== targetText[index]?.toLowerCase());

    setTypedChars(val);
    setErrors(newErrors);

    // Calculate word completion and trigger word success sound effect
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

    // If a new word was just correctly completed, play word success chime
    if (currentCompletedWords > completedWordsCount.current) {
      completedWordsCount.current = currentCompletedWords;
      SoundEffects.playWordSuccess();
    }

    // Calculate live metrics
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

    // Line completion check (case-insensitive & punctuation-safe)
    const cleanTyped = val.toLowerCase().replace(/[.,!?;:'"”-]/g, "").trim();
    const cleanTarget = targetText.toLowerCase().replace(/[.,!?;:'"”-]/g, "").trim();

    if (cleanTyped === cleanTarget) {
      SoundEffects.playLineSuccess();
      setTimeout(() => {
        onLineComplete();
      }, 1500);
    }
  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return {
    inputRef,
    typedChars,
    errors,
    currentIndex: typedChars.length,
    handleInputChange,
    focusInput,
    metrics,
  };
}
