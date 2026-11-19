'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Sun, Moon, LogOut, ArrowRight, Check, Wrench, Sparkles, Lock, Eye, EyeOff, User, Users, ChevronDown } from 'lucide-react';
import CaduceusLogo from '../ui/CaduceusLogo';
import {
  IconBrain, IconStethoscope, IconGraduation,
  IconVideo, IconHeartbeat, IconUsers, IconChart, IconTimer,
} from '../ui/Icons';
import { useUIStore } from '../../stores/uiStore';
import { useProgressStore } from '../../stores/progressStore';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  session: any;
  userName: string;
  userAvatarUrl?: string | null;
  savedAccounts: { email: string; name: string }[];
  authName: string; setAuthName: (v: string) => void;
  authEmail: string; setAuthEmail: (v: string) => void;
  authPassword: string; setAuthPassword: (v: string) => void;
  isLoginMode: boolean; setIsLoginMode: (b: boolean) => void;
  authLoading: boolean;
  siteSettings: any;
  questionsCount: number;
  undergradQuestionsCount: number;
  onAuth: (e: React.FormEvent) => void;
  onQuickAccount: (email: string) => void;
  onForgotPassword: () => void;
  onNavigate: (screen: any) => void;
  onLogout: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
};

const HERO_TITLE_CSS = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Sora:wght@700;800&display=swap');
.cb-hero-title{display:inline-block;font-family:'Sora','Plus Jakarta Sans',var(--font-orbitron),var(--font-cairo),sans-serif !important;font-weight:800 !important;letter-spacing:-.02em !important;line-height:1.18 !important;background:linear-gradient(95deg,#ffffff 0%,#bae6fd 50%,#5eead4 100%) !important;-webkit-background-clip:text !important;background-clip:text !important;-webkit-text-fill-color:transparent !important;color:#fff !important;text-shadow:none !important;filter:drop-shadow(0 3px 14px rgba(0,0,0,.6)) drop-shadow(0 2px 12px rgba(45,212,191,.32))}`;

// ✅ 1. Map ثابت للألوان عشان Tailwind يقراها وقت البناء
const PANEL_COLORS: Record<string, { darkBg: string, darkText: string, lightBg: string, lightText: string }> = {
  sky:    { darkBg: 'bg-sky-900/30',    darkText: 'text-sky-400',    lightBg: 'bg-sky-500/15',    lightText: 'text-sky-700' },
  rose:   { darkBg: 'bg-rose-900/30',   darkText: 'text-rose-400',   lightBg: 'bg-rose-500/15',   lightText: 'text-rose-700' },
  purple: { darkBg: 'bg-purple-900/30', darkText: 'text-purple-400', lightBg: 'bg-purple-500/15', lightText: 'text-purple-700' },
};

/* ═══ Profile Card ═══ */
function ProfileCard({ isDark, theme, userName, userEmail, onSettings, onStudyRoom, onLogout }: {
  isDark: boolean; theme: 'light' | 'dark'; userName: string; userEmail: string; onSettings: () => void; onStudyRoom: () => void; onLogout: () => void;
}) {
    const t = useTranslations('components_screens_LandingScreen');
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <div ref={wrapRef} style={{ position: 'absolute', top: 12, right: 12, zIndex: 9998 }} className="relative">
      <div className={`flex items-center gap-0.5 p-1 sm:p-0.5 rounded-xl sm:rounded-md border shadow-md backdrop-blur-xl transition-colors ${isDark ? 'bg-slate-900/60 border-slate-700/60' : 'bg-white/30 border-white/50'}`}>
        <button onClick={() => setOpen(!open)} className={`flex items-center gap-1.5 sm:gap-1 px-1.5 sm:px-1 py-1 sm:py-0.5 rounded-lg sm:rounded-md transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-white/40'}`}>
          <div className={`w-8 h-8 sm:w-5 sm:h-5 rounded-lg sm:rounded-md flex items-center justify-center shadow-md ${isDark ? 'bg-gradient-to-br from-sky-950/60 to-slate-900 border border-sky-500/40' : 'bg-white/40 border border-white/60'}`}>
            <CaduceusLogo theme={theme} size={16} animated={true} />
          </div>
          <div className="hidden sm:block text-start">
            <p className={`text-[10px] font-black leading-none mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{userName}</p>
            <p className="text-[9px] text-slate-500 font-medium truncate max-w-[110px]">{userEmail}</p>
          </div>
          <ChevronDown size={13} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''} text-slate-400`} />
        </button>
        <button onClick={onLogout} className={`p-1.5 sm:p-0.5 rounded-lg sm:rounded-md transition-colors ${isDark ? 'text-rose-400 hover:bg-rose-950/40' : 'text-rose-600 hover:bg-rose-50/50'}`}>
          <LogOut size={15} className="sm:hidden" /><LogOut size={12} className="hidden sm:block" />
        </button>
      </div>

      {open && (
        <div className={`absolute end-0 top-full mt-2 w-60 p-2 rounded-2xl shadow-2xl border backdrop-blur-2xl animate-fade-in ${isDark ? 'bg-slate-900/90 border-slate-700/50 text-slate-200' : 'bg-white/60 border-white/60 text-slate-800'}`}>
          <button onClick={() => { onSettings(); setOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${isDark ? 'hover:bg-slate-800/70' : 'hover:bg-white/50'}`}><User size={16} /> {t('my_profile')}</button>
          <button onClick={() => { onStudyRoom(); setOpen(false); }} className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 mt-1 rounded-xl text-sm font-extrabold border transition-all duration-200 ${isDark ? 'bg-gradient-to-r from-amber-500/15 to-cyan-500/15 border-amber-400/35 text-white hover:border-amber-400/60' : 'bg-gradient-to-r from-amber-500/10 to-sky-500/10 border-amber-500/35 text-slate-900'}`}>
            <div className="flex flex-col items-start leading-none gap-1">
              <span dir="ltr" className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-full bg-amber-500/25 border border-amber-400/50 text-[8px] font-black uppercase tracking-[0.18em] text-amber-300">✦ PREMIUM</span>
              <span className="flex items-center gap-1.5"><Users size={14} /> {t('study_with_me')}</span>
            </div>
            <span dir="ltr" className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-black">LIVE</span>
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}

/* ═══ المكون الأساسي ═══ */
export default function LandingScreen({
  session, userName, savedAccounts,
  authName, setAuthName, authEmail, setAuthEmail, authPassword, setAuthPassword,
  isLoginMode, setIsLoginMode, authLoading, siteSettings, questionsCount,
  undergradQuestionsCount, onAuth, onQuickAccount, onForgotPassword, onNavigate, onLogout, onShowToast,
}: Props) {
    const t = useTranslations('components_screens_LandingScreen');
  
  const theme = useUIStore(s => s.theme);
  const isDark = theme === 'dark';
  const currentScreen = 'landing';
  
  const [showPassword, setShowPassword] = useState(true);
  const activePanel = (session?.user?.user_metadata?.current_panel || 'mrcs') as any;
  const score = useProgressStore(activePanel, s => s.score);

  // ✅ 1. صفحة تسجيل الدخول وإنشاء الحساب (Login & Sign Up) — بانل زجاجي شفاف في المود النهاري
  if (!session) {
    return (
      <div className={`min-h-screen w-full flex flex-col items-center justify-center transition-all duration-700 p-4 pt-20 relative overflow-x-hidden ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
        <div className={`absolute top-[-10%] start-[-10%] w-72 sm:w-96 h-72 sm:h-96 rounded-full filter blur-[80px] transition-all duration-700 ${isDark ? 'bg-sky-600/20 animate-blob-dark' : 'bg-sky-400/20 animate-blob-light'}`}></div>
        <div className={`absolute top-[30%] end-[-10%] w-72 sm:w-96 h-72 sm:h-96 rounded-full filter blur-[80px] transition-all duration-700 ${isDark ? 'bg-teal-600/20 animate-blob-dark' : 'bg-teal-400/20 animate-blob-light'}`}></div>

        <div className="w-full max-w-md flex flex-col items-center justify-center gap-4 mb-6 px-2 relative z-10">
          <div className="w-32 h-32 flex items-center justify-center relative">
            <CaduceusLogo theme={theme} size={120} animated={true} speed={3} />
          </div>
          <style>{HERO_TITLE_CSS}</style>
          <h1 className="cb-hero-title font-black text-2xl sm:text-3xl text-center">
            {t('code_blue_bank')}
          </h1>
        </div>

        <div className="w-full max-w-md text-center mb-6 px-2 relative z-10">
          <p className={`text-xs sm:text-sm font-semibold leading-relaxed max-w-sm mx-auto transition-colors ${
            isDark
              ? 'text-slate-400'
              : 'text-slate-800 drop-shadow-[0_1px_8px_rgba(255,255,255,0.85)]'
          }`}>
            {t('sign_in_choose_your_surgical')}
                              </p>
        </div>

        <div
          className={`w-full max-w-md p-5 sm:p-8 rounded-3xl border relative z-10 backdrop-blur-2xl transition-all duration-500 ${
            isDark
              ? 'bg-slate-900/75 border-slate-800 shadow-2xl shadow-black/60'
              : 'bg-white/25 border-white/50 shadow-[0_24px_50px_-16px_rgba(14,116,144,0.2),inset_0_1px_0_rgba(255,255,255,0.7)]'
          }`}
        >
          {savedAccounts.length > 0 && isLoginMode && (
            <div className={`mb-6 pb-6 border-b ${isDark ? 'border-slate-700/50' : 'border-white/40'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 text-center ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                {t('quick_login')}
                                          </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {savedAccounts.map((acc, i) => (
                  <button
                    key={i}
                    onClick={() => onQuickAccount(acc.email)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all backdrop-blur-md ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-sky-300'
                        : 'bg-white/35 hover:bg-white/55 border-white/60 text-slate-900'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold">
                      {acc.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold truncate max-w-[100px]">{acc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            className={`grid grid-cols-2 p-1 rounded-2xl mb-6 transition-colors ${
              isDark
                ? 'bg-slate-950/60 border border-slate-800/60'
                : 'bg-white/25 border border-white/45'
            }`}
          >
            <button
              type="button"
              onClick={() => setIsLoginMode(true)}
              className={`py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                isLoginMode
                  ? isDark
                    ? 'bg-slate-800 text-sky-400 shadow-md'
                    : 'bg-white/65 text-sky-700 shadow-sm border border-white/70'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {t('login')}
                                    </button>
            <button
              type="button"
              onClick={() => setIsLoginMode(false)}
              className={`py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                !isLoginMode
                  ? isDark
                    ? 'bg-slate-800 text-sky-400 shadow-md'
                    : 'bg-white/65 text-sky-700 shadow-sm border border-white/70'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {t('create_account')}
                                    </button>
          </div>

          <form onSubmit={onAuth} className="space-y-4 relative z-10">
            {!isLoginMode && (
              <div>
                <label className={`block text-[11px] sm:text-xs font-bold mb-1.5 uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-800'}`}>
                  {t('nickname')}
                                                </label>
                <input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder={t('example_dr_sharkawy')}
                  className={`w-full p-3 rounded-xl text-xs sm:text-sm border focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all ${
                    isDark
                      ? 'bg-transparent border-slate-700/80 text-white placeholder-slate-600'
                      : 'bg-white/25 focus:bg-white/45 border-white/55 text-slate-900 placeholder-slate-600'
                  }`}
                />
              </div>
            )}
            <div>
              <label className={`block text-[11px] sm:text-xs font-bold mb-1.5 uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-800'}`}>
                {t('email')}
                                          </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                className={`w-full p-3 rounded-xl text-xs sm:text-sm border focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all ${
                  isDark
                    ? 'bg-transparent border-slate-700/80 text-white placeholder-slate-600'
                    : 'bg-white/25 focus:bg-white/45 border-white/55 text-slate-900 placeholder-slate-600'
                }`}
                placeholder={t('you_example_com')}
              />
            </div>
            <div>
              <label className={`block text-[11px] sm:text-xs font-bold mb-1.5 uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-800'}`}>
                {t('password')}
                                          </label>
              <div className="relative w-full">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all ${
                    isDark
                      ? 'bg-transparent border-slate-700/80 text-white placeholder-slate-600'
                      : 'bg-white/25 focus:bg-white/45 border-white/55 text-slate-900 placeholder-slate-600'
                  }`}
                  style={{ paddingRight: '52px', fontSize: '16px', position: 'relative' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev: boolean) => !prev)}
                  aria-label={showPassword ? t('hide_password') : t('show_password')}
                  style={{
                    position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                    width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent', border: 'none', cursor: 'pointer', zIndex: 9999, touchAction: 'manipulation', padding: 0,
                  }}
                  className={`transition-colors ${isDark ? 'text-slate-400 hover:text-sky-400' : 'text-slate-700 hover:text-sky-700'}`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {isLoginMode && (
              <button type="button" onClick={onForgotPassword} className={`text-xs hover:underline font-bold ${isDark ? 'text-sky-400' : 'text-sky-700'}`}>
                {t('forgot_password')}
                                          </button>
            )}
            <button
              disabled={authLoading}
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition-transform active:scale-95"
            >
              {authLoading ? t('please_wait') : (isLoginMode ? t('login_arrow') : t('create_account_arrow'))}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ✅ 2. صفحة الـ Landing الرئيسية:
  // - صورة العملية الجراحية بكامل إضاءتها الطبيعية (بدون تعتيم brightness-45 وبدون أي ثيم عليها)
  // - البانلز والكروت شفافة في الوضع النهاري
  const landingCards = [
    { key: 'maintenance_mrcs_bank', label: t('mrcs_bank'), desc: t('surgical_training_with_high_yield'), count: questionsCount, countLabel: t('questions'), icon: <IconBrain size={22} />, badge: t('active_bank'), gradient: 'from-teal-500 via-emerald-500 to-cyan-500', active: !siteSettings?.maintenance_mrcs_bank, comingSoon: false, onClick: () => onNavigate('dashboard') },
    { key: 'maintenance_mrcp', label: t('mrcp_bank'), desc: t('medical_training_for_mrcp_part'), count: null, countLabel: null, icon: <IconStethoscope size={22} />, badge: t('stay_tuned'), gradient: 'from-sky-500 via-blue-500 to-indigo-500', active: false, comingSoon: true, onClick: () => onShowToast(t('mrcp_coming_soon'), 'info') },
    { key: 'maintenance_usmle', label: t('usmle_bank'), desc: t('us_medical_licensing_examination_step'), count: null, countLabel: null, icon: <IconBrain size={22} />, badge: t('stay_tuned'), gradient: 'from-purple-500 via-fuchsia-500 to-pink-500', active: false, comingSoon: true, onClick: () => onShowToast(t('usmle_coming_soon'), 'info') },
    { key: 'maintenance_undergraduate', label: t('undergraduate'), desc: t('all_5_medical_years_organized'), count: undergradQuestionsCount, countLabel: t('questions'), icon: <IconGraduation size={22} />, badge: 'Preclinical', gradient: 'from-indigo-500 via-purple-500 to-fuchsia-500', active: !siteSettings?.maintenance_undergraduate, comingSoon: false, onClick: () => onNavigate('undergraduate') },
    { key: 'maintenance_courses', label: t('code_blue_revision'), desc: t('comprehensive_summaries_study_slides_acr'), count: null, countLabel: t('all_modules'), icon: <IconHeartbeat size={22} />, badge: t('active'), gradient: 'from-rose-500 via-pink-500 to-fuchsia-500', active: true, comingSoon: false, onClick: () => onNavigate('courses') },
    { key: 'maintenance_revision', label: t('courses'), desc: t('high_yield_video_courses_quick'), count: null, countLabel: null, icon: <IconVideo size={28} />, badge: t('stay_tuned'), gradient: 'from-red-500 via-rose-500 to-orange-500', active: false, comingSoon: true, onClick: () => onShowToast(t('courses_coming_soon'), 'info') },
  ];
  return (
    <div className={`min-h-screen w-full flex flex-col text-start font-sans antialiased transition-colors duration-500 p-4 sm:p-8 lg:p-12 pt-20 sm:pt-24 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      <div className="w-full max-w-6xl mx-auto space-y-12 pb-10">
        {currentScreen === 'landing' && (
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/25 text-white p-4 sm:p-8 lg:p-16">
            {/* ✅ صورة العملية الجراحية بكامل وضوحها وإضاءتها الأصلية بدون أي تعتيم أو ثيمات فوقها */}
            <img
              src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=1200&q=70"
              alt=""
              loading="eager"
              decoding="async"
              className="absolute inset-0 z-0 w-full h-full object-cover"
            />

            <div className="relative z-10 space-y-6 sm:space-y-8">
              <div>
                <div className="w-20 h-20 sm:w-32 sm:h-32 flex items-center justify-center mx-auto mb-4 sm:mb-6 lg:scale-150">
                  <CaduceusLogo theme="dark" size={90} animated={true} speed={3} />
                </div>
                <style>{HERO_TITLE_CSS}</style>
                <div className="text-center mb-2 sm:mb-3">
                  <h2 className="cb-hero-title text-xl sm:text-3xl lg:text-5xl font-black tracking-tight text-center">
                    {t('code_blue_bank')}
                  </h2>
                </div>

              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 pt-2 max-w-5xl mx-auto">
                {landingCards.map(card => {
                  const isLocked = siteSettings?.[card.key];
                  const isAvailable = !isLocked && card.active;

                  return (
                    <div 
                      key={card.key} 
                      onClick={isLocked ? undefined : card.onClick} 
                      style={
                        isDark
                          ? {
                              backgroundColor: isAvailable ? 'rgba(15, 23, 42, 0.72)' : 'rgba(2, 6, 23, 0.88)',
                              borderColor: isAvailable ? 'rgba(255, 255, 255, 0.18)' : 'rgba(51, 65, 85, 0.55)',
                              color: isAvailable ? '#ffffff' : '#94a3b8',
                            }
                          : {
                              backgroundColor: isAvailable ? 'rgba(255, 255, 255, 0.28)' : 'rgba(15, 23, 42, 0.62)',
                              borderColor: isAvailable ? 'rgba(255, 255, 255, 0.55)' : 'rgba(71, 85, 105, 0.45)',
                              color: isAvailable ? '#0f172a' : '#cbd5e1',
                            }
                      }
                      className={`group p-3 sm:p-5 lg:p-6 rounded-2xl text-start transition-all duration-300 flex flex-col justify-between border relative overflow-hidden backdrop-blur-xl shadow-xl ${
                        isLocked
                          ? 'opacity-70 cursor-not-allowed saturate-50'
                          : isAvailable
                            ? 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:border-emerald-400/70'
                            : 'opacity-80 cursor-not-allowed saturate-75'
                      }`}
                    >
                      {isAvailable && <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>}
                      {isLocked && <div className="absolute top-0 end-0 bg-amber-500 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-2 sm:px-3 py-0.5 sm:py-1 rounded-es-xl shadow-md z-20"><span className="flex items-center gap-1"><Wrench size={10} /> <span className="hidden sm:inline">{t('under_maintenance')}</span><span className="sm:hidden">!</span></span></div>}
                      
                      <div className="flex justify-between items-start mb-3 sm:mb-5 relative z-10">
                        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                          isAvailable
                            ? `bg-gradient-to-br ${card.gradient} text-white group-hover:scale-110 group-hover:rotate-3`
                            : isDark
                              ? 'bg-slate-800/80 text-slate-400'
                              : 'bg-white/40 text-slate-600'
                        }`}>
                          {card.icon}
                        </div>
                        {card.badge && isAvailable && <span className={`hidden sm:inline-block text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider shadow-sm bg-gradient-to-r ${card.gradient} text-white`}>{card.badge}</span>}
                        {card.comingSoon && !isLocked && (
                          <span className={`hidden sm:inline-block text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider shadow-sm border backdrop-blur-sm ${
                            'bg-orange-500/20 text-orange-300 border-orange-500/35'
                          }`}>
                            {card.badge}
                          </span>
                        )}
                      </div>
                      
                      <div className="relative z-10 flex-1 flex flex-col justify-end">
                        <h3
                          style={{
                            color: isAvailable
                              ? (isDark ? '#ffffff' : '#0f172a')
                              : '#cbd5e1',
                          }}
                          className="text-xs sm:text-lg lg:text-xl font-black mb-1 sm:mb-1.5 transition-colors leading-tight"
                        >
                          {card.label}
                        </h3>
                        <p
                          style={{
                            color: isAvailable
                              ? (isDark ? '#e2e8f0' : '#1e293b')
                              : '#94a3b8',
                          }}
                          className="text-[10px] sm:text-xs font-semibold leading-snug sm:leading-relaxed mb-2 sm:mb-3"
                        >
                          {card.desc}
                        </p>
                        
                        {card.count !== null && card.count !== undefined ? (
                          <div className={`mt-auto pt-2 sm:pt-3 border-t ${
                            isDark ? 'border-white/15' : 'border-white/40'
                          }`}>
                            <div className="flex items-baseline gap-1 sm:gap-1.5">
                              <span className={`text-base sm:text-2xl lg:text-3xl font-black ${
                                isAvailable
                                  ? (isDark ? 'text-emerald-400' : 'text-emerald-700')
                                  : 'text-slate-500'
                              }`}>
                                {card.count}
                              </span>
                              <span
                                style={{
                                  color: isDark ? '#cbd5e1' : '#1e293b',
                                }}
                                className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider"
                              >
                                {card.countLabel}
                              </span>
                            </div>
                          </div>
                        ) : card.countLabel ? (
                          <div className={`mt-auto pt-2 sm:pt-3 border-t ${
                            isDark ? 'border-white/15' : 'border-white/40'
                          }`}>
                            <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-wider ${
                              isAvailable
                                ? (isDark ? 'text-emerald-400' : 'text-emerald-700')
                                : 'text-slate-500'
                            }`}>
                              ● {card.countLabel}
                            </span>
                          </div>
                        ) : null}
                        
                        {isAvailable && (
                          <div className={`hidden sm:flex mt-3 pt-3 border-t items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                            isDark ? 'border-white/15' : 'border-white/40'
                          }`}>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                              {t('start_now')}
                                                                      </span>
                            <ArrowRight size={14} className={`${isDark ? 'text-emerald-400' : 'text-emerald-700'} group-hover:translate-x-1 transition-transform`} />
                          </div>
                        )}
                        {card.comingSoon && (
                          <div className={`hidden sm:flex mt-3 pt-3 border-t items-center gap-1.5 opacity-85 ${
                            isDark ? 'border-white/15' : 'border-white/40'
                          }`}>
                            <Lock size={11} className="text-orange-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300">
                              {t('under_development')}
                                                                      </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div
                style={{ color: '#ffffff', textShadow: '0 1px 8px rgba(0, 0, 0, 0.8)' }}
                className="pt-4 border-t border-white/25 flex justify-center text-[10px] sm:text-xs font-bold"
              >
                <div>{t('platform_status')} <span className="text-emerald-400 animate-pulse">{t('online_fully_operational')}</span></div>
              </div>
            </div>
          </div>
        )}

        {currentScreen === 'landing' && (
          <div className="md:hidden max-w-5xl mx-auto px-2 pb-6">
            <button
              onClick={() => onNavigate('features')}
              className={`w-full p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all shadow-sm hover:-translate-y-1 backdrop-blur-xl ${
                isDark
                  ? 'bg-slate-900/60 border-sky-500/30 hover:border-sky-500'
                  : 'bg-white/25 border-white/50 hover:bg-white/35'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isDark ? 'bg-sky-500/20 text-sky-400' : 'bg-white/40 text-sky-700'}`}><Sparkles size={24} /></div>
                <div className="text-start min-w-0">
                  <h3 className={`text-base font-black mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('why_code_blue_bank')}</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{t('discover_all_6_features')}</p>
                </div>
              </div>
              <ArrowRight size={20} className={`shrink-0 ${isDark ? 'text-sky-400' : 'text-sky-700'}`} />
            </button>
          </div>
        )}

        {currentScreen === 'landing' && (
          <div className="hidden md:block max-w-5xl mx-auto px-2 sm:px-4 lg:px-8 pb-16">
            <div className="text-center mb-10 sm:mb-12">
              <h2
                className={`text-xl sm:text-3xl lg:text-4xl font-black mb-3 tracking-tight ${
                  isDark ? 'text-slate-100' : 'text-slate-900 drop-shadow-[0_1px_10px_rgba(255,255,255,0.8)]'
                }`}
              >
                {t('why_code_blue_bank')}
                                            </h2>
              <p
                className={`text-xs sm:text-sm lg:text-base font-semibold max-w-2xl mx-auto leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-800 drop-shadow-[0_1px_8px_rgba(255,255,255,0.75)]'
                }`}
              >
                {t('discover_the_powerful_features_designed')}
                                            </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                            {[
                { icon: <IconBrain size={24} />, title: t('study_smart'), color: 'sky', items: [[t('anki_style'), ''], [t('target_goal'), t('target_goal_desc')], [t('custom_notes'), t('custom_notes_desc')], [t('smart_review'), t('smart_review_desc')]] },
                { icon: <IconChart size={24} />, title: t('insights'), color: 'rose', items: [[t('weakness_radar'), t('weakness_radar_desc')], [t('visual_gallery'), t('visual_gallery_desc')], [t('score_histogram'), t('score_histogram_desc')], [t('answer_change'), t('answer_change_desc')]] },
                { icon: <IconTimer size={24} />, title: t('practice'), color: 'purple', items: [[t('mock_exams'), t('mock_exams_desc')], [t('mobile_ui'), t('mobile_ui_desc')], [t('focus_rooms'), t('focus_rooms_desc')], [t('flashcards'), t('flashcards_desc')]] },
              ].map((panel, pi) => {
                const colors = PANEL_COLORS[panel.color] || PANEL_COLORS.sky;
                return (
                  <div
                    key={pi}
                    className={`p-5 lg:p-6 rounded-2xl border shadow-sm transition-transform hover:-translate-y-1 backdrop-blur-xl ${
                      isDark ? 'bg-slate-900/65 border-slate-800' : 'bg-white/25 border-white/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isDark ? `${colors.darkBg} ${colors.darkText}` : `${colors.lightBg} ${colors.lightText}`}`}>{panel.icon}</div>
                    <h3 className={`text-lg lg:text-xl font-black mb-4 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{panel.title}</h3>
                    <ul className="space-y-3">
                      {panel.items.map(([t, d], i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check size={16} className="text-emerald-500 shrink-0 mt-1" />
                          <div>
                            <p className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>{t}</p>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{d}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}