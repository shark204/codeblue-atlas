// components/TopBar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserMenu } from './UserMenu';
import { TOPBAR_CONFIG } from '@/config/topbar';
import { useTranslations, useTranslation } from "@/stores/languageStore";
import { useUIStore } from '@/stores/uiStore';

export function TopBar() {
  const t = useTranslations('components_TopBar');
  const { locale } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [vw, setVw] = useState(1440);
  const [playIntroGlint, setPlayIntroGlint] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  const pathname = usePathname();
  const currentScreen = useUIStore((s) => s.currentScreen);
  const isAtlasRoute = Boolean(pathname?.startsWith('/atlas'));

  useEffect(() => {
    if (!pathname?.startsWith('/atlas')) {
      const ui = useUIStore.getState();
      if ((ui.currentScreen as any) === 'atlas') {
        ui.setCurrentScreen?.('landing');
      }
    }
  }, [pathname]);
  const theme = useUIStore((s) => s.theme);
  const isDark = mounted ? theme === 'dark' : true;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > TOPBAR_CONFIG.scrollThreshold);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      const width = headerRef.current?.clientWidth || window.innerWidth || 1440;
      setVw(Math.max(320, width));
    };
    updateWidth();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && headerRef.current) {
      ro = new ResizeObserver(updateWidth);
      ro.observe(headerRef.current);
    }
    window.addEventListener('resize', updateWidth, { passive: true });
    return () => {
      window.removeEventListener('resize', updateWidth);
      if (ro) ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const startTimer = setTimeout(() => setPlayIntroGlint(true), 100);
    const endTimer = setTimeout(() => setPlayIntroGlint(false), 3200);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, []);

  // ✅ أبعاد متوازنة تضمن أن كل البانلز والأزرار داخل التوب بار بالكامل ولا تخرج من الانحناء أبداً
  const barH = isScrolled ? 60 : 64;
  const wingW = vw < 640 ? 28 : vw < 1024 ? 40 : 52;
  const curveH = isScrolled ? 14 : 16;
  const lineY = barH - 1;
  const edgeY = lineY - curveH;

  // المسار الهندسي للخط السفلي المنحني لأعلى عند الأطراف
  const curveLinePath = `M 1,${edgeY} A ${wingW},${curveH} 0 0 0 ${wingW},${lineY} L ${vw - wingW},${lineY} A ${wingW},${curveH} 0 0 0 ${vw - 1},${edgeY}`;

  // إزاحة المحتوى للداخل بعد منطقة الانحناء الجانبية حتى تظل كل البانلز داخل الشريط تماماً
  const safeHorizontalPad = Math.max(TOPBAR_CONFIG.paddingX, wingW - 4);

  if (isAtlasRoute) {
    return null;
  }

  return (
    <header
      ref={headerRef}
      className="fixed top-0 start-0 end-0 select-none transition-all duration-300"
      style={{
        height: `${barH}px`,
        zIndex: Math.max(TOPBAR_CONFIG.zIndex || 50, 90),
      }}
    >
      <style>{`
        @keyframes tbGlintSweep {
          0% {
            stroke-dashoffset: 220;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          88% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: -1080;
            opacity: 0;
          }
        }
        .tb-glint-halo {
          animation: tbGlintSweep 2.3s cubic-bezier(0.22, 0.8, 0.28, 1) 0.1s 1 forwards;
        }
        .tb-glint-core {
          animation: tbGlintSweep 2.3s cubic-bezier(0.22, 0.8, 0.28, 1) 0.1s 1 forwards;
        }
        /* إجبار الشعار على الاحتفاظ بخط Orbitron حتى مع قاعدة span العامة أو وضع الامتحان */
        .cb-orbitron-logo,
        .cb-orbitron-logo span {
          font-family: var(--font-orbitron), sans-serif !important;
        }
      `}</style>

      {/* ═══ 1. طبقة الزجاج الشفافة المقصوصة بنفس انحناء الأطراف الصاعد ═══ */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-300"
        style={{
          height: `${lineY}px`,
          borderBottomLeftRadius: `${wingW}px ${curveH}px`,
          borderBottomRightRadius: `${wingW}px ${curveH}px`,
          backgroundColor: isDark
            ? isScrolled
              ? 'rgba(15, 23, 42, 0.72)'
              : 'rgba(15, 23, 42, 0.55)'
            : isScrolled
              ? 'rgba(255, 255, 255, 0.34)'
              : 'rgba(255, 255, 255, 0.22)',
          backdropFilter: `blur(${TOPBAR_CONFIG.blur}) saturate(140%)`,
          WebkitBackdropFilter: `blur(${TOPBAR_CONFIG.blur}) saturate(140%)`,
          boxShadow: isDark
            ? isScrolled
              ? '0 10px 24px -12px rgba(0, 0, 0, 0.55)'
              : 'none'
            : isScrolled
              ? '0 10px 24px -12px rgba(14, 116, 144, 0.15)'
              : 'none',
        }}
      />

      {/* ═══ 2. الخط السفلي المنحني (رفيع جداً لا يكاد يُرى) + لمعة البريق عند الفتح ═══ */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        viewBox={`0 0 ${vw} ${barH}`}
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="tb-curved-line-dark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
            <stop offset="15%" stopColor="#38bdf8" stopOpacity="0.14" />
            <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.28" />
            <stop offset="85%" stopColor="#38bdf8" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.28" />
          </linearGradient>

          <linearGradient id="tb-curved-line-light" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.24" />
            <stop offset="15%" stopColor="#0ea5e9" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="85%" stopColor="#0ea5e9" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.24" />
          </linearGradient>

          <linearGradient id="tb-sparkle-beam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="75%" stopColor="#67e8f9" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>

          <filter id="tb-glint-glow" x="-20%" y="-120%" width="140%" height="380%">
            <feGaussianBlur stdDeviation="3" result="outerGlow" />
            <feGaussianBlur stdDeviation="1" result="innerGlow" />
            <feMerge>
              <feMergeNode in="outerGlow" />
              <feMergeNode in="innerGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* الخط السفلي المنحني الأساسي: رفيع جداً (0.6px) ولا يكاد يُرى */}
        <path
          d={curveLinePath}
          stroke={isDark ? 'url(#tb-curved-line-dark)' : 'url(#tb-curved-line-light)'}
          strokeWidth="0.6"
          strokeLinecap="round"
        />

        {/* ✨ لمعة البريق التي تسير من الشمال لليمين بطول الخط المنحني أول مرة عند فتح الموقع */}
        {playIntroGlint && (
          <g>
            <path
              d={curveLinePath}
              pathLength={1000}
              stroke="url(#tb-sparkle-beam)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="150 1250"
              filter="url(#tb-glint-glow)"
              className="tb-glint-halo"
            />
            <path
              d={curveLinePath}
              pathLength={1000}
              stroke="#ffffff"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeDasharray="50 1250"
              filter="url(#tb-glint-glow)"
              className="tb-glint-core"
            />
          </g>
        )}
      </svg>

      {/* ═══ 3. طبقة المحتوى التفاعلية (البانلز محصورة بالكامل داخل الشريط) ═══ */}
      <div
        className="relative z-10 w-full h-full flex items-center justify-between"
        style={{
          paddingLeft: `${safeHorizontalPad}px`,
          paddingRight: `${safeHorizontalPad}px`,
        }}
      >
        <div className="flex items-center gap-2">
          {/* ✅ شعار Code Blue Bank بخط Orbitron (متوهج في الليل، وحاد ونقي في النهار) */}
          <Link
            href="/"
            dir="ltr"
            aria-label={t('code_blue_bank')}
            className="cb-orbitron-logo font-[family-name:var(--font-orbitron)] text-lg sm:text-xl md:text-2xl font-extrabold tracking-wider flex items-center gap-2 sm:gap-2.5 select-none group"
          >
            {/* كلمة Code */}
            <span
              className={`transition-all duration-300 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
              style={{
                textShadow: isDark
                  ? '0 0 8px rgba(255, 255, 255, 0.55), 0 0 18px rgba(255, 255, 255, 0.2)'
                  : '0 1px 2px rgba(255, 255, 255, 0.9)',
              }}
            >
              Code
            </span>

            {/* كلمة Blue - نيوني متوهج في الليل، وأزرق ملكي حاد في النهار */}
            <span
              className={`transition-all duration-300 ${
                isDark
                  ? 'text-[#2b7fff] group-hover:brightness-125'
                  : 'text-[#1d4ed8] group-hover:text-[#2563eb]'
              }`}
              style={{
                textShadow: isDark
                  ? '0 0 8px rgba(43, 127, 255, 0.95), 0 0 20px rgba(43, 127, 255, 0.7), 0 0 35px rgba(0, 102, 255, 0.5)'
                  : '0 1px 2px rgba(255, 255, 255, 0.95), 0 2px 6px rgba(29, 78, 216, 0.14)',
              }}
            >
              Blue
            </span>

            {/* كلمة Bank */}
            <span
              className={`transition-all duration-300 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
              style={{
                textShadow: isDark
                  ? '0 0 8px rgba(255, 255, 255, 0.55), 0 0 18px rgba(255, 255, 255, 0.2)'
                  : '0 1px 2px rgba(255, 255, 255, 0.9)',
              }}
            >
              Bank
            </span>
          </Link>
        </div>

        {/* ✅ جملة في التوب بار تدل على أن الموقع منظومة طبية وجراحية متكاملة للطبيب */}
        <div className="hidden lg:flex items-center justify-center px-3">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-extrabold tracking-wide shadow-sm backdrop-blur-md transition-all ${
              isDark
                ? 'border-sky-400/25 bg-slate-900/55 text-white'
                : 'border-sky-600/25 bg-white/50 text-slate-900'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {locale === 'ar'
                ? 'المنظومة الطبية والجراحية المتكاملة للأطباء • بنوك أسئلة • ملخصات (Summaries) • أطلس 3D • غرف مذاكرة'
                : 'The Complete All-in-One Medical & Surgical Platform for Doctors • Q-Banks • Summaries • 3D Atlas • Focus Rooms'}
            </span>
          </div>
        </div>

        <div className="flex items-center">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}