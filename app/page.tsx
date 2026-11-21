"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  BookOpen,
  Box,
  ChevronLeft,
  ChevronRight,
  Layers,
  Moon,
  Compass,
  Sun,
} from "lucide-react";
import { useAtlasLocale } from "@/lib/atlasI18n";
import { useUIStore } from "@/stores/uiStore";

const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL || "https://mrcs-bank.vercel.app";

function AtlasBootLoader() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        background: "radial-gradient(circle at 50% 35%, #0f1b38 0%, #060913 75%)",
        color: "#e2e8f0",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <img
        src="/icon.png"
        alt="Code Blue Atlas"
        style={{ width: 68, height: 68, borderRadius: 16, boxShadow: "0 0 30px rgba(56,189,248,0.35)" }}
      />
      <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.04em" }}>CODE BLUE ATLAS</div>
      <div style={{ fontSize: 12, color: "#94a3b8" }}>Loading 3D Anatomy Studio...</div>
    </div>
  );
}

const AtlasScreen = dynamic(() => import("@/components/screens/AtlasScreen"), {
  ssr: false,
  loading: () => <AtlasBootLoader />,
});

export default function StandaloneAtlasPage() {
  const [mounted, setMounted] = useState(false);
  const [enteredAtlas, setEnteredAtlas] = useState(false);
  const { locale, setLocale } = useAtlasLocale();
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const isAr = locale === "ar";
  const isLight = theme === "light";

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleToggleTheme = () => {
    toggleTheme();
    const next = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("codeblue_theme", next);
      document.documentElement.dataset.theme = next;
      document.documentElement.classList.toggle("dark", next === "dark");
    } catch {}
  };

  if (!mounted) return <AtlasBootLoader />;
  if (enteredAtlas) return <AtlasScreen />;

  const petalBase = isLight
    ? "bg-white/90 border-slate-200/90 text-slate-800 shadow-[0_14px_30px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.9)] hover:bg-white"
    : "bg-[#0e172c]/82 border-white/14 text-slate-100 shadow-[0_16px_34px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-[#13203d]/92";

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className={`min-h-screen lg:h-screen lg:overflow-hidden w-full bg-transparent flex flex-col ${
        isLight ? "text-slate-900" : "text-slate-100"
      }`}
    >
      {/* Top Bar */}
      <header
        className={`shrink-0 h-14 px-5 md:px-10 border-b backdrop-blur-xl flex items-center justify-between gap-4 z-40 ${
          isLight
            ? "border-slate-200/80 bg-white/75"
            : "border-white/10 bg-[#070b16]/70"
        }`}
      >
        <div className="flex items-center gap-3">
          <img
            src="/icon.png"
            alt="Code Blue 3D Atlas"
            className="w-8 h-8 rounded-xl border border-emerald-400/30 shadow-lg shadow-emerald-500/20"
          />
          <div className="leading-tight">
            <div className={`font-extrabold text-sm md:text-base tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
              Code Blue 3D Atlas
            </div>
            <div className={`text-[10.5px] font-mono ${isLight ? "text-emerald-700" : "text-emerald-300/80"}`}>
              codeblue-atlas
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className={`hidden md:flex items-center gap-5 text-xs font-semibold select-none cursor-default ${
            isLight ? "text-slate-500" : "text-slate-300/80"
          }`}
        >
          <span>{isAr ? "الأطلس 3D" : "3D Atlas"}</span>
          <span className="opacity-40">•</span>
          <span>{isAr ? "تشريح الأعضاء" : "Organ Dissection"}</span>
          <span className="opacity-40">•</span>
          <span>{isAr ? "الأجهزة التشريحية" : "Body Systems"}</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <a
            href={MAIN_URL}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
              isLight
                ? "bg-slate-100/80 hover:bg-slate-200/80 text-slate-800 border-slate-300/70"
                : "bg-white/5 hover:bg-white/10 text-slate-200 border-white/10"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isAr ? "بنك الأسئلة" : "Main Bank"}</span>
          </a>
          <button
            type="button"
            onClick={() => setLocale(isAr ? "en" : "ar")}
            className={`px-3 py-1.5 rounded-xl border font-bold transition ${
              isLight
                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                : "bg-white/5 hover:bg-white/10 text-emerald-200 border-white/10"
            }`}
          >
            {isAr ? "EN" : "AR"}
          </button>
          <button
            type="button"
            onClick={handleToggleTheme}
            className={`p-2 rounded-xl border transition ${
              isLight
                ? "bg-slate-100/80 hover:bg-slate-200/80 text-slate-800 border-slate-300/70"
                : "bg-white/5 hover:bg-white/10 text-slate-200 border-white/10"
            }`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Single-Viewport Hero + Integrated 4-Quadrant Showcase */}
      <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto px-5 md:px-10 py-4 lg:py-0 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-8">
          {/* Left / Text + CTA + Integrated 4-Quadrant Petal Showcase */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="space-y-2.5">
              <h1
                className={`text-2xl sm:text-3xl xl:text-4xl font-black leading-[1.18] ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                {isAr ? "الأطلس التشريحي ثلاثي الأبعاد" : "Interactive 3D Human Anatomy Atlas"}
              </h1>
              <p
                className={`text-sm sm:text-base leading-relaxed max-w-xl ${
                  isLight ? "text-slate-600" : "text-slate-300"
                }`}
              >
                {isAr ? (
                  <>
                    استكشف العضلات والأعضاء والأعصاب والعظام{" "}
                    <span className={isLight ? "text-emerald-700 font-bold" : "text-emerald-300 font-bold"}>
                      بتقنية 3D التفاعلية
                    </span>
                  </>
                ) : (
                  <>
                    Explore muscles, organs, nerves, vessels, and bones{" "}
                    <span className={isLight ? "text-emerald-700 font-bold" : "text-emerald-300 font-bold"}>
                      in interactive real-time 3D
                    </span>
                  </>
                )}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setEnteredAtlas(true)}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-sm sm:text-base shadow-[0_0_30px_rgba(16,185,129,0.45)] transition transform hover:scale-[1.03] active:scale-[0.99] cursor-pointer"
                >
                  <span>{isAr ? "افتح الأطلس الآن" : "Open 3D Atlas Now"}</span>
                  {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Integrated "What Does the Atlas Offer?" 4-Quadrant Split-Circle Showcase (Non-clickable) */}
            <div className="pt-1 space-y-2.5">
              <div
                className={`text-xs font-extrabold uppercase tracking-wider ${
                  isLight ? "text-emerald-700" : "text-emerald-300/90"
                }`}
              >
                {isAr ? "ماذا يقدم الأطلس؟" : "What Does the Atlas Offer?"}
              </div>

              <div dir="ltr" className="grid grid-cols-2 gap-2.5 max-w-[440px]">
                {/* Top-Left Quadrant */}
                <div
                  dir={isAr ? "rtl" : "ltr"}
                  className={`group select-none cursor-default rounded-tl-[64px] rounded-tr-xl rounded-bl-xl rounded-br-md border backdrop-blur-xl px-4 py-3.5 pl-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:border-emerald-400/60 hover:shadow-[0_18px_36px_rgba(16,185,129,0.24)] ${petalBase}`}
                >
                  <div className="w-9 h-9 mb-1.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="font-extrabold text-xs sm:text-[13px] leading-snug">
                    {isAr ? "الأجهزة التشريحية 3D" : "3D Body Systems"}
                  </div>
                  <div className={`text-[10.5px] mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {isAr ? "العضلات والعظام والأعصاب والأوعية" : "Muscles, bones, nerves & vessels"}
                  </div>
                </div>

                {/* Top-Right Quadrant */}
                <div
                  dir={isAr ? "rtl" : "ltr"}
                  className={`group select-none cursor-default rounded-tr-[64px] rounded-tl-xl rounded-br-xl rounded-bl-md border backdrop-blur-xl px-4 py-3.5 pr-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:border-cyan-400/60 hover:shadow-[0_18px_36px_rgba(34,211,238,0.24)] ${petalBase}`}
                >
                  <div className="w-9 h-9 mb-1.5 rounded-2xl bg-cyan-500/15 border border-cyan-400/35 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                    <Box className="w-5 h-5" />
                  </div>
                  <div className="font-extrabold text-xs sm:text-[13px] leading-snug">
                    {isAr ? "عزل وتشريح الأعضاء" : "Organ Dissection"}
                  </div>
                  <div className={`text-[10.5px] mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {isAr ? "اعزل أي عضو بوضوح 3D كامل" : "Isolate & inspect 3D relations"}
                  </div>
                </div>

                {/* Bottom-Left Quadrant */}
                <div
                  dir={isAr ? "rtl" : "ltr"}
                  className={`group select-none cursor-default rounded-bl-[64px] rounded-tl-xl rounded-br-xl rounded-tr-md border backdrop-blur-xl px-4 py-3.5 pl-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:translate-y-1 hover:scale-[1.03] hover:border-amber-400/60 hover:shadow-[0_18px_36px_rgba(245,158,11,0.22)] ${petalBase}`}
                >
                  <div className="w-9 h-9 mb-1.5 rounded-2xl bg-amber-500/15 border border-amber-400/35 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform duration-300">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div className="font-extrabold text-xs sm:text-[13px] leading-snug">
                    {isAr ? "تدوير وتكبير 360°" : "360° Orbit & Views"}
                  </div>
                  <div className={`text-[10.5px] mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {isAr ? "زوايا جاهزة وتحكم سلس بالكاميرا" : "Preset views & smooth camera"}
                  </div>
                </div>

                {/* Bottom-Right Quadrant */}
                <div
                  dir={isAr ? "rtl" : "ltr"}
                  className={`group select-none cursor-default rounded-br-[64px] rounded-tr-xl rounded-bl-xl rounded-tl-md border backdrop-blur-xl px-4 py-3.5 pr-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:translate-y-1 hover:scale-[1.03] hover:border-violet-400/60 hover:shadow-[0_18px_36px_rgba(139,92,246,0.22)] ${petalBase}`}
                >
                  <div className="w-9 h-9 mb-1.5 rounded-2xl bg-violet-500/15 border border-violet-400/35 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="font-extrabold text-xs sm:text-[13px] leading-snug">
                    {isAr ? "شرح سريري مفصل" : "Clinical Notes"}
                  </div>
                  <div className={`text-[10.5px] mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {isAr ? "نقاط تشريحية مهمة لـ MRCS" : "High-yield MRCS & USMLE pearls"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right / Transparent PNG Hero Visual (Non-clickable) */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <img
              src="/hero-atlas.png?v=2"
              alt="Code Blue 3D Anatomy Atlas"
              draggable={false}
              className="w-full max-w-[540px] max-h-[70vh] h-auto object-contain select-none pointer-events-none drop-shadow-[0_20px_45px_rgba(16,185,129,0.28)]"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
