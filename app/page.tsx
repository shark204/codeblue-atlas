"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Box, ChevronLeft, ChevronRight, Layers, Moon, Rotate3D, Sun } from "lucide-react";
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

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen w-full bg-transparent text-slate-100 flex flex-col overflow-y-auto"
    >
      {/* Top Bar */}
      <header className="sticky top-0 z-40 h-16 px-5 md:px-10 border-b border-white/10 bg-[#070b16]/70 backdrop-blur-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/icon.png" alt="Code Blue 3D Atlas" className="w-9 h-9 rounded-xl border border-emerald-400/30 shadow-lg shadow-emerald-500/20" />
          <div className="leading-tight">
            <div className="font-extrabold text-base text-white tracking-tight">Code Blue 3D Atlas</div>
            <div className="text-[11px] font-mono text-emerald-300/80">codeblue-atlas</div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-200">
          <button type="button" onClick={() => setEnteredAtlas(true)} className="text-emerald-300 hover:text-emerald-200 transition">
            {isAr ? "الأطلس 3D" : "3D Atlas"}
          </button>
          <span className="text-white/20">|</span>
          <button type="button" onClick={() => setEnteredAtlas(true)} className="hover:text-cyan-300 transition">
            {isAr ? "تشريح الأعضاء" : "Organ Dissection"}
          </button>
          <span className="text-white/20">|</span>
          <button type="button" onClick={() => setEnteredAtlas(true)} className="hover:text-cyan-300 transition">
            {isAr ? "الأجهزة التشريحية" : "Body Systems"}
          </button>
        </nav>

        <div className="flex items-center gap-2 text-xs">
          <a
            href={MAIN_URL}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isAr ? "بنك الأسئلة" : "Main Bank"}</span>
          </a>
          <button
            type="button"
            onClick={() => setLocale(isAr ? "en" : "ar")}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-200 border border-white/10 font-bold transition"
          >
            {isAr ? "EN" : "AR"}
          </button>
          <button
            type="button"
            onClick={handleToggleTheme}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-12 flex flex-col justify-between gap-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8">
          <div className="lg:col-span-6 space-y-5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-white">
              {isAr ? "الأطلس التشريحي ثلاثي الأبعاد" : "Interactive 3D Human Anatomy Atlas"}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              {isAr ? (
                <>
                  استكشف العضلات والأعضاء والأعصاب والعظام{" "}
                  <span className="text-emerald-300 font-bold">بتقنية 3D التفاعلية</span>
                </>
              ) : (
                <>
                  Explore muscles, organs, nerves, vessels, and bones{" "}
                  <span className="text-emerald-300 font-bold">in interactive real-time 3D</span>
                </>
              )}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setEnteredAtlas(true)}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-base shadow-[0_0_32px_rgba(16,185,129,0.45)] transition transform hover:scale-[1.02]"
              >
                <span>{isAr ? "افتح الأطلس الآن" : "Open 3D Atlas Now"}</span>
                {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 flex items-center justify-center">
            <img
              src="/hero-atlas.png"
              alt="Code Blue 3D Anatomy Atlas"
              className="w-full max-w-[600px] h-auto object-contain drop-shadow-[0_0_40px_rgba(16,185,129,0.25)] transition duration-500 hover:scale-[1.02] cursor-pointer"
              onClick={() => setEnteredAtlas(true)}
            />
          </div>
        </div>

        {/* Bottom 3 Feature Cards */}
        <section className="space-y-4">
          <h2 className="text-lg font-extrabold text-white">
            {isAr ? "ماذا يقدم الأطلس؟" : "What Does the Atlas Offer?"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setEnteredAtlas(true)}
              className="group text-start rounded-2xl border border-emerald-400/20 bg-[#0d1528]/70 hover:bg-[#121e38]/85 hover:border-emerald-400/50 backdrop-blur-xl p-5 flex items-center justify-between gap-4 transition shadow-xl"
            >
              <div>
                <div className="font-bold text-white text-base group-hover:text-emerald-200 transition">
                  {isAr ? "استكشاف تفاعلي للعضلات والأعضاء والعظام" : "Interactive Muscles, Organs & Bones"}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {isAr ? "جميع الأجهزة التشريحية بوضوح طبّي كامل" : "Complete multi-system anatomical layers"}
                </div>
              </div>
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-center text-emerald-300">
                <Layers className="w-6 h-6" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setEnteredAtlas(true)}
              className="group text-start rounded-2xl border border-cyan-400/20 bg-[#0d1528]/70 hover:bg-[#121e38]/85 hover:border-cyan-400/50 backdrop-blur-xl p-5 flex items-center justify-between gap-4 transition shadow-xl"
            >
              <div>
                <div className="font-bold text-white text-base group-hover:text-cyan-200 transition">
                  {isAr ? "تشريح وعزل الأعضاء الداخلية بتقنية 3D" : "3D Organ Isolation & Dissection"}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {isAr ? "اعزل أي عضو واعرف علاقاته التشريحية 3D" : "Isolate structures & inspect 3D relations"}
                </div>
              </div>
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-cyan-500/15 border border-cyan-400/35 flex items-center justify-center text-cyan-300">
                <Box className="w-6 h-6" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setEnteredAtlas(true)}
              className="group text-start rounded-2xl border border-amber-400/20 bg-[#0d1528]/70 hover:bg-[#121e38]/85 hover:border-amber-400/50 backdrop-blur-xl p-5 flex items-center justify-between gap-4 transition shadow-xl"
            >
              <div>
                <div className="font-bold text-white text-base group-hover:text-amber-200 transition">
                  {isAr ? "أدوات التدوير والتكبير والشرح الطبي المفصل" : "360° Orbit, Zoom & Clinical Notes"}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {isAr ? "أدوات تشريح وعرض مقاطع وشرح MRCS/USMLE" : "Preset views, cross-sections & clinical pearls"}
                </div>
              </div>
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-amber-500/15 border border-amber-400/35 flex items-center justify-center text-amber-300">
                <Rotate3D className="w-6 h-6" />
              </div>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
