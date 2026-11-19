'use client';

import { useCallback, useRef, useState } from 'react';
import { MistakeQueue, type DueMistake } from './mistakeQueue';

/**
 * React wrapper around MistakeQueue.
 * Uses a ref for the queue so mutations don't re-render needlessly.
 * `version` is bumped only when the observable state changes (size).
 */
export function useMistakeQueue(enabled: boolean = true) {
  const queueRef = useRef<MistakeQueue>(new MistakeQueue());
  const [size, setSize] = useState(0);
  const [, setVersion] = useState(0);

  const sync = () => {
    setSize(queueRef.current.size());
    setVersion((v) => v + 1);
  };

  const add = useCallback(
    (questionId: number, currentStep: number) => {
      if (!enabled) return;
      queueRef.current.add(questionId, currentStep);
      sync();
    },
    [enabled],
  );

  const markCorrect = useCallback(
    (questionId: number) => {
      if (!enabled) return;
      queueRef.current.markCorrect(questionId);
      sync();
    },
    [enabled],
  );

  const getDue = useCallback(
    (currentStep: number): DueMistake | null => {
      if (!enabled) return null;
      return queueRef.current.getDue(currentStep);
    },
    [enabled],
  );

  const reset = useCallback(() => {
    queueRef.current.reset();
    sync();
  }, []);

  const has = useCallback(
    (questionId: number): boolean => {
      if (!enabled) return false;
      return queueRef.current.has(questionId);
    },
    [enabled],
  );

  return { add, markCorrect, getDue, reset, has, size };
}