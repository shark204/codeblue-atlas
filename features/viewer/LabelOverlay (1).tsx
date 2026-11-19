'use client';

import { useEffect, useMemo, useRef } from "react";

import type { ManifestOrgan } from "@/lib/schemas";
import { useBreathStore } from "@/stores/breathStore";
import { useHeartStore } from "@/stores/heartStore";
import { organLabel, useSceneStore } from "@/stores/sceneStore";

import { backgroundTheme } from "./background";
import { layoutLabels, type LabelAnchor } from "./labelLayout";
import { getViewerHandle, projectToScreen, structurePosition } from "./viewerBridge";

const MAX_LABELS = 40;

export interface LabelPanel {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const FULL_CANVAS: LabelPanel = { left: 0, top: 0, width: 1, height: 1 };

/**
 * Splits any anatomical label into compact 2-words-per-line rows (`خلي كل كلمتين فوق بعض`)
 * so long Latin/English names stack vertically instead of stretching across the viewport.
 */
export function formatTwoWordsPerLine(raw: string): string[] {
  const rawTokens = raw.trim().split(/\s+/).filter(Boolean);
  if (rawTokens.length === 0) return [raw];

  // Merge standalone bullet/dot separators like "·" with the following token so "· right" stays together
  const tokens: string[] = [];
  for (let i = 0; i < rawTokens.length; i++) {
    const t = rawTokens[i]!;
    if ((t === "·" || t === "-" || t === "—") && i + 1 < rawTokens.length) {
      tokens.push(`${t} ${rawTokens[i + 1]!}`);
      i += 1;
    } else {
      tokens.push(t);
    }
  }

  const lines: string[] = [];
  for (let i = 0; i < tokens.length; i += 2) {
    lines.push(tokens.slice(i, i + 2).join(" "));
  }
  return lines.length > 0 ? lines : [raw];
}

/**
 * Compact 3D Callout Labels (`LabelOverlay.tsx`):
 * - Every 2 words are stacked vertically (`خلي كل كلمتين فوق بعض`).
 * - Ultra-thin leader arrow (`0.65px`) pointing from the label to the structure (`اي كلمة عالمجسم اعمل سهم رفيع جدا منها وصغر الكلمة`).
 */
export function LabelOverlay({ panel = FULL_CANVAS }: { panel?: LabelPanel } = {}) {
  const labelsVisible = useSceneStore((s) => s.labelsVisible);
  const organs = useSceneStore((s) => s.organs);
  const selectedOrganIds = useSceneStore((s) => s.selectedOrganIds);
  const isolatedOrganIds = useSceneStore((s) => s.isolatedOrganIds);
  const heartEnabled = useHeartStore((s) => s.enabled);
  const breathEnabled = useBreathStore((s) => s.enabled);
  const isSoundMode = heartEnabled || breathEnabled;
  const theme = backgroundTheme(useSceneStore((s) => s.background));
  const focusBadge = useSceneStore((s) => s.focusBadge);

  const badgeFor =
    focusBadge && selectedOrganIds.length === 1 && selectedOrganIds[0] === focusBadge.organId
      ? focusBadge
      : null;

  const container = useRef<HTMLDivElement>(null);
  const nodes = useRef(new Map<string, HTMLSpanElement>());
  const lines = useRef(new Map<string, SVGLineElement>());
  const dots = useRef(new Map<string, SVGCircleElement>());

  const targets = useMemo(
    () => labelTargets(organs, selectedOrganIds, isolatedOrganIds, labelsVisible),
    [organs, selectedOrganIds, isolatedOrganIds, labelsVisible],
  );

  const maxLineCount = useMemo(() => {
    let m = 1;
    for (const t of targets) {
      const c = formatTwoWordsPerLine(t.text).length;
      if (c > m) m = c;
    }
    return m;
  }, [targets]);

  useEffect(() => {
    if (targets.length === 0) return;
    if (!labelsVisible && typeof window !== "undefined" && window.innerWidth < 640) return;
    let frame = 0;
    let lastCamSig = "";

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const handle = getViewerHandle();
      const host = container.current;
      if (!handle || !host) return;

      if (panel.left !== 0 || panel.top !== 0) {
        throw new Error("LabelOverlay expects the driven panel at the top left");
      }
      const width = host.clientWidth * panel.width;
      const height = host.clientHeight * panel.height;
      const cam = handle.camera;
      const p = cam.position;
      const q = cam.quaternion;
      const sig = `${width}|${height}|${handle.geometryRevision}|${p.x.toFixed(4)},${p.y.toFixed(4)},${p.z.toFixed(4)}|${q.x.toFixed(4)},${q.y.toFixed(4)},${q.z.toFixed(4)},${q.w.toFixed(4)}`;
      if (sig === lastCamSig) return;
      lastCamSig = sig;

      // Compute average centre of currently measured structures to detect back-facing labels
      let sumX = 0, sumY = 0, sumZ = 0, cnt = 0;
      for (const t of targets) {
        const c = structurePosition(handle, t.id);
        if (c) {
          sumX += c.x;
          sumY += c.y;
          sumZ += c.z;
          cnt++;
        }
      }
      const refX = cnt > 1 ? sumX / cnt : 0;
      const refZ = cnt > 1 ? sumZ / cnt : 0;

      const anchors: LabelAnchor[] = targets.map((target) => {
        const centre = structurePosition(handle, target.id);
        if (!centre) return { ...target, x: NaN, y: NaN };
        const point = projectToScreen(centre, handle.camera, width, height);
        // Keep labels visible across all 360-degree camera angles when viewing the structure, only hiding if occluded behind the camera
        return { ...target, x: point.x, y: point.y, behind: point.behind };
      });

      const placed = layoutLabels(anchors, {
        width,
        height,
        lineHeight: Math.max(36, maxLineCount * 14 + 12),
        gap: 72,
        measure: (text) => {
          for (const [id, node] of nodes.current.entries()) {
            const matching = targets.find((t) => t.id === id);
            if (matching && matching.text === text) return node.offsetWidth;
          }
          return 90;
        },
      });
      const shown = new Set(placed.map((label) => label.id));

      for (const label of placed) {
        const node = nodes.current.get(label.id);
        const line = lines.current.get(label.id);
        const dot = dots.current.get(label.id);
        if (node) {
          node.style.display = "";
          node.style.transform = `translate(${
            label.side === "left" ? label.labelX - node.offsetWidth : label.labelX
          }px, ${label.labelY - node.offsetHeight / 2}px)`;
        }
        if (line) {
          line.style.display = "";
          line.setAttribute("x1", String(label.labelX));
          line.setAttribute("y1", String(label.labelY));
          line.setAttribute("x2", String(label.x));
          line.setAttribute("y2", String(label.y));
        }
        if (dot) {
          dot.style.display = "";
          dot.setAttribute("cx", String(label.x));
          dot.setAttribute("cy", String(label.y));
        }
      }

      for (const [id, node] of nodes.current) {
        if (!shown.has(id)) node.style.display = "none";
      }
      for (const [id, line] of lines.current) {
        if (!shown.has(id)) line.style.display = "none";
      }
      for (const [id, dot] of dots.current) {
        if (!shown.has(id)) dot.style.display = "none";
      }
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [targets, labelsVisible, maxLineCount, panel.left, panel.top, panel.width, panel.height]);

  if (targets.length === 0 || isSoundMode) return null;

  return (
    <div
      ref={container}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${
        !labelsVisible ? "hidden sm:block" : ""
      }`}
    >
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <marker
            id="cb-label-arrow"
            viewBox="0 0 8 8"
            refX="6.8"
            refY="4"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path
              d="M1 1.5L6.8 4L1 6.5"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>
        {targets.map((target) => (
          <g key={target.id}>
            <line
              ref={(node) => {
                if (node) lines.current.set(target.id, node);
                else lines.current.delete(target.id);
              }}
              stroke={theme.leader}
              strokeWidth={0.65}
              markerEnd="url(#cb-label-arrow)"
              style={{ display: "none" }}
            />
            <circle
              ref={(node) => {
                if (node) dots.current.set(target.id, node);
                else dots.current.delete(target.id);
              }}
              r={1.7}
              fill="#38bdf8"
              stroke="#0f172a"
              strokeWidth={0.8}
              style={{ display: "none" }}
            />
          </g>
        ))}
      </svg>

      {targets.map((target) => {
        const stackedLines = formatTwoWordsPerLine(target.text);
        return (
          <span
            key={target.id}
            ref={(node) => {
              if (node) nodes.current.set(target.id, node);
              else nodes.current.delete(target.id);
            }}
            style={{
              display: "none",
              top: 0,
              left: 0,
              backgroundColor: theme.chip,
              color: theme.ink,
            }}
            className="absolute flex items-center gap-1 rounded-md border border-sky-400/35 px-1.5 py-0.5 text-[8.5px] font-semibold italic leading-[1.15] shadow-md backdrop-blur-md"
          >
            {badgeFor?.organId === target.id && (
              <span className="flex h-3 min-w-3 shrink-0 items-center justify-center rounded-full bg-sky-500/20 px-0.5 text-[7.5px] font-bold not-italic text-sky-300">
                {badgeFor.index}
              </span>
            )}
            <span className="flex flex-col text-left">
              {stackedLines.map((line, idx) => (
                <span key={idx} className="block whitespace-nowrap">
                  {line}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function labelTargets(
  organs: Record<string, { organ_id: string; ta2_latin: string; name_en: string; system?: string }>,
  selectedOrganIds: string[],
  isolatedOrganIds: string[] | null,
  labelsVisible: boolean,
): { id: string; text: string }[] {
  if (!labelsVisible) {
    return [];
  }
  if (selectedOrganIds.length > 0) {
    return named(organs, selectedOrganIds.slice(0, 8));
  }
  if (isolatedOrganIds && isolatedOrganIds.length > 0 && isolatedOrganIds.length <= 6) {
    return named(organs, isolatedOrganIds);
  }
  return [];
}

function named(
  organs: Record<string, { organ_id: string; ta2_latin: string; name_en: string }>,
  ids: string[],
): { id: string; text: string }[] {
  return ids
    .slice(0, MAX_LABELS)
    .map((id) => organs[id])
    .filter((organ) => !!organ)
    .map((organ) => ({ id: organ.organ_id, text: organLabel(organ as ManifestOrgan) }));
}
