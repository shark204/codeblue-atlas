'use client';

import { useId } from 'react';

type Props = {
  isDark?: boolean;
  size?: number;        // default 96
  label?: string;       // optional text under the heart
  fullScreen?: boolean; // full-screen overlay
  className?: string;
};

const CSS = `
.lh-heart   { transform-origin: 50% 50%; animation: lh-beat 1.6s cubic-bezier(.3,0,.3,1) infinite; }
.lh-glow    { animation: lh-glow 1.6s ease-out infinite; }
.lh-ring    { transform-box: fill-box; transform-origin: 50% 50%; opacity: 0; animation: lh-ring 1.6s ease-out infinite; }
.lh-ring-2  { animation-delay: .14s; }
.lh-sweep   { stroke-dasharray: 24 130; animation: lh-sweep 1.6s linear infinite; }
.lh-dots span { animation: lh-dot 1.6s ease-in-out infinite; }
.lh-dots span:nth-child(2) { animation-delay: .15s; }
.lh-dots span:nth-child(3) { animation-delay: .3s; }

@keyframes lh-beat {
  0%, 34%  { transform: scale(1); }
  41%      { transform: scale(1.11); }
  50%      { transform: scale(.985); }
  58%      { transform: scale(1.055); }
  68%, 100%{ transform: scale(1); }
}
@keyframes lh-glow {
  0%, 34%  { opacity: .30; transform: scale(.95); }
  41%      { opacity: .95; transform: scale(1.18); }
  58%      { opacity: .60; transform: scale(1.08); }
  75%, 100%{ opacity: .30; transform: scale(.95); }
}
@keyframes lh-ring {
  0%, 38%  { opacity: 0; transform: scale(1); }
  42%      { opacity: .55; }
  78%,100% { opacity: 0; transform: scale(1.55); }
}
@keyframes lh-sweep {
  0%   { stroke-dashoffset: 24; }
  85%, 100% { stroke-dashoffset: -104; }
}
@keyframes lh-dot {
  0%, 60%, 100% { opacity: .25; }
  30%           { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .lh-heart, .lh-glow, .lh-ring, .lh-sweep, .lh-dots span { animation: none !important; }
  .lh-sweep { stroke-dasharray: none; }
}
`;

const HEART =
  'M50 91 C50 91 7 63 7 33 C7 18 18 8 31 8 C40 8 47 12.5 50 20 C53 12.5 60 8 69 8 C82 8 93 18 93 33 C93 63 50 91 50 91 Z';

const ECG =
  'M-2 54 H22 L28 54 L33 46 L38 58 L45 16 L52 84 L58 50 L63 54 L69 48 L74 54 H102';

export default function LoadingHeart({
  size = 96,
  label = 'Loading…',
  fullScreen = false,
  className = '',
}: Props) {
  const uid = useId().replace(/:/g, '');
  const id = (n: string) => `lh-${n}-${uid}`;

  const content = (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-5 ${className}`}
    >
      <style>{CSS}</style>

      <div className="relative" style={{ width: size, height: size }}>
        {/* ✅ توهج ناعم ورا القلب - استخدمنا Tailwind arbitrary values عشان نحل مشكلة الـ Hydration */}
        <div
          className="lh-glow absolute pointer-events-none rounded-full bg-[radial-gradient(circle,rgba(244,63,94,0.4)_0%,transparent_68%)] dark:bg-[radial-gradient(circle,rgba(244,63,94,0.6)_0%,transparent_68%)]"
          style={{
            top: -size * 0.25,
            right: -size * 0.25,
            bottom: -size * 0.25,
            left: -size * 0.25,
            filter: `blur(${Math.round(size * 0.22)}px)`,
          }}
        />

        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className="relative overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={id('body')} x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#ff6b88" />
              <stop offset="55%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>

            <linearGradient id={id('gloss')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>

            <radialGradient id={id('depth')} cx="0.5" cy="0.35" r="0.75">
              <stop offset="60%" stopColor="#881337" stopOpacity="0" />
              <stop offset="100%" stopColor="#881337" stopOpacity="0.55" />
            </radialGradient>

            <clipPath id={id('clip')}>
              <path d={HEART} />
            </clipPath>

            <filter id={id('neon')} x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="1.6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path d={HEART} fill="none" stroke="#fb7185" strokeWidth="1.2" className="lh-ring" />
          <path d={HEART} fill="none" stroke="#fb7185" strokeWidth="0.8" className="lh-ring lh-ring-2" />

          <g className="lh-heart">
            <path d={HEART} fill={`url(#${id('body')})`} />
            <path d={HEART} fill={`url(#${id('depth')})`} />

            <g clipPath={`url(#${id('clip')})`}>
              <ellipse cx="34" cy="24" rx="24" ry="13" fill={`url(#${id('gloss')})`} transform="rotate(-18 34 24)" />
              <path
                d={ECG}
                pathLength={100}
                fill="none"
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={ECG}
                pathLength={100}
                fill="none"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#${id('neon')})`}
                className="lh-sweep"
              />
            </g>
            <path d={HEART} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
          </g>
        </svg>
      </div>

      {label && (
        // ✅ استخدمنا dark: بدل شرط isDark
        <p className="text-sm font-semibold tracking-wide text-slate-600 dark:text-slate-300">
          {label.replace(/[….]+$/, '')}
          <span className="lh-dots inline-flex ms-0.5" aria-hidden="true">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      // ✅ استخدمنا dark: بدل شرط isDark
      <div className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-sm bg-white/80 dark:bg-slate-950/80">
        {content}
      </div>
    );
  }

  return content;
}