'use client';
import { useState, useRef, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from "@/stores/languageStore";

export type ToolbarAction = {
  label: string;
  icon?: string;
  onClick: () => void;
  danger?: boolean;
};

type Props = {
  isDark: boolean;
  title: string;
  count?: number;
  /** Optional badge next to the title (e.g. current panel) */
  badge?: { label: string; Icon?: LucideIcon; color?: string };
  search?: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
  };
  primary?: ToolbarAction;
  secondary?: ToolbarAction[];
  loading?: boolean;
  onRefresh?: () => void;
};

export default function AdminToolbar({
  isDark,
  title,
  count,
  badge,
  search,
  primary,
  secondary = [],
  loading,
  onRefresh,
}: Props) {
    const t = useTranslations('components_screens_admin_AdminToolbar');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const bar = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  const iconBtn = `w-9 h-9 rounded-lg grid place-items-center text-sm border transition-colors ${
    isDark
      ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
  }`;

  return (
    <div className={`p-3 rounded-2xl border flex flex-wrap items-center gap-2 ${bar}`}>
      {/* Title + Count + Badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className={`text-sm font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          {title}
          {count != null && <span className={`ms-2 text-xs font-bold ${muted}`}>({count})</span>}
        </h3>

        {badge && (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${
              badge.color ?? 'bg-amber-500/15 text-amber-500'
            }`}
          >
            {badge.Icon && <badge.Icon size={11} strokeWidth={2.5} />}
            {badge.label}
          </span>
        )}
      </div>

      {/* Search */}
      {search && (
        <input
          value={search.value}
          onChange={e => search.onChange(e.target.value)}
          placeholder={search.placeholder}
          className={`flex-1 min-w-[180px] px-3 py-2 rounded-lg border text-xs outline-none focus:ring-2 focus:ring-amber-500/40 ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
              : 'bg-slate-50 border-slate-200 placeholder-slate-400'
          }`}
        />
      )}

      {/* Refresh */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          title={t('refresh')}
          className={`${iconBtn} ${loading ? 'opacity-50' : ''}`}
        >
          {loading ? '⏳' : '🔄'}
        </button>
      )}

      {/* Kebab */}
      {secondary.length > 0 && (
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(v => !v)} title={t('more_actions')} className={iconBtn}>
            ⋯
          </button>

          {menuOpen && (
            <div
              className={`absolute start-0 top-11 z-50 min-w-[180px] rounded-xl border shadow-lg overflow-hidden ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}
            >
              {secondary.map((a, i) => (
                <button
                  key={i}
                  onClick={() => {
                    a.onClick();
                    setMenuOpen(false);
                  }}
                  className={`w-full text-start px-3 py-2.5 text-xs font-bold transition-colors ${
                    a.danger
                      ? 'text-rose-500 hover:bg-rose-500/10'
                      : isDark
                      ? 'text-slate-200 hover:bg-slate-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Primary */}
      {primary && (
        <button
          onClick={primary.onClick}
          className="px-4 h-9 rounded-lg text-xs font-black bg-amber-500 text-white hover:bg-amber-600 transition-colors"
        >
          {primary.icon} {primary.label}
        </button>
      )}
    </div>
  );
}