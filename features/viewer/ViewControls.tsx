'use client';

import { GLASS_OPACITY, useSceneStore } from "@/stores/sceneStore";
import { useUIStore } from "@/stores/uiStore";
import { useAtlasLocale } from "@/lib/atlasI18n";
import { Layers, RotateCcw, X } from "lucide-react";

export function ViewControls() {
  const { at } = useAtlasLocale();
  const isolatedOrganIds = useSceneStore((s) => s.isolatedOrganIds);
  const clearIsolation = useSceneStore((s) => s.clearIsolation);
  const hideAllSystems = useSceneStore((s) => s.hideAllSystems);
  const glassBody = useSceneStore((s) => s.glassBody);
  const systemOpacity = useSceneStore((s) => s.systemOpacity);
  const clearGhosting = useSceneStore((s) => s.clearGhosting);
  const manifest = useSceneStore((s) => s.manifest);
  const background = useSceneStore((s) => s.background);
  const siteTheme = useUIStore((s) => s.theme);
  const isLight = siteTheme === "light" || background === "light";

  const isGlass =
    (manifest?.systems.length ?? 0) > 0 &&
    (manifest?.systems ?? []).every(
      (entry) => systemOpacity[entry.system] === GLASS_OPACITY,
    );

  return (
    <section
      className={`flex shrink-0 flex-wrap items-center gap-1.5 border-t px-3 py-2.5 ${
        isLight
          ? "border-[#dcd6cd] bg-white text-[#1b1917]"
          : "border-[#38342f] bg-[#211e1c] text-[#ece7e0]"
      }`}
    >
      {isolatedOrganIds !== null && (
        <button
          type="button"
          onClick={clearIsolation}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#38342f] bg-[#242120] px-2.5 py-1.5 text-xs font-bold text-[#ece7e0] transition hover:border-[#575047]"
        >
          <X size={13} className="shrink-0 text-[#d98a96]" />
          <span>{at(`إلغاء عزل الأعضاء (${isolatedOrganIds.length})`, `Exit isolation (${isolatedOrganIds.length})`)}</span>
        </button>
      )}

      <button
        type="button"
        onClick={hideAllSystems}
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#38342f] bg-[#242120] px-2.5 py-1.5 text-xs font-bold text-[#a39b90] transition hover:border-[#575047] hover:text-[#ece7e0]"
      >
        <RotateCcw size={12} className="shrink-0 text-[#a39b90]" />
        <span>{at("إيقاف الكل · Reset", "Reset / All OFF")}</span>
      </button>

      <button
        type="button"
        onClick={isGlass ? clearGhosting : glassBody}
        aria-pressed={isGlass}
        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition ${
          isGlass
            ? "border-[#5c544b] bg-[#38342f] text-[#ece7e0]"
            : "border-[#38342f] bg-[#242120] text-[#a39b90] hover:border-[#575047] hover:text-[#ece7e0]"
        }`}
      >
        <Layers size={12} className="shrink-0 text-[#a39b90]" />
        <span>{isGlass ? at("إلغاء الشفافية", "Solid") : at("شفاف · Glass", "Glass")}</span>
      </button>
    </section>
  );
}
