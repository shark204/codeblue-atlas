'use client';
import { useState, useEffect } from 'react';
import AvatarFrame from '../ui/AvatarFrame';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import {
  Brain, GraduationCap, Zap, BookOpen, Flag, XCircle,
  User, Users, ChevronDown, ArrowLeft, Trophy, Box, Crown,
  Sun, Moon, CloudRain,
} from 'lucide-react';
import { IconBrain, IconTimer, IconChart } from '../ui/Icons';
import type { ScreenType } from '../../lib/helpers';
import { useUIStore } from '../../stores/uiStore';
import { useTranslation } from '../../stores/languageStore';

type Props = {
  theme: 'light' | 'dark';
  cycleTheme: () => void;
  currentScreen: ScreenType;
  examBank?: 'mrcs' | 'undergraduate';
  onNavigate: (screen: ScreenType) => void;
  userName: string;
  userEmail: string;
  userAvatarUrl?: string | null;
  userId?: string | null;
  panelId?: string;
  profileDropdownOpen: boolean;
  setProfileDropdownOpen: (o: boolean) => void;
  navOpen: boolean;
  setNavOpen: (o: boolean) => void;
  reviewOpen: boolean;
  setReviewOpen: (o: boolean) => void;
  dueSrCount: number;
  flaggedCount: number;
  incorrectCount: number;
  onReviewTab: (tab: 'smart_review' | 'flagged' | 'incorrect') => void;
  onOpenFlashcards: () => void;
};

