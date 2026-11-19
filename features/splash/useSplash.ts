'use client';

export const MINIMUM_MS = 0;
export const CEILING_MS = 5_000;
export const FADE_MS = 0;

export type SplashPhase = "showing" | "leaving" | "gone";

export function useSplash(ready: boolean): { visible: boolean; leaving: boolean } {
  return { visible: false, leaving: false };
}
