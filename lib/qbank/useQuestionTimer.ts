'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createTimer, pauseTimer, resumeTimer, finishTimer,
  activeMsAt, type TimerState,
} from './timing';

/**
 * React hook: tracks active time on a question.
 * Auto-pauses when:
 *   - the browser tab becomes hidden
 *   - the window loses focus
 *
 * Returns current activeMs (updates every ~1s) + finish() to end + reset(newId).
 */
export function useQuestionTimer(questionId: number | null | undefined) {
  const [activeMs, setActiveMs] = useState(0);
  const timerRef = useRef<TimerState | null>(null);

  // (Re)start when question changes
  useEffect(() => {
    if (questionId == null) {
      timerRef.current = null;
      setActiveMs(0);
      return;
    }
    timerRef.current = createTimer(questionId);
    setActiveMs(0);

    return () => {
      if (timerRef.current) {
        timerRef.current = finishTimer(timerRef.current);
      }
    };
  }, [questionId]);

  // Pause / resume on visibility + focus changes
  useEffect(() => {
    const onHide = () => {
      if (timerRef.current) timerRef.current = pauseTimer(timerRef.current);
    };
    const onShow = () => {
      if (timerRef.current) timerRef.current = resumeTimer(timerRef.current);
    };

    document.addEventListener('visibilitychange', () => {
      document.hidden ? onHide() : onShow();
    });
    window.addEventListener('blur', onHide);
    window.addEventListener('focus', onShow);

    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('blur', onHide);
      window.removeEventListener('focus', onShow);
    };
  }, []);

  // Tick every 1s
  useEffect(() => {
    const id = setInterval(() => {
      if (!timerRef.current) return;
      setActiveMs(activeMsAt(timerRef.current, Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const finish = useCallback((): number => {
    if (!timerRef.current) return 0;
    timerRef.current = finishTimer(timerRef.current);
    const total = timerRef.current.activeMs;
    setActiveMs(total);
    return total;
  }, []);

  return { activeMs, finish };
}