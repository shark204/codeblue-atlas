'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, User, LogOut, ChevronDown, Users, Languages, Box, Crown, Sparkles } from 'lucide-react';
import { TOPBAR_CONFIG } from '@/config/topbar';
import { ThemeSelector } from './ThemeSelector';
import { SoundSwitch } from './SoundSwitch';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useTranslation } from '@/stores/languageStore';
import { supabase } from '@/lib/supabase';

export function UserMenu({ compact = false }: { compact?: boolean } = {}) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const theme = useUIStore((s) => s.theme);
  const setCurrentScreen = useUIStore((s) => s.setCurrentScreen);
  const { locale, toggleLocale } = useTranslation();
  const isDark = mounted ? theme === 'dark' : true;

  useEffect(() => {
    setMounted(true);
    try {
      router.prefetch("/atlas");
      router.prefetch("/study-room");
      router.prefetch("/dashboard");
    } catch {}
  }, [router]);
  
  const userEmail = session?.user?.email || 'user@example.com';
  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'Doctor';
  const userAvatarUrl = session?.user?.user_metadata?.avatar_url || null;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    if (path === '/') {
      try {
        localStorage.removeItem('cb_summaries_state');
      } catch {}
      setCurrentScreen?.('landing');
    } else if (path === '/atlas') {
      setCurrentScreen?.('atlas' as any);
    }
    router.push(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await supabase.auth.signOut();
    setSession(null);
    router.push('/');
  };

  return (
    <div className="relative flex items-center" ref={menuRef}>
      <style>{`
        .cb-usermenu-light .text-slate-200,
        .cb-usermenu-light .text-slate-300 { color: #0f172a !important; }
        .cb-usermenu-light .text-slate-400 { color: #334155 !important; }
        .cb-usermenu-light .bg-white\\\\/10 { background-color: rgba(255, 255, 255, 0.45) !important; color: #0284c7 !important; }
        .cb-usermenu-light .text-cyan-400 { color: #0284c7 !important; }
        .cb-usermenu-light .hover\\\\:bg-white\\\\/10:hover,
        .cb-usermenu-light .hover\\\\:bg-white\\\\/5:hover { background-color: rgba(255, 255, 255, 0.35) !important; }
        @keyframes cb-premium-shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .cb-premium-badge {
          background: linear-gradient(90deg, rgba(245, 158, 11, 0.28), rgba(250, 204, 21, 0.36), rgba(6, 182, 212, 0.28), rgba(245, 158, 11, 0.28));
          background-size: 220% 220%;
          animation: cb-premium-shimmer 3.6s ease infinite;
          box-shadow: 0 0 14px rgba(245, 158, 11, 0.32), inset 0 0 8px rgba(250, 204, 21, 0.18);
        }
      `}</style>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
          compact
            ? 'gap-1.5 sm:min-w-[142px] sm:max-w-[205px] w-auto'
            : 'gap-2 sm:min-w-[180px] sm:max-w-[240px] w-auto'
        }`}
        style={{
          height: compact ? '31px' : '40px',
          padding: compact ? '2px 8px' : '4px 10px',
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.28)',
          backdropFilter: `blur(${TOPBAR_CONFIG.blur})`,
          WebkitBackdropFilter: `blur(${TOPBAR_CONFIG.blur})`,
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.12)'
            : '1px solid rgba(255, 255, 255, 0.5)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = TOPBAR_CONFIG.userMenu.glow)}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <div className="relative shrink-0">
          {userAvatarUrl ? (
            <img src={userAvatarUrl} alt="Avatar" className="rounded-full object-cover shrink-0" style={{ width: compact ? '22px' : '28px', height: compact ? '22px' : '28px' }} />
          ) : (
            <div className="rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ width: compact ? '22px' : '28px', height: compact ? '22px' : '28px' }}>
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="hidden sm:flex flex-col items-start flex-1 truncate text-start leading-tight">
          <span
            className="font-semibold truncate w-full transition-colors"
            style={{ fontSize: compact ? '11.5px' : '13px', color: isDark ? '#ffffff' : '#0f172a' }}
          >
            {userName}
          </span>
          <span
            className="truncate w-full transition-colors"
            style={{ fontSize: compact ? '9.5px' : '11px', color: isDark ? '#cbd5e1' : '#334155' }}
          >
            {userEmail}
          </span>
        </div>

        <ChevronDown
          size={15}
          className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: isDark ? '#cbd5e1' : '#334155' }}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute end-0 rounded-2xl border shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl z-50 max-md:!w-[206px] max-md:!p-1.5 max-md:!rounded-xl ${
            isDark ? '' : 'cb-usermenu-light'
          }`}
          style={{ 
            width: `${TOPBAR_CONFIG.dropdown.width}px`, 
            top: `calc(100% + ${TOPBAR_CONFIG.dropdown.offsetY}px)`,
            padding: `${TOPBAR_CONFIG.dropdown.padding}px`,
            borderRadius: `${TOPBAR_CONFIG.dropdown.borderRadius}px`,
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.85)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.65)',
          }}
          role="menu"
          aria-orientation="vertical"
        >
          {Boolean(session?.user) && (
            <>
          {/* 1. Home */}
          <button
            onClick={() => handleNavigate('/')}
            className={`w-full flex items-center gap-3 max-md:gap-2 px-3 max-md:px-2 py-2.5 max-md:py-1.5 rounded-lg transition-colors text-sm max-md:text-xs font-medium ${
              isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-white/40 text-slate-900'
            }`}
            role="menuitem"
          >
            <Home size={16} />
            <span>{locale === 'ar' ? 'الرئيسية' : 'Home'}</span>
          </button>

          {/* 2. My Profile */}
          <button
            onClick={() => handleNavigate('/settings')}
            className={`w-full flex items-center gap-3 max-md:gap-2 px-3 max-md:px-2 py-2.5 max-md:py-1.5 rounded-lg transition-colors text-sm max-md:text-xs font-medium ${
              isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-white/40 text-slate-900'
            }`}
            role="menuitem"
          >
            <User size={16} />
            <span>{locale === 'ar' ? 'الملف الشخصي' : 'My Profile'}</span>
          </button>
          
          {/* 3. Study with me (بنفس تصميم أيقونة الأطلس الفاخرة وعليها شارة PREMIUM بالإنجليزي) */}
          <button
            onClick={() => handleNavigate('/study-room')}
            className={`group relative w-full flex items-center justify-between gap-3 max-md:gap-1.5 px-3 max-md:px-2 py-2.5 max-md:py-1.5 my-1 max-md:my-0.5 rounded-xl transition-all duration-200 border ${
              isDark
                ? 'bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-slate-900/40 hover:from-amber-500/20 hover:via-cyan-500/20 border-amber-400/25 hover:border-amber-400/50 text-white shadow-[0_2px_14px_rgba(245,158,11,0.12)]'
                : 'bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-white/50 hover:from-amber-500/20 hover:via-sky-500/20 border-amber-500/30 hover:border-amber-500/50 text-slate-900 shadow-sm'
            }`}
            role="menuitem"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-8 h-8 max-md:w-6 max-md:h-6 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isDark
                    ? 'bg-gradient-to-br from-amber-400/25 to-cyan-500/25 border border-amber-400/40 text-amber-300'
                    : 'bg-gradient-to-br from-amber-500/20 to-sky-500/20 border border-amber-500/40 text-amber-700'
                }`}
              >
                <Users size={16} />
              </div>

              <div className="flex flex-col items-start leading-none gap-1 min-w-0">
                <span
                  dir="ltr"
                  className="cb-premium-badge inline-flex items-center gap-1 px-2 py-[2px] rounded-full border border-amber-400/50 text-[8.5px] font-black uppercase tracking-[0.2em] text-amber-300"
                >
                  <Crown size={9} className="text-amber-300 shrink-0" />
                  <span>PREMIUM</span>
                  <Sparkles size={8} className="text-cyan-300 shrink-0" />
                </span>

                <div className="flex items-center gap-1 whitespace-nowrap">
                  <span className="text-[12px] font-extrabold tracking-tight whitespace-nowrap">
                    Study with me
                  </span>
                  <span className={`text-[10px] font-semibold whitespace-nowrap ${isDark ? 'text-cyan-300/90' : 'text-sky-700'}`}>
                    {locale === 'ar' ? '• ادرس معي' : '• Rooms'}
                  </span>
                </div>
              </div>
            </div>

            <span
              dir="ltr"
              className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                isDark
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-sky-500/15 text-sky-700 border border-sky-500/30'
              }`}
            >
              LIVE
            </span>
          </button>

          {/* 4. Atlas (مباشرة تحت Study with me وبفوقها PREMIUM بالإنجليزي بشكل جذاب) */}
          <button
            onClick={() => handleNavigate('/atlas')}
            className={`group relative w-full flex items-center justify-between gap-3 max-md:gap-1.5 px-3 max-md:px-2 py-2.5 max-md:py-1.5 my-1 max-md:my-0.5 rounded-xl transition-all duration-200 border ${
              isDark
                ? 'bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-slate-900/40 hover:from-amber-500/20 hover:via-cyan-500/20 border-amber-400/25 hover:border-amber-400/50 text-white shadow-[0_2px_14px_rgba(245,158,11,0.12)]'
                : 'bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-white/50 hover:from-amber-500/20 hover:via-sky-500/20 border-amber-500/30 hover:border-amber-500/50 text-slate-900 shadow-sm'
            }`}
            role="menuitem"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-8 h-8 max-md:w-6 max-md:h-6 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isDark
                    ? 'bg-gradient-to-br from-amber-400/25 to-cyan-500/25 border border-amber-400/40 text-amber-300'
                    : 'bg-gradient-to-br from-amber-500/20 to-sky-500/20 border border-amber-500/40 text-amber-700'
                }`}
              >
                <Box size={16} />
              </div>

              <div className="flex flex-col items-start leading-none gap-1 min-w-0">
                <span
                  dir="ltr"
                  className="cb-premium-badge inline-flex items-center gap-1 px-2 py-[2px] rounded-full border border-amber-400/50 text-[8.5px] font-black uppercase tracking-[0.2em] text-amber-300"
                >
                  <Crown size={9} className="text-amber-300 shrink-0" />
                  <span>PREMIUM</span>
                  <Sparkles size={8} className="text-cyan-300 shrink-0" />
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-sm max-md:text-xs font-extrabold tracking-tight">
                    Atlas
                  </span>
                  <span className={`text-[11px] max-md:text-[9.5px] font-medium ${isDark ? 'text-cyan-300/85' : 'text-sky-700'}`}>
                    {locale === 'ar' ? '• الأطلس التشريحي 3D' : '• 3D Anatomy'}
                  </span>
                </div>
              </div>
            </div>

            <span
              dir="ltr"
              className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                isDark
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-sky-500/15 text-sky-700 border border-sky-500/30'
              }`}
            >
              3D
            </span>
          </button>

            </>
          )}

          {/* 5. Language Switcher */}
          <button
            onClick={() => toggleLocale(session?.user?.id)}
            className={`w-full flex items-center justify-between px-3 max-md:px-2 py-2.5 max-md:py-1.5 rounded-lg transition-all text-sm max-md:text-xs font-medium ${
              isDark
                ? 'hover:bg-white/10 text-white hover:text-cyan-300'
                : 'hover:bg-white/40 text-slate-900 hover:text-cyan-700'
            }`}
            role="menuitem"
            title={locale === 'en' ? 'التحويل إلى اللغة العربية' : 'Switch to English'}
          >
            <div className="flex items-center gap-3">
              <Languages size={16} className="text-cyan-400 shrink-0" />
              <span>{locale === 'en' ? 'اللغة العربية' : 'English'}</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-md font-bold tracking-wide uppercase ${
                isDark
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-cyan-500/15 text-cyan-700 border border-cyan-500/25'
              }`}
            >
              {locale === 'en' ? 'AR' : 'EN'}
            </span>
          </button>
          
          <div className="h-px w-full my-1.5" style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.1)' }} />
          
          {/* Theme Selector */}
          <ThemeSelector />
          
          <div className="my-1" />
          
          {/* Sound & Rain */}
          <SoundSwitch />

          <div className="h-px w-full my-1.5" style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.1)' }} />
          
          {/* Log Out */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 max-md:gap-2 px-3 max-md:px-2 py-2.5 max-md:py-1.5 rounded-lg transition-colors text-sm max-md:text-xs font-semibold ${
              isDark ? 'hover:bg-rose-500/20 text-rose-400' : 'hover:bg-rose-500/15 text-rose-600'
            }`}
            role="menuitem"
          >
            <LogOut size={16} />
            <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
