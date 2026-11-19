'use client';

export interface Level {
  scale: number;
  bloom: number;
  particles: number;
  fps?: number;
}

export const LEVELS: readonly Level[] = [
  { scale: 1.0, bloom: 0.75, particles: 0.75 },
  { scale: 1.0, bloom: 0.85, particles: 0.85 },
  { scale: 1.0, bloom: 0.95, particles: 0.95 },
  { scale: 1.0, bloom: 1.0, particles: 1.0 },
];

export function pixelRatioFor(level: Level, devicePixelRatio: number): number {
  return Math.min(2.0, Math.max(1.25, (devicePixelRatio || 1) * level.scale));
}
export const FULL = LEVELS.length - 1;

export type Adapter = "software" | "integrated" | "dedicated" | "unknown";

export function classifyAdapter(renderer: string | null): Adapter {
  if (!renderer) return "unknown";
  if (/swiftshader|basic render|llvmpipe|softpipe|software|warp/i.test(renderer)) return "software";
  if (/nvidia|geforce|quadro|rtx|gtx|radeon\s*(rx|pro)|arc\s*a\d|\bamd\b.*\brx\b/i.test(renderer)) return "dedicated";
  if (/intel|uhd|iris|hd graphics|radeon\(tm\) graphics|radeon graphics|vega|adreno|mali|apple/i.test(renderer)) return "integrated";
  return "unknown";
}

export function startingLevel(adapter: Adapter): number {
  if (adapter === "software") return 1;
  return FULL;
}

export interface DeviceProfile {
  mobile: boolean;
  ceiling: number;
  start: number;
  fpsCap: number;
  maxDpr: number;
  lightPost: boolean;
}

export function deviceProfile(adapter: Adapter, ua?: string, touch?: number): DeviceProfile {
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  const agent = ua ?? nav?.userAgent ?? "";
  const points = touch ?? nav?.maxTouchPoints ?? 0;
  const mobile = /android|iphone|ipad|ipod|mobile/i.test(agent) || (points > 1 && /macintosh/i.test(agent));
  return {
    mobile,
    ceiling: FULL,
    start: startingLevel(adapter),
    fpsCap: 0,
    maxDpr: 2.0,
    lightPost: false,
  };
}

export class FpsLimiter {
  private last = 0;
  private interval = 0;
  constructor(fps = 0) {
    this.setFps(fps);
  }
  setFps(fps: number) {
    this.interval = fps > 0 ? 1000 / fps : 0;
  }
  shouldRender(nowMs: number): boolean {
    if (this.interval <= 0) return true;
    if (nowMs - this.last >= this.interval * 0.9) {
      this.last = nowMs;
      return true;
    }
    return false;
  }
}

export class FrameGovernor {
  private level: number;
  private ceiling: number;

  constructor(start: number = FULL, ceiling: number = FULL) {
    this.ceiling = Math.max(0, Math.min(FULL, ceiling));
    this.level = Math.max(0, Math.min(this.ceiling, start));
  }

  current(): number {
    return this.level;
  }

  currentLevel(): Level {
    return LEVELS[this.level]!;
  }

  sample(_dtSeconds: number): number {
    return this.level;
  }
}
