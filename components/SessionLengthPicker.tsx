'use client';

import { Activity, Coffee, Infinity as InfinityIcon, Settings2 } from 'lucide-react';

/* One picker for both the lobby (StudyWithMe) and the in-room Settings panel.
 * Row 1: timed sessions · Row 2: open-ended modes · Row 3 (optional): Custom */

export type SessionMode = 25 | 50 | 90 | 'marathon' | 'nonstop';

type Props = {
  value: SessionMode | null; // null = custom session or nothing chosen
  onChange: (mode: SessionMode) => void;
  isDark?: boolean;
  disabled?: boolean;
  lang?: 'en' | 'ar';
  onCustom?: () => void;
  customActive?: boolean;
};

/* Texts mirror SESSION_CONFIGS in studyRoomData.ts — update both together. */
const STR = {
  en: {
    group: 'Session length',
    min: 'min',
    marathon: 'Marathon',
    marathonCap: 'No limit · with breaks',
    nonstop: 'Non-stop',
    nonstopCap: 'Stopwatch · no breaks',
    custom: 'Custom',
    hints: {
      25: 'One uninterrupted 25-minute block. No breaks.',
      50: 'Three focus blocks of about 17 minutes, with a 1-minute break between them.',
      90: 'Four focus blocks of about 22 minutes, with a 2-minute break between them.',
      marathon: 'Study as long as you like. After every 30 minutes of focus, a 5-minute break unlocks.',
      nonstop: 'A continuous stopwatch with no breaks. It simply records how long you study.',
      custom: 'Set your own focus, break and round lengths below.',
    },
  },
  ar: {
    group: 'مدة الجلسة',
    min: 'دقيقة',
    marathon: 'ماراثون',
    marathonCap: 'بدون حد · فيه بريك',
    nonstop: 'متواصل',
    nonstopCap: 'ستوب ووتش · بدون بريك',
    custom: 'مخصص',
    hints: {
      25: 'بلوك تركيز واحد ٢٥ دقيقة من غير بريك.',
      50: 'تلات بلوكات تركيز (حوالي ١٧ دقيقة) بينهم بريك دقيقة.',
      90: 'أربع بلوكات تركيز (حوالي ٢٢ دقيقة) بينهم بريك دقيقتين.',
      marathon: 'ذاكر براحتك من غير حد زمني. بعد كل ٣٠ دقيقة تركيز بيتفتح بريك ٥ دقايق.',
      nonstop: 'ستوب ووتش متواصل من غير بريك، بيسجّل بس مدة مذاكرتك.',
      custom: 'حدّد مدة التركيز والبريك وعدد الجولات تحت.',
    },
  },
} as const;

const TIMED: (25 | 50 | 90)[] = [25, 50, 90];

/* Conversion to/from the numbers the app already uses:
 * 25 / 50 / 90 minutes, -1 = Unlimited (Marathon), -2 = Study Tracking (Non-stop), 0 = Custom. */
export const modeFromFocus = (setting: number): SessionMode | null =>
  setting === -1 ? 'marathon'
  : setting === -2 ? 'nonstop'
  : setting === 25 || setting === 50 || setting === 90 ? setting
  : null;

export const focusFromMode = (mode: SessionMode): number =>
  mode === 'marathon' ? -1 : mode === 'nonstop' ? -2 : mode;

export default function SessionLengthPicker({
  value, onChange, isDark = true, disabled, lang = 'en', onCustom, customActive,
}: Props) {
  const s = STR[lang];

  const chip = (active: boolean) =>
    `rounded-2xl border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 disabled:opacity-50 ${
      active
        ? isDark
          ? 'border-cyan-400/70 bg-cyan-400/10 text-white'
          : 'border-cyan-500 bg-cyan-50 text-cyan-900'
        : isDark
          ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
    }`;

  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const purple = isDark ? 'text-violet-300' : 'text-violet-700';

  const hint = customActive ? s.hints.custom : value === null ? '' : s.hints[value];

  const open = [
    { id: 'marathon' as const, title: s.marathon, caption: s.marathonCap, Icon: InfinityIcon, badge: true },
    { id: 'nonstop' as const, title: s.nonstop, caption: s.nonstopCap, Icon: Activity, badge: false },
  ];

  return (
    <div className="w-full space-y-2" role="radiogroup" aria-label={s.group} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Row 1 — timed sessions */}
      <div className="grid grid-cols-3 gap-2">
        {TIMED.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n && !customActive}
            disabled={disabled}
            onClick={() => onChange(n)}
            className={`${chip(value === n && !customActive)} px-2 py-2.5 text-center text-sm font-bold`}
          >
            {n} {s.min}
          </button>
        ))}
      </div>

      {/* Row 2 — open-ended sessions */}
      <div className="grid grid-cols-2 gap-2">
        {open.map(({ id, title, caption, Icon, badge }) => {
          const active = value === id && !customActive;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(id)}
              className={`${chip(active)} flex items-center gap-2.5 px-3 py-2.5 text-start`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-sm font-bold">
                  {title}
                  {badge && <Coffee size={12} className="text-cyan-400" aria-hidden />}
                </span>
                <span className={`block text-[11px] font-semibold leading-tight ${purple}`}>{caption}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Row 3 — optional custom session */}
      {onCustom && (
        <button
          type="button"
          role="radio"
          aria-checked={!!customActive}
          disabled={disabled}
          onClick={onCustom}
          className={`${chip(!!customActive)} flex w-full items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold`}
        >
          <Settings2 size={16} /> {s.custom}
        </button>
      )}

      <p className={`min-h-[2.25rem] text-[12px] font-medium leading-relaxed ${muted}`} aria-live="polite">
        {hint}
      </p>
    </div>
  );
}