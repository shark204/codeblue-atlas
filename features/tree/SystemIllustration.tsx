'use client';

import React from "react";
import AtlasViewer3D from "@/components/AtlasViewer3D";
import {
  ATLAS_PANELS_MAP,
  type AtlasPanelScientificEntry,
  type PanelId,
} from "@/lib/atlasScientificContent";

export {
  SYSTEMIC_PANELS_CONTENT as SYSTEMIC_PANELS,
  REGIONAL_PANELS_CONTENT as REGIONAL_VISCERAL_PANELS,
  SOUNDS_AND_IMAGING_CONTENT as SOUNDS_AND_IMAGING_PANELS,
  ATLAS_PANELS_MAP,
  type AtlasPanelScientificEntry as SystemCardSpec,
  type PanelId,
} from "@/lib/atlasScientificContent";

/**
 * يعرض صورة المجسم ثلاثي الأبعاد الواقعية (3D Dark-Room Side-Spotlight Studio)
 * أو الفيديو الطبي المعتمد فوراً في لحظة بدء التشغيل (0ms) بدون أي رسوم بدائية (SVG).
 */
export function SystemIllustration({
  id,
}: {
  id: PanelId;
  accent: string;
  live3D?: boolean;
  diagramUrl?: string;
}) {
  const spec = ATLAS_PANELS_MAP[id];
  if (!spec) return null;

  return (
    <AtlasViewer3D
      panel={spec}
      height={112}
      panelPreview
    />
  );
}
