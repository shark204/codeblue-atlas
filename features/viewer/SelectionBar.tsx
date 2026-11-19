'use client';

import { useAtlasLocale } from "@/lib/atlasI18n";
import { useEffect } from "react";
import { EyeOff, Undo2, Crosshair, RotateCcw, X } from "lucide-react";

import { organLabel, organSubtitle, useSceneStore } from "@/stores/sceneStore";

import { viewportKey } from "./viewportKeys";

/**
 * Bottom Dissection & Undo Bar (`SelectionBar.tsx`).
 *
 * When a single organ is selected (`chosen.length === 1`), `SelectedOrganCard`
 * at the top-right already provides `Hide`, `Isolate`, `Undo`, `+ Connections`,
 * and `✕`. Therefore this bottom bar only renders when:
 * 1. Multiple structures are selected (`chosen.length > 1`), OR
 * 2. Nothing is currently selected (`chosen.length === 0`) and there are hidden
 *    structures to step back / restore (`canUndo`).
 * This eliminates duplicate action bars and mobile screen clutter completely.
 */
export function SelectionBar() {
  const { at } = useAtlasLocale();
  const selectedOrganIds = useSceneStore((s) => s.selectedOrganIds);
  const hiddenOrganIds = useSceneStore((s) => s.hiddenOrganIds);
  const undoHistory = useSceneStore((s) => s.undoHistory);
  const organs = useSceneStore((s) => s.organs);
  const isolateSelection = useSceneStore((s) => s.isolateSelection);
  const hideSelection = useSceneStore((s) => s.hideSelection);
  const undoLastStep = useSceneStore((s) => s.undoLastStep);
  const clearSelection = useSceneStore((s) => s.clearSelection);
  const unhideAll = useSceneStore((s) => s.unhideAll);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = viewportKey(event);
      if (key === null) return;
      if (key === "i") isolateSelection();
      else if (key === "h") hideSelection();
      else if (key === "z") undoLastStep();
      else if (key === "u") unhideAll();
      else if (key === "c") clearSelection();
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isolateSelection, hideSelection, undoLastStep, unhideAll, clearSelection]);

  const chosen = selectedOrganIds.map((id) => organs[id]).filter((organ) => !!organ);
  const canUndo = undoHistory.length > 0 || hiddenOrganIds.length > 0;

  // Single-organ selection is handled entirely inside SelectedOrganCard (zero duplication!)
  if (chosen.length === 1) return null;
  if (chosen.length === 0 && !canUndo) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-12 sm:bottom-3 z-20 flex justify-center px-2.5">
      <div className="pointer-events-auto flex max-w-[94vw] sm:max-w-[75%] flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-slate-700/80 bg-slate-900/95 px-3 py-1.5 shadow-xl backdrop-blur-md">
        {chosen.length > 1 && (
          <>
            <div className="hidden sm:flex min-w-0 items-center gap-1.5 pr-1">
              {chosen.slice(-2).map((organ) => (
                <span
                  key={organ.organ_id}
                  title={organSubtitle(organ)}
                  className="max-w-36 truncate text-xs font-extrabold italic text-sky-300"
                >
                  {organLabel(organ)}
                </span>
              ))}
              {chosen.length > 2 && (
                <span className="text-[10px] font-bold text-white">+{chosen.length - 2}</span>
              )}
            </div>

            <button
              type="button"
              onClick={hideSelection}
              title={at("إخفاء الأجزاء المحددة (H)", "Hide selected parts (H)")}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-violet-500/55 bg-violet-500/20 px-2.5 py-1 text-[11px] font-extrabold text-white transition hover:bg-violet-500/35"
            >
              <EyeOff size={13} />
              <span>{at(`إخفاء (${chosen.length})`, `Hide (${chosen.length})`)}</span>
            </button>

            <button
              type="button"
              onClick={isolateSelection}
              title={at("عزل الأجزاء المحددة (I)", "Isolate selected parts (I)")}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-sky-500/55 bg-sky-500/20 px-2.5 py-1 text-[11px] font-extrabold text-white transition hover:bg-sky-500/35"
            >
              <Crosshair size={13} />
              <span>{at("عزل", "Isolate")}</span>
            </button>
          </>
        )}

        {canUndo && (
          <button
            type="button"
            onClick={undoLastStep}
            title={at("رجوع خطوة للوراء (إظهار آخر جزء تم إخفاؤه)", "Step back / Undo last dissection step")}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/55 bg-amber-500/20 px-2.5 py-1 text-[11px] font-extrabold text-white transition hover:bg-amber-500/35"
          >
            <Undo2 size={13} />
            <span>{at("رجوع خطوة", "Undo")}</span>
          </button>
        )}

        {hiddenOrganIds.length > 1 && (
          <button
            type="button"
            onClick={unhideAll}
            title={at("إظهار جميع الأجزاء المخفية", "Restore all hidden structures")}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/55 bg-emerald-500/20 px-2.5 py-1 text-[11px] font-extrabold text-white transition hover:bg-emerald-500/35"
          >
            <RotateCcw size={12} />
            <span>{at(`إظهار الكل (${hiddenOrganIds.length})`, `Restore All (${hiddenOrganIds.length})`)}</span>
          </button>
        )}

        {chosen.length > 1 && (
          <button
            type="button"
            onClick={clearSelection}
            title={at("إلغاء التحديد", "Clear selection")}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rose-400/55 bg-rose-500/30 text-white shadow transition hover:bg-rose-500/55"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
