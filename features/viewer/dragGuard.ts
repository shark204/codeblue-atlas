'use client';

import type * as THREE from "three";

export const DRAG_SLOP = 5;

const PROBE_RAYCAST_INTERVAL_MS = 180;

const activePointerIds = new Set<number>();
let multiTouchGesture = false;
let origin: { x: number; y: number } | null = null;
let lastPos: { x: number; y: number } | null = null;
let maxTravelDist = 0;
let pressStartedAt = 0;
let lastPressDurationMs = 0;
let travelled = false;
let pressing = false;
let depthProbeEnabled = false;
let lastDragEndedAt = 0;
let lastCameraChangedAt = 0;

let immediateUntil = 0;
let lastProbePassAt = 0;

export function setDepthProbeRaycastEnabled(enabled: boolean): void {
  depthProbeEnabled = enabled;
}

export function noteCameraChange(): void {
  if (pressing || activePointerIds.size > 0) {
    lastCameraChangedAt = performance.now();
    if (maxTravelDist > 2.2 || activePointerIds.size >= 2) {
      travelled = true;
      immediateUntil = 0;
    }
  }
}

export function beginPress(x: number, y: number, pointerId = 0): void {
  activePointerIds.add(pointerId);
  if (activePointerIds.size >= 2) {
    multiTouchGesture = true;
    travelled = true;
    immediateUntil = 0;
    return;
  }
  multiTouchGesture = false;
  origin = { x, y };
  lastPos = { x, y };
  maxTravelDist = 0;
  pressStartedAt = performance.now();
  travelled = false;
  pressing = true;
  immediateUntil = pressStartedAt + 600;
}

export function endPress(pointerId?: number): void {
  const now = performance.now();
  const wasTravelled = travelled || multiTouchGesture || maxTravelDist > DRAG_SLOP;
  if (pressStartedAt > 0) {
    lastPressDurationMs = now - pressStartedAt;
  }
  if (pointerId !== undefined) {
    activePointerIds.delete(pointerId);
  } else {
    activePointerIds.clear();
  }
  if (activePointerIds.size === 0) {
    pressing = false;
    origin = null;
    if (wasTravelled) {
      lastDragEndedAt = now;
      immediateUntil = 0;
      setTimeout(() => {
        if (!pressing && activePointerIds.size === 0) {
          travelled = false;
          multiTouchGesture = false;
        }
      }, 320);
    } else {
      immediateUntil = now + 450;
    }
  }
}

export function allowImmediateRaycast(): void {
  const now = performance.now();
  if (multiTouchGesture || travelled || (now - lastDragEndedAt < 300) || activePointerIds.size >= 2) {
    return;
  }
  immediateUntil = now + 450;
}

export function trackPress(x: number, y: number): void {
  if (activePointerIds.size >= 2) {
    multiTouchGesture = true;
    travelled = true;
    immediateUntil = 0;
    return;
  }
  if (!pressing || origin === null) return;
  lastPos = { x, y };
  const dist = Math.hypot(x - origin.x, y - origin.y);
  if (dist > maxTravelDist) {
    maxTravelDist = dist;
  }
  if (dist > DRAG_SLOP) {
    travelled = true;
    immediateUntil = 0;
  }
}

export function pressTravelled(): boolean {
  return (
    travelled ||
    multiTouchGesture ||
    activePointerIds.size >= 2 ||
    maxTravelDist > DRAG_SLOP ||
    performance.now() - lastDragEndedAt < 300
  );
}

/**
 * Strict mobile single-tap check:
 * - When no organ is open yet: accepts any clean single-finger tap (`maxTravelDist <= 4.5px`, no drag in last 320ms).
 * - When an organ is ALREADY open & being inspected (`alreadyInspecting = true`): requires an ultra-clean, deliberate
 *   stationary tap (`maxTravelDist <= 3.0px`, `45ms <= duration <= 340ms`, and `>= 420ms` after any camera movement/zoom)
 *   so rotating, panning, or zooming the 3D model on mobile NEVER accidentally switches to another organ!
 */
export function isCleanMobileSingleTap(alreadyInspecting: boolean): boolean {
  const now = performance.now();
  if (multiTouchGesture || travelled || activePointerIds.size >= 2) return false;
  if (now - lastDragEndedAt < (alreadyInspecting ? 420 : 300)) return false;
  if (alreadyInspecting) {
    if (maxTravelDist > 3.0) return false;
    if (now - lastCameraChangedAt < 380 && maxTravelDist > 1.8) return false;
    if (lastPressDurationMs > 0 && (lastPressDurationMs < 35 || lastPressDurationMs > 360)) return false;
  } else {
    if (maxTravelDist > 4.5) return false;
  }
  return true;
}

export function shouldRunRaycastPass(_raycaster: THREE.Raycaster): boolean {
  const now = performance.now();
  if (multiTouchGesture || activePointerIds.size >= 2 || travelled || (now - lastDragEndedAt < 300)) {
    return false;
  }
  if (pressing && travelled) {
    return false;
  }
  if (now <= immediateUntil && !travelled) {
    return true;
  }
  if (depthProbeEnabled && !pressing && now - lastProbePassAt >= PROBE_RAYCAST_INTERVAL_MS) {
    lastProbePassAt = now;
    return true;
  }
  return false;
}

export function resetPress(): void {
  activePointerIds.clear();
  multiTouchGesture = false;
  origin = null;
  lastPos = null;
  maxTravelDist = 0;
  pressStartedAt = 0;
  lastPressDurationMs = 0;
  travelled = false;
  pressing = false;
  immediateUntil = 0;
  lastDragEndedAt = 0;
  lastCameraChangedAt = 0;
}
