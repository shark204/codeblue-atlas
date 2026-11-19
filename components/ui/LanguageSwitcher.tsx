// components/ui/LanguageSwitcher.tsx
'use client';

import { Languages } from 'lucide-react';
import { useTranslation } from '../../stores/languageStore';

interface LanguageSwitcherProps {
  isDark?: boolean;
  userId?: string | null;
  variant?: 'sidebar' | 'compact';
}

export default function LanguageSwitcher({
  isDark = true,
  userId = null,
  variant = 'sidebar',
}: LanguageSwitcherProps) {
  const { locale, toggleLocale, t } = useTranslation();

  if (variant === 'compact') {
    return (
      <button
        onClick={() => toggleLocale(userId)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs border transition-all duration-300 backdrop-blur-xl ${
          isDark
            ? 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:bg-slate-700/60 hover:text-white'
            : 'bg-white/60 border-slate-200/80 text-slate-800 hover:bg-white/90'
        }`}
        title={t('sidebar.language')}
      >
        <Languages size={15} className="text-sky-400 shrink-0" />
        <span>{locale === 'en' ? 'العربية' : 'English'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => toggleLocale(userId)}
      className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all duration-300 backdrop-blur-xl hover:scale-[1.02] active:scale-[0.98] ${
        isDark
          ? 'bg-slate-800/50 border-slate-700/60 text-slate-200 hover:bg-slate-700/60 hover:border-slate-500'
          : 'bg-white/40 border-white/60 text-slate-700 hover:bg-white/70 hover:border-slate-300'
      }`}
      title={t('sidebar.language')}
    >
      <span className="flex items-center gap-2.5">
        <Languages size={16} className="text-sky-400 shrink-0" />
        <span>{t('sidebar.language')}</span>
      </span>

      <span
        className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold tracking-wide ${
          isDark
            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
            : 'bg-sky-500/15 text-sky-700 border border-sky-500/25'
        }`}
      >
        {locale === 'en' ? 'العربية' : 'EN'}
      </span>
    </button>
  );
}