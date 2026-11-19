'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  count?: number;
  roomMembers?: any[];
  deltaMin?: number;
  deltaMax?: number;
  refreshMinSec?: number;
  refreshMaxSec?: number;
  label?: string;
  isDark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
};

const SIZES = {
  sm: { dot: 'w-1.5 h-1.5', num: 'text-[11px]', txt: 'text-[11px]', gap: 'gap-1.5' },
  md: { dot: 'w-2 h-2',     num: 'text-[13px]', txt: 'text-[13px]', gap: 'gap-2' },
  lg: { dot: 'w-2.5 h-2.5', num: 'text-[15px]', txt: 'text-[15px]', gap: 'gap-2.5' },
} as const;

export default function StudyingNowBadge({
  count,
  roomMembers = [],
  deltaMin = 2,
  deltaMax = 2,
  refreshMinSec = 5,
  refreshMaxSec = 15,
  label = 'studying now',
  isDark = true,
  size = 'md',
  showDot = true,
  className = '',
}: Props) {
  // 🎯 الرقم الأساسي (حقيقي من DB أو من الأعضاء)
  const [realBase, setRealBase] = useState<number>(() => {
    if (typeof count === 'number') return count;
    return roomMembers.filter((m) => m?.is_studying).length;
  });

  // 🎲 التقلب — بيبدأ بقيمة عشوائية من أول لحظة (مش 0)
  const [delta, setDelta] = useState<number>(() => {
    const range = deltaMax - (-deltaMin) + 1;
    return Math.floor(Math.random() * range) - deltaMin;
  });

  // حدّث realBase لو count أو roomMembers اتغيروا
  useEffect(() => {
    if (typeof count === 'number') {
      setRealBase(count);
    } else {
      setRealBase(roomMembers.filter((m) => m?.is_studying).length);
    }
  }, [count, roomMembers]);

  // 🎲 جدول التقلبات
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const minMs = refreshMinSec * 1000;
      const maxMs = refreshMaxSec * 1000;
      const delay = minMs + Math.random() * (maxMs - minMs);

      timer = setTimeout(() => {
        setDelta((prev) => {
          const change = Math.floor(Math.random() * 5) - 2; // -2 … +2
          const next = prev + change;
          return Math.max(-deltaMin, Math.min(deltaMax, next));
        });
        schedule();
      }, delay);
    };

    schedule();
    return () => clearTimeout(timer);
  }, [deltaMin, deltaMax, refreshMinSec, refreshMaxSec]);

  // 🧮 النهائي (ما يقلش عن 0)
  const total = Math.max(0, realBase + delta);
  const s = SIZES[size];

  return (
    <span
      className={`inline-flex items-center ${s.gap} ${
        isDark ? 'text-slate-300' : 'text-slate-600'
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      {showDot && (
        <span className="relative inline-flex items-center justify-center shrink-0">
          <span
            className={`absolute inline-flex ${s.dot} rounded-full bg-emerald-400 opacity-75 animate-ping`}
          />
          <span className={`relative inline-flex ${s.dot} rounded-full bg-emerald-500`} />
        </span>
      )}

      <span className={`${s.num} tabular-nums font-semibold`}>
        {total.toLocaleString('en-US')}
      </span>

      <span className={`${s.txt} opacity-80`}>{label}</span>
    </span>
  );
}