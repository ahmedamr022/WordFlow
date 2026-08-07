/**
 * WordFlow — pronunciation playback.
 * Wraps `speechSynthesis` with a "currently speaking" flag so buttons can
 * show real feedback instead of firing blindly.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export function useSpeech() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window)
      window.speechSynthesis.cancel();
    },
    []
  );

  const speak = useCallback((text: string, id = text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.92;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);

    // Safari sometimes never fires onend — fail safe.
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setSpeakingId(null), 4000);
  }, []);

  return { speak, speakingId };
}