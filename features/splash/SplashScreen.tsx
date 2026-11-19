'use client';

import { Activity } from "lucide-react";
import { useAtlasLocale } from "@/lib/atlasI18n";

export function SplashScreen({ leaving }: { leaving: boolean }) {
  const { at } = useAtlasLocale();
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/45 backdrop-blur-xs transition-opacity duration-300 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label="Anatria3D is starting"
    >
      <div className="flex max-w-xs flex-col items-center gap-3 rounded-2xl border border-[#38342f] bg-[#242120] px-6 py-4 text-center shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-cyan-400/25 border-t-cyan-400" />
          <Activity size={20} className="animate-pulse text-[#d98a96]" />
        </div>
        <p className="text-xs font-black text-white">
          {at(
            "جارٍ تحميل المجسم التشريحي ثلاثي الأبعاد...",
            "Loading 3D Anatomical Model...",
          )}
        </p>
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-[#2a2624]">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400" />
        </div>
      </div>
    </div>
  );
}
