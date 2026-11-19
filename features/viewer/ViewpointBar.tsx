'use client';

import { useEffect } from "react";
import { useSceneStore } from "@/stores/sceneStore";
import {
  DOLLY_IN,
  DOLLY_OUT,
  FIT_KEY,
  VIEW_FOR_KEY,
  zoomKeyFor,
} from "./cameraViews";
import { viewportKey } from "./viewportKeys";

/**
 * Keyboard viewpoint shortcuts remain active (`a`, `p`, `l`, `m`, `s`, `i`, `f`, `+`, `-`),
 * while the old floating ViewpointBar UI is removed (`شيل البانل القديم بتاعنا ده`).
 */
export function ViewpointBar() {
  const fitView = useSceneStore((s) => s.fitView);
  const orientView = useSceneStore((s) => s.orientView);
  const dollyView = useSceneStore((s) => s.dollyView);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = viewportKey(event);
      if (key === null) return;

      const direction = zoomKeyFor(event);
      if (direction !== null) {
        dollyView(direction === "in" ? DOLLY_IN : DOLLY_OUT);
        event.preventDefault();
        return;
      }

      if (key === FIT_KEY) {
        fitView();
        event.preventDefault();
        return;
      }

      const view = VIEW_FOR_KEY[key];
      if (view === undefined) return;
      orientView(view);
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dollyView, fitView, orientView]);

  return null;
}
