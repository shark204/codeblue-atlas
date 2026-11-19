'use client';

import * as THREE from "three";

export type AnatomicalView =
  | "anterior"
  | "posterior"
  | "left"
  | "right"
  | "superior"
  | "inferior";

/** Short label for the button; the tooltip carries the rest. */
export const VIEW_LABEL: Record<AnatomicalView, string> = {
  anterior: "A",
  posterior: "P",
  left: "L",
  right: "R",
  superior: "S",
  inferior: "I",
};

export const VIEW_HINT: Record<AnatomicalView, string> = {
  anterior: "Anterior — looking at the front",
  posterior: "Posterior — looking at the back",
  left: "Left lateral — the body's own left side",
  right: "Right lateral — the body's own right side",
  superior: "Superior — looking down from above",
  inferior: "Inferior — looking up from below",
};

export const VIEW_FOR_KEY: Record<string, AnatomicalView> = Object.fromEntries(
  (Object.keys(VIEW_LABEL) as AnatomicalView[]).map((view) => [
    VIEW_LABEL[view].toLowerCase(),
    view,
  ]),
);

export const FIT_KEY = "f";

export const VIEW_ORDER: AnatomicalView[] = [
  "anterior",
  "posterior",
  "left",
  "right",
  "superior",
  "inferior",
];

export function lateralSign(
  organIds: Iterable<string>,
  centres: Map<string, THREE.Vector3>,
): 1 | -1 {
  let votes = 0;
  for (const id of organIds) {
    if (!id.endsWith("_l")) continue;
    const left = centres.get(id);
    const right = centres.get(`${id.slice(0, -2)}_r`);
    if (!left || !right) continue;
    if (left.x > right.x) votes += 1;
    else if (left.x < right.x) votes -= 1;
  }
  return votes >= 0 ? 1 : -1;
}

export function viewDirection(view: AnatomicalView, leftSign: 1 | -1): THREE.Vector3 {
  switch (view) {
    case "anterior":
      return new THREE.Vector3(0, 0, 1);
    case "posterior":
      return new THREE.Vector3(0, 0, -1);
    case "left":
      return new THREE.Vector3(leftSign, 0, 0);
    case "right":
      return new THREE.Vector3(-leftSign, 0, 0);
    case "superior":
      return new THREE.Vector3(0, 1, 0.001).normalize();
    case "inferior":
      return new THREE.Vector3(0, -1, 0.001).normalize();
  }
}

const SCAN_YAW = (32 * Math.PI) / 180;
const SCAN_RISE = 0.17;

export function scanStance(): THREE.Vector3 {
  return new THREE.Vector3(Math.sin(SCAN_YAW), SCAN_RISE, Math.cos(SCAN_YAW)).normalize();
}

export function framingDistance(radius: number, fovDegrees: number, aspect = 1): number {
  const vFovRad = (fovDegrees * Math.PI) / 180;
  const safeAspect = Math.max(aspect || 1, 0.48);
  const vHalf = vFovRad * 0.5;
  const hHalf = Math.atan(Math.tan(vHalf) * safeAspect);
  const minHalfFov = Math.min(vHalf, hHalf);
  return (Math.max(radius, 1e-4) * 1.04) / Math.tan(minHalfFov);
}

export const DOLLY_IN = 0.7;
export const DOLLY_OUT = 1 / DOLLY_IN;

export function zoomKeyFor(event: {
  key: string;
  code: string;
}): "in" | "out" | null {
  if (event.key === "+" || event.key === "=" || event.code === "NumpadAdd") {
    return "in";
  }
  if (event.key === "-" || event.key === "_" || event.code === "NumpadSubtract") {
    return "out";
  }
  return null;
}
