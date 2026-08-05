import { useCallback, useEffect, useRef, useState } from "react";

const WORD_DURATION = 380;

interface UseSentencePlaybackProps {
  wordCount: number;
  autoReplay: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function useSentencePlayback({
  wordCount,
  autoReplay,
  onStart,
  onStop
}: UseSentencePlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const replayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoReplayRef = useRef(autoReplay);

  useEffect(() => {
    autoReplayRef.current = autoReplay;
  }, [autoReplay]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (replayRef.current) clearTimeout(replayRef.current);
    timerRef.current = null;
    replayRef.current = null;
  }, []);

  const stop = useCallback(() => {
    clearTimers();
    setIsPlaying(false);
    setActiveWordIndex(-1);
    onStop();
  }, [clearTimers, onStop]);

  const play = useCallback(() => {
    if (wordCount <= 0) return;
    clearTimers();
    onStart();
    setIsPlaying(true);
    setActiveWordIndex(0);

    let index = 0;
    timerRef.current = setInterval(() => {
      index += 1;
      if (index >= wordCount) {
        clearTimers();
        setActiveWordIndex(-1);
        setIsPlaying(false);
        if (autoReplayRef.current) {
          replayRef.current = setTimeout(() => play(), 600);
        }
        return;
      }
      setActiveWordIndex(index);
    }, WORD_DURATION);
  }, [clearTimers, onStart, wordCount]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }, [isPlaying, play, stop]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return { isPlaying, activeWordIndex, play, stop, toggle };
}