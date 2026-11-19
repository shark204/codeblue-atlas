'use client';

import { useAtlasLocale } from "@/lib/atlasI18n";
import { useSceneStore } from "@/stores/sceneStore";
import { useStudyViewsStore } from "@/stores/studyViewsStore";
import { OVERLAY_SWITCH_OFF, OVERLAY_SWITCH_ON } from "./overlayChrome";

/**
 * 4-Panel Study Views Switch (`StudyViewsToggle.tsx`).
 * Hidden on narrow mobile screens (`hidden md:inline-flex`) where a 4-quadrant split
 * would be too cramped and where the button previously collided with bottom controls.
 */
export function StudyViewsToggle() {
  const { at } = useAtlasLocale();
  const isolatedOrganIds = useSceneStore((s) => s.isolatedOrganIds);
  const studyViews = useStudyViewsStore((s) => s.wanted);
  const setStudyViews = useStudyViewsStore((s) => s.setWanted);

  return (
    <button
      type="button"
      onClick={() => setStudyViews(!studyViews)}
      disabled={isolatedOrganIds === null}
      aria-pressed={studyViews}
      title={
        isolatedOrganIds === null
          ? "Isolate a structure first — four views of the whole atlas will not hold a frame rate"
          : "See what is isolated from three fixed angles at once, beside the view you drive"
      }
      className={`pointer-events-auto hidden md:inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500 ${
        studyViews ? OVERLAY_SWITCH_ON.sky : OVERLAY_SWITCH_OFF
      }`}
    >
      {at("4 زوايا تشريحية · Study Views", "Study views")}
    </button>
  );
}
