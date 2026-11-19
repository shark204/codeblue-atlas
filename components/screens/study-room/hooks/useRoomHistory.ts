'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type SessionRecord = {
  id: number;
  date: string;
  focusSeconds: number;
  goalsDone: string[];
  goalsTotal: number;
  configLabel: string;
};

const LIMIT = 100;
const GLOBAL_KEY = 'cb-session-history';

export function useRoomHistory(
  userId: string | undefined,
  mySeconds: number,
  cumulativeRef: React.MutableRefObject<number>,
) {
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const storageKey = userId ? `${GLOBAL_KEY}:${userId}` : GLOBAL_KEY;

  // ⚡ يمنع الـ persist الأول بعد التحميل
  const skipPersistRef = useRef(false);

  // ═══ 1) LOAD ═══
  useEffect(() => {
    skipPersistRef.current = true;
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      setHistory(Array.isArray(parsed) ? parsed : []);
      console.log('[history] loaded', parsed.length, 'from', storageKey);
    } catch (e) {
      console.warn('[history] load failed:', e);
      setHistory([]);
    }
  }, [storageKey]);

  // ═══ 2) PERSIST — يشتغل فقط لما الـ history يتغير فعلاً ═══
  useEffect(() => {
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;   // ⛔ تخطّى أول تشغيل بعد التحميل
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
      console.log('[history] saved', history.length, '→', storageKey);
    } catch (e) {
      console.warn('[history] save failed:', e);
    }
  }, [history, storageKey]);

  // ═══ 3) Add ═══
  const addRecord = useCallback((record: SessionRecord) => {
    setHistory((prev) => {
      if (prev.some((r) => r.id === record.id)) return prev;
      return [record, ...prev].slice(0, LIMIT);
    });
  }, []);

  // ═══ 4) Delete one record ═══
  const deleteRecord = useCallback((id: number) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ═══ 5) Clear all ═══
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // ═══ 6) Snapshot on goal change ═══
  const saveGoalsSnapshot = useCallback((
    goals: { id: number; t: string; done: boolean }[],
    trigger: 'toggle' | 'add' | 'delete',
    configLabel: string,
  ) => {
    if (goals.length === 0) return;

    const done = goals.filter((g) => g.done).map((g) => g.t);
    if (trigger === 'toggle' && done.length === 0) return;

    const focusSecs = Math.max(cumulativeRef.current, mySeconds);

    addRecord({
      id: Date.now(),
      date: new Date().toISOString(),
      focusSeconds: focusSecs,
      goalsDone: done,
      goalsTotal: goals.length,
      configLabel,
    });
  }, [addRecord, mySeconds, cumulativeRef]);

  return { history, addRecord, deleteRecord, clearHistory, saveGoalsSnapshot };
}