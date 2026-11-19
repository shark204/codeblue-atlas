'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from "@/stores/languageStore";

export type RowMenuItem = {
  label: string;
  icon?: string;
  onClick: () => void;
  danger?: boolean;
};

type Props = {
  isDark: boolean;
  items: RowMenuItem[];
};

export default function RowMenu({ isDark, items }: Props) {
    const t = useTranslations('components_screens_admin_RowMenu');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        title={t('more')}
        className={`w-8 h-8 rounded-lg grid place-items-center text-sm transition-colors ${
          isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'
        }`}
      >
        ⋯
      </button>

      {open && (
        <div
          className={`absolute start-0 top-9 z-40 min-w-[150px] rounded-lg border shadow-lg overflow-hidden ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          {items.map((it, i) => (
            <button
              key={i}
              onClick={() => {
                it.onClick();
                setOpen(false);
              }}
              className={`w-full text-end px-3 py-2 text-xs font-bold transition-colors ${
                it.danger
                  ? 'text-rose-500 hover:bg-rose-500/10'
                  : isDark
                  ? 'text-slate-200 hover:bg-slate-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {it.icon} {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}