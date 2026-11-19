'use client';

import { useEffect } from "react";
import { ArrowLeft, Focus, RotateCcw, X } from "lucide-react";
import { useSceneStore } from "@/stores/sceneStore";
import { useAtlasLocale } from "@/lib/atlasI18n";

export function IsolationBar() {
  const { at } = useAtlasLocale();
  const isolatedOrganIds = useSceneStore((s) => s.isolatedOrganIds);
  const selectedOrganIds = useSceneStore((s) => s.selectedOrganIds);
  const mobileBodyRegion = useSceneStore((s) => s.mobileBodyRegion);
  const fadeOthersActive = useSceneStore((s) => s.fadeOthersActive);
  const clearIsolation = useSceneStore((s) => s.clearIsolation);
  const clearSelection = useSceneStore((s) => s.clearSelection);
  const setMobileBodyRegion = useSceneStore((s) => s.setMobileBodyRegion);
  const setExplode = useSceneStore((s) => s.setExplode);

  const hasIsolation =
    (isolatedOrganIds !== null && isolatedOrganIds.length > 0) ||
    mobileBodyRegion !== "all" ||
    fadeOthersActive;
  const hasSelection = selectedOrganIds.length > 0;

  useEffect(() => {
    if (!hasIsolation && !hasSelection) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clearSelection();
        clearIsolation();
        setExplode(0);
        if (mobileBodyRegion !== "all") setMobileBodyRegion("all");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasIsolation, hasSelection, clearSelection, clearIsolation, setExplode, mobileBodyRegion, setMobileBodyRegion]);

  // Visible UI is rendered inside the Complete Anatomy Top Breadcrumb & Mode Bar in AnatomyViewer.tsx
  return null;
}
