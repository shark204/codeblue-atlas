'use client';

import { useAtlasLocale } from "@/lib/atlasI18n";
import { organLabel, organSubtitle, useSceneStore } from "@/stores/sceneStore";

import { depthReadingState, DISMISS_HINT, HEADING, SUBHEADING } from "./depthReading";
import { MAX_STACK } from "./depthStack";
import { tissueHex } from "./palette";

/**
 * Surgical Depth Probe (`DepthProbe.tsx`):
 * Lists anatomical layers from superficial to deep along the pointer's ray.
 * Hidden on narrow mobile viewports (`hidden md:block`) so it never overlaps
 * the 3D model or `SelectedOrganCard`.
 */
export function DepthProbe() {
  const { at } = useAtlasLocale();
  const visible = useSceneStore((s) => s.depthProbeVisible);
  const stack = useSceneStore((s) => s.depthStack);
  const pinned = useSceneStore((s) => s.pinnedStack);
  const dismiss = useSceneStore((s) => s.dismissDepthStack);
  const organs = useSceneStore((s) => s.organs);
  const hovered = useSceneStore((s) => s.hoveredOrganId);
  const applyCommand = useSceneStore((s) => s.applyCommand);
  const selectedOrganIds = useSceneStore((s) => s.selectedOrganIds);
  const selectOrgan = useSceneStore((s) => s.selectOrgan);

  const showing = pinned ?? stack;
  const state = depthReadingState(pinned !== null);
  const layers = showing.map((id) => organs[id]).filter((organ) => !!organ);
  const picks = new Set(selectedOrganIds);
  const pickedHere = layers.filter((organ) => picks.has(organ.organ_id)).length;

  if (!visible) return null;
  if (layers.length < 2) return null;

  return (
    <div className="pointer-events-none hidden md:block absolute right-3 bottom-14 z-20">
      <div
        className={`pointer-events-auto w-60 overflow-hidden rounded-xl border bg-slate-900/95 shadow-xl backdrop-blur-md transition-colors ${
          state === "live" ? "border-slate-700/80" : "border-sky-700/70"
        }`}
      >
        <p className="flex items-center gap-1.5 border-b border-slate-800 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {state === "live" ? at("تحت المؤشر", HEADING[state]) : at("موضع النقر المثبّت", HEADING[state])}
          <span className="font-normal normal-case tracking-normal text-slate-500">
            {state === "live" ? at("من السطح للعمق", SUBHEADING[state]) : at("مثبّت — حرّك بحرية", SUBHEADING[state])}
          </span>
          <button
            type="button"
            onClick={dismiss}
            title={DISMISS_HINT[state]}
            className="ml-auto rounded border border-rose-400/55 bg-rose-500/30 px-1.5 py-0.5 text-[10px] font-black leading-none text-white shadow transition hover:bg-rose-500/55"
          >
            ✕
          </button>
        </p>

        <ol className="max-h-[38vh] overflow-y-auto py-1">
          {layers.map((organ, index) => {
            const picked = picks.has(organ.organ_id);
            return (
              <li
                key={organ.organ_id}
                className={`group flex items-stretch border-l-2 ${
                  picked ? "border-sky-500/70" : "border-transparent"
                }`}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    if (event.ctrlKey || event.metaKey) {
                      selectOrgan(organ.organ_id, true);
                      return;
                    }
                    applyCommand({ action: "focus_organ", organ_id: organ.organ_id });
                  }}
                  title={`${organSubtitle(organ)} — Ctrl-click to add it to the selection`}
                  className={`flex min-w-0 flex-1 items-center gap-2 py-1 pl-2.5 pr-1 text-left transition ${
                    hovered === organ.organ_id
                      ? "bg-sky-600/20"
                      : picked
                        ? "bg-sky-500/10"
                        : "hover:bg-slate-800/70"
                  }`}
                >
                  <span
                    className={`w-3 shrink-0 text-right text-[9px] tabular-nums ${
                      picked ? "text-sky-300" : "text-slate-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full ring-1 ring-inset ring-black/40"
                    style={{ backgroundColor: tissueHex(organ) }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] italic text-slate-200">
                      {organLabel(organ)}
                    </span>
                    <span className="block truncate text-[9px] text-slate-400">
                      {organSubtitle(organ)}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyCommand({
                      action: "isolate_structures",
                      organ_ids: [organ.organ_id],
                    })
                  }
                  title={`Show only ${organLabel(organ)} — Esc restores`}
                  className="shrink-0 px-1.5 text-[8px] uppercase tracking-wide text-slate-500 opacity-0 transition group-hover:opacity-100 hover:text-sky-300 focus-visible:opacity-100"
                >
                  solo
                </button>
              </li>
            );
          })}
        </ol>

        <p className="border-t border-slate-800 px-2.5 py-1 text-[9px] text-slate-400">
          {pickedHere > 0
            ? at(`تم تحديد ${pickedHere} من هذه الطبقات — اضغط I لعزلها`, `${pickedHere} of these selected — press I to isolate`)
            : at("اضغط Ctrl + نقر على أي طبقة لإضافتها للتحديد", "Ctrl-click a line to add it to the selection")}
        </p>

        {layers.length > 1 && (
          <button
            type="button"
            onClick={() =>
              applyCommand({
                action: "isolate_structures",
                organ_ids: layers.map((organ) => organ.organ_id),
              })
            }
            title="Leave only what the ray crosses — Esc restores"
            className="w-full border-t border-slate-800 px-2.5 py-1 text-left text-[9px] uppercase tracking-wide text-slate-400 transition hover:bg-slate-800/60 hover:text-sky-300"
          >
            {at(`عزل مسار الطبقات (${layers.length})`, `Isolate these ${layers.length}`)}
          </button>
        )}

        {layers.length >= MAX_STACK && (
          <p className="border-t border-slate-800 px-2.5 py-1 text-[9px] text-slate-500">
            Nearest {MAX_STACK} — the ray goes deeper than this.
          </p>
        )}
      </div>
    </div>
  );
}
