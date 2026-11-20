'use client';

import type * as THREE from "three";

export const DRAG_SLOP = 5;

const PROBE_RAYCAST_INTERVAL_MS = 180;

const activePointerIds = new Set<number>();
let multiTouchGesture = false;
let origin: { x: number; y: number } | null = null;
let travelled = false;
let pressing = false;
let depthProbeEnabled = false;
let lastDragEndedAt = 0;

let immediateUntil = 0;
let lastProbePassAt = 0;

export function setDepthProbeRaycastEnabled(enabled: boolean): void {
  depthProbeEnabled = enabled;
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
  travelled = false;
  pressing = true;
  immediateUntil = performance.now() + 600;
}

export function endPress(pointerId?: number): void {
  const wasTravelled = travelled || multiTouchGesture;
  if (pointerId !== undefined) {
    activePointerIds.delete(pointerId);
  } else {
    activePointerIds.clear();
  }
  if (activePointerIds.size === 0) {
    pressing = false;
    origin = null;
    if (wasTravelled) {
      lastDragEndedAt = performance.now();
      immediateUntil = 0;
      setTimeout(() => {
        if (!pressing && activePointerIds.size === 0) {
          travelled = false;
          multiTouchGesture = false;
        }
      }, 260);
    } else {
      immediateUntil = performance.now() + 450;
    }
  }
}

export function allowImmediateRaycast(): void {
  const now = performance.now();
  if (multiTouchGesture || travelled || (now - lastDragEndedAt < 260) || activePointerIds.size >= 2) {
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
  if (!pressing || origin === null || travelled) return;
  if (Math.hypot(x - origin.x, y - origin.y) > DRAG_SLOP) {
    travelled = true;
    immediateUntil = 0;
  }
}

export function pressTravelled(): boolean {
  return (
    travelled ||
    multiTouchGesture ||
    activePointerIds.size >= 2 ||
    performance.now() - lastDragEndedAt < 260
  );
}

export function shouldRunRaycastPass(_raycaster: THREE.Raycaster): boolean {
  const now = performance.now();
  if (multiTouchGesture || activePointerIds.size >= 2 || travelled || (now - lastDragEndedAt < 260)) {
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
  travelled = false;
  pressing = false;
  immediateUntil = 0;
  lastDragEndedAt = 0;
}
