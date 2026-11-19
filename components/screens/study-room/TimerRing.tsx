'use client';
import { useState, useEffect, memo } from 'react';
import { clock, hm, type Mode } from './studyRoomData';

export const TimerRing = memo(function TimerRing({
  endsAt,
  mode,
  chunkDur,
  breakDur,
  isCountingUp,
  currentFocusSeconds,
  isUnlimitedNow,
  chunkLabel,
  maxFocusSeconds,
}: {
  endsAt: number | null;
  mode: Mode;
  chunkDur: number;
  breakDur: number;
  isCountingUp: boolean;
  currentFocusSeconds: number;
  isUnlimitedNow: boolean;
  chunkLabel: string;
  maxFocusSeconds: number;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const R = 128, C = 2 * Math.PI * R;
  const segmentTotal = mode === 'focus' ? chunkDur : breakDur;
  const left = endsAt ? Math.max(0, Math.floor((endsAt - now) / 1000)) : segmentTotal;
  const segmentElapsed = Math.max(0, segmentTotal - left);

  const progress = isCountingUp
    ? Math.min(1, currentFocusSeconds / (4 * 60 * 60))
    : (segmentTotal > 0 ? segmentElapsed / segmentTotal : 0);

  const displayTime = isCountingUp ? currentFocusSeconds : left;

  return (
    <div className="sr-ring">
      <svg viewBox="0 0 280 280" aria-hidden="true">
        <defs>
          <linearGradient id="srg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#22d3ee" /><stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <circle cx="140" cy="140" r={R} className="track" />
        <circle cx="140" cy="140" r={R} className="bar" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} />
      </svg>
      <div className="sr-time" role="timer">
        <b>{clock(displayTime)}{isUnlimitedNow && '+'}</b>
        <span>{chunkLabel}</span>
        <small style={{ opacity: 0.65, fontSize: 11, marginTop: 2 }}>
  Total Focus: {hm(maxFocusSeconds)}
</small>
      </div>
    </div>
  );
});