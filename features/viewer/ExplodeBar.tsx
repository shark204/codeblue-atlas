'use client';

import { useEffect } from "react";
import { useAtlasLocale } from "@/lib/atlasI18n";
import { useSceneStore } from "@/stores/sceneStore";
import { useUIStore } from "@/stores/uiStore";
import { useHeartStore } from "@/stores/heartStore";
import { useBreathStore } from "@/stores/breathStore";
import { useScanStore } from "@/stores/scanStore";
import { MAX_EXPLODE } from "./explode";
import { viewportKey } from "./viewportKeys";

export function ExplodeBar({ inline = false }: { inline?: boolean } = {}) {
  const { at } = useAtlasLocale();
  const explode = useSceneStore((s) => s.explode);
  const cycleExplode = useSceneStore((s) => s.cycleExplode);
  const setExplode = useSceneStore((s) => s.setExplode);
  const hiddenSystems = useSceneStore((s) => s.hiddenSystems);
  const hideConnective = useSceneStore((s) => s.hideConnective);
  const manifest = useSceneStore((s) => s.manifest);
  const background = useSceneStore((s) => s.background);
  const siteTheme = useUIStore((s) => s.theme);
  const isLight = background === "light" || siteTheme === "light";
  const heartEnabled = useHeartStore((s) => s.enabled);
  const breathEnabled = useBreathStore((s) => s.enabled);
  const scanEnabled = useScanStore((s) => s.enabled);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (viewportKey(event) !== "x") return;
      event.preventDefault();
      cycleExplode();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cycleExplode]);

  const hasVisible3DModel =
    Boolean(manifest) &&
    (hiddenSystems.length < (manifest?.systems.length ?? 12) || !hideConnective);

  if (!hasVisible3DModel || heartEnabled || breathEnabled || scanEnabled) return null;

  const pill = (
      <div
        className={`pointer-events-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1 shadow-xl backdrop-blur-md ${
          isLight
            ? "border-[#dcd6cd] bg-white/95 text-[#1b1917]"
            : "border-[#38342f] bg-[#242120]/95 text-[#ece7e0]"
        }`}
      >
        <button
          type="button"
          onClick={cycleExplode}
          title={at("تفكيك أجزاء المجسم (X)", "Step through exploded view (X)")}
          className={`cursor-pointer rounded-full px-1.5 py-0 text-[9.5px] font-black uppercase tracking-wider transition ${
            explode > 0
              ? "border-[#d98a96] bg-[#d98a96]/20 text-[#d98a96]"
              : isLight
                ? "border-[#dcd6cd] bg-[#f5f3ef] text-[#575047] hover:text-[#1b1917]"
                : "border-[#38342f] bg-[#211e1c] text-[#a39b90] hover:text-[#ece7e0]"
          }`}
        >
          {explode > 0
            ? `${at("مفكك", "Explode")} ${Math.round((explode / MAX_EXPLODE) * 100)}%`
            : at("تفكيك · Explode", "Explode")}
        </button>

        <input
          type="range"
          min={0}
          max={MAX_EXPLODE}
          step={0.05}
          value={explode}
          aria-label="How far apart to push the parts"
          title={at("اسحب للتحكم في مدى تفكيك الأجزاء", "Drag to control part separation")}
          onChange={(event) => setExplode(Number(event.target.value))}
          className="h-1.5 w-20 sm:w-24 cursor-pointer accent-[#d98a96]"
        />

        {explode > 0 && (
          <button
            type="button"
            onClick={() => setExplode(0)}
            title={at("إعادة تجميع الأجزاء", "Reassemble parts")}
            className={`cursor-pointer rounded-full border px-2 py-0 text-[9px] font-bold transition ${
              isLight
                ? "border-[#dcd6cd] bg-[#f5f3ef] text-[#575047] hover:text-[#1b1917]"
                : "border-[#38342f] bg-[#211e1c] text-[#a39b90] hover:text-[#ece7e0]"
            }`}
          >
            {at("تجميع", "Reset")}
          </button>
        )}
      </div>
  );
  if (inline) return pill;
  return <div dir="ltr" className="pointer-events-none absolute bottom-[64px] sm:bottom-[68px] right-2.5 z-25 max-w-[94vw]">{pill}</div>;
}
