import { useCallback, useEffect, useRef, useState } from 'react';

interface Options {
  target: string;
  onComplete?: () => void;
}

/**
 * Turns the sentence into a typing exercise: letters the learner has typed become
 * bright, the rest stay grey (waiting to be typed), and a caret tracks the position.
 */
export function useTypingSentence({ target, onComplete }: Options) {
  const [typed, setTyped] = useState('');
  const completeRef = useRef(false);

  useEffect(() => {
    setTyped('');
    completeRef.current = false;
  }, [target]);

  const reset = useCallback(() => {
    setTyped('');
    completeRef.current = false;
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === 'Backspace') {
        event.preventDefault();
        setTyped((value) => value.slice(0, -1));
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setTyped('');
        return;
      }

      if (event.key.length !== 1 || event.key === '\\') return;

      event.preventDefault();
      setTyped((value) => value.length >= target.length ? value : value + event.key);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [target]);

  const isComplete = typed.length === target.length && typed === target;

  useEffect(() => {
    if (isComplete && !completeRef.current) {
      completeRef.current = true;
      const timer = window.setTimeout(() => onComplete?.(), 800);
      return () => window.clearTimeout(timer);
    }
  }, [isComplete, onComplete]);

  return { typed, reset, isComplete };
}