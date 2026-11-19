'use client';

import type { BackgroundMode } from "@/features/viewer/background";
import type { AnatomicalSystem } from "@/lib/schemas";
import { readLocal, writeLocal } from "@/lib/localStore";

/**
 * The parts of the view worth carrying between sessions.
 * Bumped to v2 so fast defaults (depthProbeVisible: false, eyeTracking: false,
 * hideConnective: true) apply cleanly without stale v1 overrides.
 */

const STORAGE_KEY = "anatria3d.view.v3";

export interface ViewPreferences {
  hiddenSystems: AnatomicalSystem[];
  systemOpacity: Partial<Record<AnatomicalSystem, number>>;
  eyeTracking: boolean;
  labelsVisible: boolean;
  background: BackgroundMode;
  depthProbeVisible: boolean;
  hideConnective: boolean;
}

const clamp = (value: number, low: number, high: number) =>
  Math.min(Math.max(value, low), high);

export function sanitiseViewPreferences(
  raw: unknown,
  known: Iterable<AnatomicalSystem>,
): Partial<ViewPreferences> {
  if (typeof raw !== "object" || raw === null) return {};
  const stored = raw as Record<string, unknown>;
  const systems = new Set(known);
  const clean: Partial<ViewPreferences> = {};

  if (Array.isArray(stored.hiddenSystems)) {
    clean.hiddenSystems = stored.hiddenSystems.filter(
      (system): system is AnatomicalSystem =>
        typeof system === "string" && systems.has(system as AnatomicalSystem),
    );
  }

  if (typeof stored.systemOpacity === "object" && stored.systemOpacity !== null) {
    const opacity: Partial<Record<AnatomicalSystem, number>> = {};
    for (const [system, value] of Object.entries(stored.systemOpacity)) {
      if (!systems.has(system as AnatomicalSystem)) continue;
      if (typeof value !== "number" || !Number.isFinite(value)) continue;
      if (value >= 1) continue;
      opacity[system as AnatomicalSystem] = clamp(value, 0.02, 0.99);
    }
    clean.systemOpacity = opacity;
  }

  if (typeof stored.eyeTracking === "boolean") clean.eyeTracking = stored.eyeTracking;
  if (typeof stored.labelsVisible === "boolean") clean.labelsVisible = stored.labelsVisible;
  if (typeof stored.hideConnective === "boolean") clean.hideConnective = stored.hideConnective;
  if (typeof stored.depthProbeVisible === "boolean") {
    clean.depthProbeVisible = stored.depthProbeVisible;
  }
  if (stored.background === "dark" || stored.background === "light") {
    clean.background = stored.background;
  }

  return clean;
}

/** The raw stored value, or null. Parsing failures are treated as absence. */
export function readStoredView(): unknown {
  try {
    const raw = readLocal(STORAGE_KEY);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeStoredView(preferences: ViewPreferences): void {
  try {
    writeLocal(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Ignore storage quota errors
  }
}