export default function Sidebar({
  theme, cycleTheme, currentScreen, examBank = 'mrcs', onNavigate,
  userName, userEmail, userAvatarUrl, userId, panelId,
  profileDropdownOpen, setProfileDropdownOpen,
  navOpen, setNavOpen, reviewOpen, setReviewOpen,
  dueSrCount, flaggedCount, incorrectCount,
  onReviewTab, onOpenFlashcards,
}: Props) {
  const storePanel = useUIStore(s => s.currentPanel);
  const storeToggleTheme = useUIStore(s => s.toggleTheme);
  const effectivePanelId = panelId || storePanel || 'mrcs';
  const { t, isRTL } = useTranslation();

  const [skyMode, setSkyMode] = useState<'day' | 'night'>(theme === 'dark' ? 'night' : 'day');
  const [rainOn, setRainOn] = useState(false);

  // ✅ مزامنة وضع السما مع ثيم الموقع
  useEffect(() => {
    setSkyMode(theme === 'dark' ? 'night' : 'day');
  }, [theme]);

  const isDark = theme === 'dark' && skyMode === 'night';

  // تحميل القيم المحفوظة بعد mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sky:manual-mode');
      if (saved === 'day' || saved === 'night') setSkyMode(saved);
      const savedRain = localStorage.getItem('sky:rain-override');
      if (savedRain === 'on') setRainOn(true);
    } catch {}
  }, []);

  // ✅ مزامنة مع التغييرات الخارجية
  useEffect(() => {
    const onMode = (e: any) => setSkyMode(e.detail);
    const onRain = (e: any) => setRainOn(e.detail === 'on');
    window.addEventListener('sky:mode', onMode);
    window.addEventListener('sky:rain', onRain);
    return () => {
      window.removeEventListener('sky:mode', onMode);
      window.removeEventListener('sky:rain', onRain);
    };
  }, []);

  const pickSkyMode = (m: 'day' | 'night') => {
    setSkyMode(m);
    const targetTheme = m === 'night' ? 'dark' : 'light';
    if (theme !== targetTheme) {
      if (typeof cycleTheme === 'function') cycleTheme();
      else storeToggleTheme();
    }
    const root = document.documentElement;
    if (targetTheme === 'dark') {
      root.classList.add('dark');
      root.dataset.theme = 'dark';
    } else {
      root.classList.remove('dark');
      root.dataset.theme = 'light';
    }
    try {
      localStorage.setItem('codeblue_theme', targetTheme);
      localStorage.setItem('sky:manual-mode', m);
    } catch {}
    window.dispatchEvent(new CustomEvent('sky:mode', { detail: m }));
  };

  const toggleSkyRain = () => {
    const next = !rainOn;
    setRainOn(next);
    try { localStorage.setItem('sky:rain-override', next ? 'on' : 'off'); } catch {}
    window.dispatchEvent(new CustomEvent('sky:rain', { detail: next ? 'on' : 'off' }));
  };

  // ✅ زرار تبديل الثيم — بيقلب بين day/night
  const toggleTheme = () => pickSkyMode(skyMode === 'day' ? 'night' : 'day');

  const hidden =
    currentScreen === 'study_room' ||
    currentScreen === 'settings' ||
    currentScreen === 'admin' ||
    currentScreen === 'courses' ||
    (currentScreen as any) === 'atlas';

  if (hidden) return null;

  const isInExam = currentScreen === 'exam_intro' || currentScreen === 'exam';

  const isMrcsActive =
    examBank === 'mrcs' &&
    (currentScreen === 'dashboard' ||
      currentScreen === 'session_view' ||
      currentScreen === 'review_gallery');

  const isUndergradActive =
    examBank === 'undergraduate' && currentScreen === 'undergraduate';

  const activeCls = isDark
    ? 'bg-sky-950/60 text-sky-400 border border-sky-800/50'
    : 'bg-blue-100/70 text-blue-700 border border-blue-200/60';

  const idleCls = isDark
    ? 'text-white hover:bg-white/15'
    : 'text-stone-900 hover:bg-stone-900/10';

  const navBtn = (active: boolean) =>
    `w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${active ? activeCls : idleCls}`;

  const sectionHeaderCls = `w-full flex items-center justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg border transition-all ${
    isDark
      ? 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:bg-slate-700/60 hover:text-white'
      : 'bg-stone-900/5 border-stone-900/10 text-stone-800 hover:bg-stone-900/10 hover:text-stone-900'
  }`;

  return (
    <aside
      className={`hidden lg:flex w-72 h-screen sticky top-0 border-e p-6 flex-col justify-between shadow-xs shrink-0 overflow-y-auto custom-scrollbar z-10 backdrop-blur-2xl transition-colors duration-500 ${
        isDark
          ? 'bg-transparent border-slate-700/20 text-white'
          : 'bg-transparent border-white/20 text-slate-900'
      }`}
    >
      <div>
        {/* Logo + Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className={`group flex items-center gap-2 p-1.5 rounded-full border transition-all duration-300 shadow-sm hover:shadow-md backdrop-blur-xl ${
              isDark
                ? 'bg-transparent border-slate-700/40 hover:bg-slate-800/50'
                : 'bg-transparent border-white/50 hover:bg-white/70'
            }`}
          >
            <AvatarFrame src={userAvatarUrl || null} name={userName} userId={userId} panelId={effectivePanelId} size="sm" isDark={isDark} />
            <ChevronDown size={14} className={`transition-transform duration-300 ${profileDropdownOpen ? 'rotate-180' : ''} text-slate-400`} />
          </button>

          {profileDropdownOpen && (
            <div className={`absolute end-0 top-14 w-60 p-2 rounded-2xl shadow-2xl border z-[100] backdrop-blur-2xl ${
              isDark ? 'bg-slate-900/80 border-slate-700/50 text-slate-200' : 'bg-white/80 border-white/50 text-slate-800'
            }`}>
              <button
                onClick={() => { onNavigate('settings'); setProfileDropdownOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100/60'}`}
              >
                <User size={16} /> {t('sidebar.my_profile')}
              </button>
              <button
                onClick={() => { onNavigate('study_room'); setProfileDropdownOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100/60'}`}
              >
                <Users size={16} /> {t('sidebar.study_with_me')}
              </button>
              <button
                onClick={() => { onNavigate('atlas' as any); setProfileDropdownOpen(false); }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 mt-1 rounded-xl text-sm font-extrabold border transition-all duration-200 ${
                  isDark
                    ? 'bg-gradient-to-r from-amber-500/15 to-cyan-500/15 border-amber-400/35 text-white hover:border-amber-400/60'
                    : 'bg-gradient-to-r from-amber-500/10 to-sky-500/10 border-amber-500/35 text-slate-900 hover:border-amber-500/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Box size={16} className="text-amber-400 shrink-0" />
                  <div className="flex flex-col items-start leading-none gap-1">
                    <span dir="ltr" className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-full bg-amber-500/25 border border-amber-400/50 text-[8px] font-black uppercase tracking-[0.18em] text-amber-300">
                      <Crown size={8} /> PREMIUM
                    </span>
                    <span>Atlas</span>
                  </div>
                </div>
                <span dir="ltr" className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-black">3D</span>
              </button>
            </div>
          )}
        </div>

        {/* Nav groups */}
        <div className="space-y-1.5 sm:space-y-2 mt-6 flex flex-col">
          <button
            onClick={() => onNavigate('landing')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${idleCls}`}
          >
            <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
            <span>{t('sidebar.back_to_hub')}</span>
          </button>

          <div className="pt-2">
            <button onClick={() => setNavOpen(!navOpen)} className={sectionHeaderCls}>
              <span className="whitespace-nowrap">{t('sidebar.main_navigation')}</span>
              <ChevronDown size={14} strokeWidth={2.5}
                className={`transform transition-transform duration-200 shrink-0 ms-2 ${navOpen ? 'rotate-180' : ''}`} />
            </button>
            {navOpen && (
              <div className="space-y-1 mt-1 ps-2 animate-fade-in">
                {examBank === 'mrcs' && (
                  <button onClick={() => onNavigate('dashboard')} className={navBtn(isMrcsActive)}>
                    <span className="flex items-center gap-2"><Brain size={16} /> {t('sidebar.mrcs_bank')}</span>
                  </button>
                )}
                {examBank === 'undergraduate' && (
                  <button onClick={() => onNavigate('undergraduate')} className={navBtn(isUndergradActive)}>
                    <span className="flex items-center gap-2"><GraduationCap size={16} /> {t('sidebar.undergrad_bank')}</span>
                  </button>
                )}
                <button onClick={() => onNavigate('exam_intro')} className={navBtn(isInExam)}>
                  <span className="flex items-center gap-2"><IconTimer /> {t('sidebar.timed_mock')}</span>
                </button>
                <button onClick={onOpenFlashcards} className={navBtn(String(currentScreen) === 'flashcards')}>
                  <span className="flex items-center gap-2"><Zap size={16} /> {t('sidebar.flashcards')}</span>
                </button>
                <button onClick={() => onNavigate('notebook')} className={navBtn(String(currentScreen) === 'notebook')}>
                  <span className="flex items-center gap-2"><BookOpen size={16} /> {t('sidebar.notebook')}</span>
                </button>
                <button onClick={() => onNavigate('analytics')} className={navBtn(currentScreen === 'analytics')}>
                  <span className="flex items-center gap-2"><IconChart /> {t('sidebar.analytics')}</span>
                </button>
                <button onClick={() => onNavigate('badges')} className={navBtn(String(currentScreen) === 'badges')}>
                  <span className="flex items-center gap-2"><Trophy size={16} /> {t('sidebar.badges')}</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button onClick={() => setReviewOpen(!reviewOpen)} className={sectionHeaderCls}>
              <span className="whitespace-nowrap">{t('sidebar.review_filters')}</span>
              <ChevronDown size={14} strokeWidth={2.5}
                className={`transform transition-transform duration-200 shrink-0 ms-2 ${reviewOpen ? 'rotate-180' : ''}`} />
            </button>
            {reviewOpen && (
              <div className="space-y-1 mt-1 ps-2 animate-fade-in">
                <button onClick={() => onReviewTab('smart_review')}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${idleCls}`}>
                  <span className="flex items-center gap-2"><IconBrain /> {t('sidebar.smart_review')}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-200/70 text-slate-600'}`}>{dueSrCount}</span>
                </button>
                <button onClick={() => onReviewTab('flagged')}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${idleCls}`}>
                  <span className="flex items-center gap-2"><Flag size={16} /> {t('sidebar.flagged')}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-200/70 text-slate-600'}`}>{flaggedCount}</span>
                </button>
                <button onClick={() => onReviewTab('incorrect')}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${idleCls}`}>
                  <span className="flex items-center gap-2"><XCircle size={16} /> {t('sidebar.incorrect')}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isDark ? 'bg-rose-950/60 text-rose-300' : 'bg-rose-100/70 text-rose-700'}`}>{incorrectCount}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Language & Theme Controls ═══ */}
      <div className={`mt-6 pt-4 border-t space-y-2 ${isDark ? 'border-slate-700/30' : 'border-white/40'}`}>
        <LanguageSwitcher isDark={isDark} userId={userId} variant="sidebar" />

        <button
          onClick={toggleTheme}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all duration-300 backdrop-blur-xl hover:scale-[1.02] active:scale-[0.98] ${
            isDark
              ? 'bg-slate-800/50 border-slate-700/60 text-slate-200 hover:bg-slate-700/60 hover:border-slate-500'
              : 'bg-white/40 border-white/60 text-slate-700 hover:bg-white/70 hover:border-slate-300'
          }`}
          title={skyMode === 'day' ? t('sidebar.switch_to_night') : t('sidebar.switch_to_day')}
        >
          <span className="flex items-center gap-2.5">
            {skyMode === 'day' ? (
              <>
                <Moon size={16} className="text-indigo-500 shrink-0" />
                <span>{t('sidebar.night_mode')}</span>
              </>
            ) : (
              <>
                <Sun size={16} className="text-amber-400 shrink-0" />
                <span>{t('sidebar.day_mode')}</span>
              </>
            )}
          </span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider ${
            skyMode === 'day'
              ? 'bg-indigo-500/20 text-indigo-400'
              : 'bg-amber-500/20 text-amber-400'
          }`}>
            {skyMode === 'day' ? '☀' : '☾'}
          </span>
        </button>
      </div>

      {/* ═══ Sky Controls — Landing only ═══ */}
      {currentScreen === 'landing' && (
        <div className={`hidden lg:flex mt-4 pt-4 border-t flex-col gap-2 ${isDark ? 'border-slate-700/30' : 'border-white/40'}`}>
          <p className={`text-[10px] font-black uppercase tracking-wider px-1 mb-1 ${isDark ? 'text-white' : 'text-slate-500'}`}>
            {t('sidebar.sky_mode')}
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => pickSkyMode('day')}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl font-bold text-[10px] transition-all backdrop-blur-xl border ${
                skyMode === 'day'
                  ? 'bg-amber-500/25 text-amber-500 border-amber-500/50'
                  : (isDark
                      ? 'bg-slate-800/50 text-slate-200 border-slate-600/60 hover:bg-slate-700/60'
                      : 'bg-transparent text-slate-500 border-white/40 hover:bg-white/40')
              }`}
              title={t('sidebar.sky_day')}
            >
              <Sun size={16} />
              {t('sidebar.sky_day')}
            </button>
            <button
              onClick={() => pickSkyMode('night')}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl font-bold text-[10px] transition-all backdrop-blur-xl border ${
                skyMode === 'night'
                  ? 'bg-sky-500/25 text-sky-400 border-sky-500/50'
                  : (isDark
                      ? 'bg-slate-800/50 text-slate-200 border-slate-600/60 hover:bg-slate-700/60'
                      : 'bg-transparent text-slate-500 border-white/40 hover:bg-white/40')
              }`}
              title={t('sidebar.sky_night')}
            >
              <Moon size={16} />
              {t('sidebar.sky_night')}
            </button>
            <button
              onClick={toggleSkyRain}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl font-bold text-[10px] transition-all backdrop-blur-xl border ${
                rainOn
                  ? 'bg-blue-500/25 text-blue-400 border-blue-500/50'
                  : (isDark
                      ? 'bg-slate-800/50 text-slate-200 border-slate-600/60 hover:bg-slate-700/60'
                      : 'bg-transparent text-slate-500 border-white/40 hover:bg-white/40')
              }`}
              title={t('sidebar.sky_rainy')}
            >
              <CloudRain size={16} />
              {t('sidebar.sky_rainy')}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}