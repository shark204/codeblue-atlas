'use client';

import { Brain, Shuffle, ListOrdered } from 'lucide-react';
import type { SessionMode } from '../lib/qbank/types';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  value: SessionMode;
  onChange: (mode: SessionMode) => void;
  isDark: boolean;
  compact?: boolean;
};

const MODES: {
  id: SessionMode;
  label: string;
  labelAr: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  tooltip: string;
}[] = [
  {
    id: 'adaptive',
    label: 'Smart',
    labelAr: 'ذكي',
    icon: Brain,
    color: 'violet',
    tooltip: 'ترتيب ذكي حسب أدائك ونقاط ضعفك',
  },
  {
    id: 'shuffle',
    label: 'Shuffle',
    labelAr: 'عشوائي',
    icon: Shuffle,
    color: 'sky',
    tooltip: 'ترتيب عشوائي كل مرة',
  },
  {
    id: 'default',
    label: 'Original',
    labelAr: 'الأصلي',
    icon: ListOrdered,
    color: 'slate',
    tooltip: 'الترتيب الأصلي للأسئلة',
  },
];

export default function AdaptiveModeToggle({
  value,
  onChange,
  isDark,
  compact = false,
}: Props) {
    const t = useTranslations('components_AdaptiveModeToggle');
  return (
    <div
      role="radiogroup"
      aria-label={t('session_ordering_mode')}
      className={`inline-flex items-center gap-1 rounded-xl border p-1 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}
    >
      {MODES.map((m) => {
        const active = value === m.id;
        const Icon = m.icon;

        const activeCls =
          m.color === 'violet'
            ? 'bg-violet-500/15 text-violet-300 border-violet-500/50'
            : m.color === 'sky'
              ? 'bg-sky-500/15 text-sky-300 border-sky-500/50'
              : isDark
                ? 'bg-slate-800 text-slate-200 border-slate-700'
                : 'bg-white text-slate-700 border-slate-300';

        const inactiveCls = isDark
          ? 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 border-transparent'
          : 'text-slate-500 hover:bg-white hover:text-slate-800 border-transparent';

        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={m.tooltip}
            title={m.tooltip}
            onClick={() => onChange(m.id)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-black transition-all ${
              active ? activeCls : inactiveCls
            }`}
          >
            <Icon size={13} />
            {!compact && <span>{m.label}</span>}
          </button>
        );
      })}
    </div>
  );
}