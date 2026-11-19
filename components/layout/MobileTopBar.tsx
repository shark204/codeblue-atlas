'use client';
import { useState, useEffect } from 'react';
import { Sun, Moon, CloudRain, Menu, X, BookOpen, Zap, Flag, XCircle, Home, LogOut, Trophy, GraduationCap, Settings as SettingsIcon, Brain, Box, Crown } from 'lucide-react';
import CaduceusLogo from '../ui/CaduceusLogo';
import { IconTimer, IconBrain, IconChart } from '../ui/Icons';
import type { ScreenType } from '../../lib/helpers';
import { useUIStore } from '../../stores/uiStore';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  theme: 'light' | 'dark';
  cycleTheme: () => void;
  userEmail: string;
  userName: string;
  userAvatarUrl?: string | null;
  userId?: string | null;
  panelId?: string;
  profileDropdownOpen: boolean;
  setProfileDropdownOpen: (o: boolean) => void;
  onNavigate: (screen: ScreenType) => void;
  currentScreen: ScreenType;
  examBank?: 'mrcs' | 'undergraduate';
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (o: boolean) => void;
  dueSrCount: number;
  flaggedCount: number;
  incorrectCount: number;
  onReviewTab: (tab: 'smart_review' | 'flagged' | 'incorrect') => void;
  onOpenFlashcards: () => void;
  onLogout: () => void;
};

/**
 * Clean Mobile Sidebar Drawer Trigger & Slide-Over Navigation (`MobileTopBar.tsx`).
 *
 * - Positioned below the global 64px `TopBar` (`top-[70px] start-3`) so it NEVER
 *   collides with the `Code Blue Bank` logo or `<UserMenu />` at `top-0`.
 * - Removes the duplicate right-side profile avatar button that previously
 *   overlapped `<UserMenu />` on mobile screens.
 * - Uses an opaque glassmorphic drawer background (`bg-slate-950/95` / `bg-white/95`)
 *   so drawer links never bleed over background page text.
 */
