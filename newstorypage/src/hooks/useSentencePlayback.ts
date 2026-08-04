import { useCallback, useEffect, useRef, useState } from 'react';

const WORD_DURATION = 380;

interface Options {
  wordCount: number;
  autoReplay: boolean;
  onFinish: () => void;
}

export function useSentencePlayback({ wordCount, autoReplay, onFinish }: Options) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeToken, setActiveToken] = useState(-1);
  const timerRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setIsPlaying(false);
    setActiveToken(-1);
  }, []);

  const play = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setIsPlaying(true);
    setActiveToken(0);
    let index = 0;
    timerRef.current = window.setInterval(() => {
      index += 1;
      if (index >= wordCount) {
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
        setActiveToken(-1);
        setIsPlaying(false);
        if (autoReplay) {
          window.setTimeout(() => play(), 500);
        } else {
          onFinish();
        }
        return;
      }
      setActiveToken(index);
    }, WORD_DURATION);
  }, [autoReplay, onFinish, wordCount]);

  const toggle = useCallback(() => {
    if (isPlaying) stop();else
    play();
  }, [isPlaying, play, stop]);

  useEffect(() => stop, [stop]);

  return { isPlaying, activeToken, play, stop, toggle };
}