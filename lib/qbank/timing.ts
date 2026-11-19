// ═══════════════════════════════════════════════════════════════
// Question Timer — pauses when tab is hidden
// Ported from SIRIUS question-timing.js (pure TS)
// ═══════════════════════════════════════════════════════════════

const DEFAULT_MAX_ACTIVE_MS = 30 * 60 * 1000; // 30 min cap

export type TimerState = {
  questionId: number;
  startedAt: number;
  activeMs: number;
  pausedAt: number | null;
  endedAt: number | null;
  status: 'active' | 'paused' | 'finished';
};

function clampMs(value: number, max = DEFAULT_MAX_ACTIVE_MS): number {
  return Math.max(0, Math.min(max, Number(value) || 0));
}

export function createTimer(questionId: number, startedAt = Date.now()): TimerState {
  return {
    questionId,
    startedAt,
    activeMs: 0,
    pausedAt: null,
    endedAt: null,
    status: 'active',
  };
}

export function activeMsAt(timer: TimerState, at: number, maxMs = DEFAULT_MAX_ACTIVE_MS): number {
  const saved = clampMs(timer.activeMs, maxMs);
  if (timer.status !== 'active') return saved;
  return clampMs(saved + Math.max(0, at - timer.startedAt), maxMs);
}

export function pauseTimer(timer: TimerState, at = Date.now(), maxMs = DEFAULT_MAX_ACTIVE_MS): TimerState {
  if (timer.status !== 'active') return timer;
  return {
    ...timer,
    activeMs: activeMsAt(timer, at, maxMs),
    pausedAt: at,
    status: 'paused',
  };
}

export function resumeTimer(timer: TimerState, at = Date.now()): TimerState {
  if (timer.status !== 'paused') return timer;
  return {
    ...timer,
    startedAt: at,
    pausedAt: null,
    status: 'active',
  };
}

export function finishTimer(timer: TimerState, at = Date.now(), maxMs = DEFAULT_MAX_ACTIVE_MS): TimerState {
  if (timer.status === 'finished') return timer;
  return {
    ...timer,
    activeMs: activeMsAt(timer, at, maxMs),
    endedAt: at,
    pausedAt: timer.status === 'active' ? at : timer.pausedAt,
    status: 'finished',
  };
}

/** Normalized time signal for scoring (log scale, capped at 2 min) */
export function normalizedTimeSignal(activeMs: number, maxMs = 120_000): number {
  const safe = Math.max(0, Number(activeMs) || 0);
  const ceiling = Math.max(1, maxMs);
  return Math.max(0, Math.min(1, Math.log1p(safe) / Math.log1p(ceiling)));
}