export default function MobileTopBar({
  theme, cycleTheme, userEmail,
  onNavigate, currentScreen,
  examBank = 'mrcs', mobileMenuOpen, setMobileMenuOpen,
  dueSrCount, flaggedCount, incorrectCount,
  onReviewTab, onOpenFlashcards, onLogout,
}: Props) {
  const t = useTranslations('components_layout_MobileTopBar');
  const isDark = theme === 'dark';

  const [skyMode, setSkyMode] = useState<'day' | 'night'>(isDark ? 'night' : 'day');
  const [rainOn, setRainOn] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sky:manual-mode');
      if (!saved) setSkyMode(isDark ? 'night' : 'day');
    } catch {
      setSkyMode(isDark ? 'night' : 'day');
    }
  }, [isDark]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sky:manual-mode');
      if (saved === 'day' || saved === 'night') setSkyMode(saved);
      const savedRain = localStorage.getItem('sky:rain-override');
      if (savedRain === 'on') setRainOn(true);
    } catch {}
  }, []);

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

  const isMrcsActive = examBank === 'mrcs' && (
    currentScreen === 'dashboard' ||
    currentScreen === 'session_view' ||
    currentScreen === 'review_gallery' ||
    (currentScreen === 'exam_intro' && examBank === 'mrcs') ||
    (currentScreen === 'exam' && examBank === 'mrcs')
  );

  const isUndergradActive = examBank === 'undergraduate' && (
    currentScreen === 'undergraduate' ||
    (currentScreen === 'exam_intro' && examBank === 'undergraduate') ||
    (currentScreen === 'exam' && examBank === 'undergraduate')
  );

  const handleNavClick = (screen: ScreenType) => {
    onNavigate(screen);
    setMobileMenuOpen(false);
  };

  const handleReviewClick = (tab: 'smart_review' | 'flagged' | 'incorrect') => {
    onReviewTab(tab);
    setMobileMenuOpen(false);
  };

  const idleCls = isDark
    ? 'text-white/90 hover:bg-white/10 hover:text-white'
    : 'text-slate-800 hover:bg-slate-200/60';

  const activeCls = isDark
    ? 'bg-sky-950/70 text-sky-400 border border-sky-800/50'
    : 'bg-blue-100/80 text-blue-700 border border-blue-200/70';

  const navBtn = (active: boolean) =>
    `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${active ? activeCls : idleCls}`;

  return (
    <>
      {/* ═════════ FLOATING MOBILE DRAWER TRIGGER (Below 64px TopBar, Zero Overlap) ═════════ */}
      {currentScreen !== 'landing' && (
        <div className="lg:hidden fixed top-[70px] start-3 z-40 flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-lg backdrop-blur-xl transition-all ${
              isDark
                ? 'bg-slate-900/85 border-slate-700/70 text-white hover:border-sky-400/60'
                : 'bg-white/85 border-slate-300/80 text-slate-900 hover:border-sky-500/60'
            }`}
            aria-label={t('open_menu')}
          >
            <Menu size={18} />
            <span className="text-xs font-extrabold">{t('main_navigation')}</span>
          </button>
        </div>
      )}

      {/* ═════════ MOBILE DRAWER ═════════ */}
      {mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/55 backdrop-blur-xs z-[95] animate-fade-in"
          />

          <aside
            className={`lg:hidden fixed top-0 start-0 h-[100dvh] w-72 max-w-[86vw] z-[100] shadow-2xl flex flex-col overflow-y-auto custom-scrollbar transition-transform duration-300 backdrop-blur-2xl ${
              isDark
                ? 'bg-slate-950/95 border-e border-slate-800 text-slate-100'
                : 'bg-white/95 border-e border-slate-200 text-slate-900'
            }`}
          >
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md backdrop-blur-xl ${
                    theme === 'light'
                      ? 'bg-sky-50 border border-sky-200'
                      : 'bg-slate-900 border border-sky-500/30'
                  }`}
                >
                  <CaduceusLogo theme={theme} size={26} animated={true} />
                </div>
                <div>
                  <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t('code_blue_bank')}
                  </p>
                  <p className={`text-[9px] truncate max-w-[140px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{userEmail}</p>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl border border-rose-400/50 bg-rose-500/25 text-rose-300 hover:bg-rose-500/40 transition-colors"
                aria-label={t('close_menu')}
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 p-4 space-y-4">
              <button
                onClick={() => handleNavClick('landing')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${idleCls}`}
              >
                <Home size={16} />
                {t('back_to_home_hub')}
              </button>

              <div>
                <p className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 ${isDark ? 'text-sky-300' : 'text-black'}`}>
                  {t('main_navigation')}
                </p>
                <div className="space-y-1 mt-1">
                  {examBank === 'mrcs' && (
                    <button onClick={() => handleNavClick('dashboard')} className={navBtn(isMrcsActive)}>
                      <Brain size={16} />
                      {t('mrcs_bank')}
                    </button>
                  )}
                  {examBank === 'undergraduate' && (
                    <button onClick={() => handleNavClick('undergraduate')} className={navBtn(isUndergradActive)}>
                      <GraduationCap size={16} />
                      {t('undergraduate_bank')}
                    </button>
                  )}
                  <button
                    onClick={() => handleNavClick('exam_intro')}
                    className={navBtn(currentScreen === 'exam_intro' || currentScreen === 'exam')}
                  >
                    <IconTimer />
                    {t('timed_mock_test')}
                  </button>
                  <button
                    onClick={() => { onOpenFlashcards(); setMobileMenuOpen(false); }}
                    className={navBtn(String(currentScreen) === 'flashcards')}
                  >
                    <Zap size={16} />
                    {t('flashcards_mode')}
                  </button>
                  <button onClick={() => handleNavClick('notebook')} className={navBtn(String(currentScreen) === 'notebook')}>
                    <BookOpen size={16} />
                    {t('my_notebook')}
                  </button>
                  <button onClick={() => handleNavClick('analytics')} className={navBtn(currentScreen === 'analytics')}>
                    <IconChart />
                    {t('analytics')}
                  </button>
                  <button onClick={() => handleNavClick('badges')} className={navBtn(String(currentScreen) === 'badges')}>
                    <Trophy size={16} />
                    {t('badges')}
                  </button>
                  <button
                    onClick={() => handleNavClick('atlas' as any)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 mt-1 rounded-xl text-xs font-extrabold border transition-all duration-200 ${
                      isDark
                        ? 'bg-gradient-to-r from-amber-500/15 to-cyan-500/15 border-amber-400/35 text-white'
                        : 'bg-gradient-to-r from-amber-500/10 to-sky-500/10 border-amber-500/35 text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Box size={15} className="text-amber-400 shrink-0" />
                      <span>Atlas 3D</span>
                    </span>
                    <span dir="ltr" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/25 border border-amber-400/50 text-[8px] font-black uppercase tracking-wider text-amber-300">
                      <Crown size={8} /> PREMIUM
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <p className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 ${isDark ? 'text-sky-300' : 'text-black'}`}>
                  {t('review_filters')}
                </p>
                <div className="space-y-1 mt-1">
                  <button
                    onClick={() => handleReviewClick('smart_review')}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${idleCls}`}
                  >
                    <span className="flex items-center gap-2"><IconBrain /> {t('smart_review')}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      isDark ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>{dueSrCount}</span>
                  </button>
                  <button
                    onClick={() => handleReviewClick('flagged')}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${idleCls}`}
                  >
                    <span className="flex items-center gap-2"><Flag size={16} /> {t('flagged')}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      isDark ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>{flaggedCount}</span>
                  </button>
                  <button
                    onClick={() => handleReviewClick('incorrect')}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${idleCls}`}
                  >
                    <span className="flex items-center gap-2"><XCircle size={16} /> {t('incorrect')}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      isDark ? 'bg-rose-950/60 text-rose-300' : 'bg-rose-100 text-rose-700'
                    }`}>{incorrectCount}</span>
                  </button>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleNavClick('settings')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${idleCls}`}
                >
                  <SettingsIcon size={16} />
                  {t('settings')}
                </button>
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    isDark ? 'text-rose-400 hover:bg-rose-950/30' : 'text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <LogOut size={16} /> {t('logout')}
                </button>
              </div>
            </div>

            {currentScreen === 'landing' && (
              <div className={`p-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <p className={`text-[10px] font-black uppercase tracking-wider px-1 mb-2 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                  {t('sky_mode')}
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => {
                      setSkyMode('day');
                      try { localStorage.setItem('sky:manual-mode', 'day'); } catch {}
                      window.dispatchEvent(new CustomEvent('sky:mode', { detail: 'day' }));
                    }}
                    className={`flex flex-col items-center gap-1 py-2 rounded-xl font-bold text-[10px] transition-all border ${
                      skyMode === 'day'
                        ? 'bg-amber-500/25 text-amber-500 border-amber-500/50'
                        : (isDark
                            ? 'bg-slate-800/50 text-slate-200 border-slate-700'
                            : 'bg-slate-100 text-slate-600 border-slate-200')
                    }`}
                  >
                    <Sun size={16} />
                    {t('day')}
                  </button>
                  <button
                    onClick={() => {
                      setSkyMode('night');
                      try { localStorage.setItem('sky:manual-mode', 'night'); } catch {}
                      window.dispatchEvent(new CustomEvent('sky:mode', { detail: 'night' }));
                    }}
                    className={`flex flex-col items-center gap-1 py-2 rounded-xl font-bold text-[10px] transition-all border ${
                      skyMode === 'night'
                        ? 'bg-sky-500/25 text-sky-400 border-sky-500/50'
                        : (isDark
                            ? 'bg-slate-800/50 text-slate-200 border-slate-700'
                            : 'bg-slate-100 text-slate-600 border-slate-200')
                    }`}
                  >
                    <Moon size={16} />
                    {t('night')}
                  </button>
                  <button
                    onClick={() => {
                      const next = !rainOn;
                      setRainOn(next);
                      try { localStorage.setItem('sky:rain-override', next ? 'on' : 'off'); } catch {}
                      window.dispatchEvent(new CustomEvent('sky:rain', { detail: next ? 'on' : 'off' }));
                    }}
                    className={`flex flex-col items-center gap-1 py-2 rounded-xl font-bold text-[10px] transition-all border ${
                      rainOn
                        ? 'bg-blue-500/25 text-blue-400 border-blue-500/50'
                        : (isDark
                            ? 'bg-slate-800/50 text-slate-200 border-slate-700'
                            : 'bg-slate-100 text-slate-600 border-slate-200')
                    }`}
                  >
                    <CloudRain size={16} />
                    {t('rainy')}
                  </button>
                </div>
              </div>
            )}
          </aside>
        </>
      )}
    </>
  );
}