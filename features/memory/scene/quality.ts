'use client';

/**
 * quality.ts — drop-in replacement (every export of the old file is kept, same behaviour by default).
 *
 * What is new, and why it matters on phones:
 *  1. FrameGovernor now REMEMBERS when stepping back up failed. The old one climbed back up after ~20 s of
 *     smooth frames, the GPU heated, the OS throttled, frames got slow, it stepped down, cooled, climbed… a loop
 *     that keeps the phone hot. Now: if a step-up is followed by a step-down within LOCK_WINDOW_MS, the
 *     ceiling is lowered to the level that worked, permanently for the session.
 *  2. deviceProfile(): cheap phone/tablet detection -> a lower starting level, a hard ceiling,
 *     and a frame-rate cap (30–45 fps). Capping fps is the single biggest heat reducer – dpr alone is not enough.
 *  3. FpsLimiter: use it inside useFrame / a rAF loop so a mobile GPU idles between frames.
 *  4. Level.fps (optional) – target fps for that level.
 */

export interface Level {
  /** Share of the screen's own pixel density to draw at. */
  scale: number;
  /** The glow's resolution, as a share of the screen's. */
  bloom: number;
  /** Share of the drifting particles drawn. */
  particles: number;
  /** Optional target frame rate for this level (undefined = display rate). */
  fps?: number;
}

/** Lightest first. Index 3 is the full lab. */
export const LEVELS: readonly Level[] = [
  { scale: 0.8, bloom: 0.3, particles: 0.3, fps: 30 },
  { scale: 0.85, bloom: 0.45, particles: 0.55, fps: 45 },
  { scale: 0.92, bloom: 0.7, particles: 0.8 },
  { scale: 1, bloom: 1, particles: 1 },
];

/** Device pixels per CSS pixel at a level, never below half nor above this. */
export function pixelRatioFor(level: Level, devicePixelRatio: number): number {
  return Math.min(1.75, Math.max(0.5, (devicePixelRatio || 1) * level.scale));
}
export const FULL = LEVELS.length - 1;

export type Adapter = 'software' | 'integrated' | 'dedicated' | 'unknown';

/** What kind of graphics this is, from the renderer string WebGL reports. */
export function classifyAdapter(renderer: string | null): Adapter {
  if (!renderer) return 'unknown';
  if (/swiftshader|basic render|llvmpipe|softpipe|software|warp/i.test(renderer)) return 'software';
  if (/nvidia|geforce|quadro|rtx|gtx|radeon\s*(rx|pro)|arc\s*a\d|\bamd\b.*\brx\b/i.test(renderer)) return 'dedicated';
  if (/intel|uhd|iris|hd graphics|radeon\(tm\) graphics|radeon graphics|vega|adreno|mali|apple/i.test(renderer)) return 'integrated';
  return 'unknown';
}

/** Where to begin: generous where the hardware is known to cope, careful where it is not. */
export function startingLevel(adapter: Adapter): number {
  if (adapter === 'software') return 0;
  if (adapter === 'integrated') return 2;
  return FULL;
}

/* ───────────────────────── NEW: phone / tablet profile ───────────────────────── */

export interface DeviceProfile {
  mobile: boolean;
  /** highest level this device is allowed to climb to */
  ceiling: number;
  /** level to start at */
  start: number;
  /** frame-rate cap for the render loop (0 = uncapped) */
  fpsCap: number;
  /** max device-pixel-ratio the canvas may use */
  maxDpr: number;
  /** switch off expensive post-processing (SSAO / n8ao, bloom, SMAA…) */
  lightPost: boolean;
}

export function deviceProfile(adapter: Adapter, ua?: string, touch?: number, memGB?: number, cores?: number): DeviceProfile {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  const agent = ua ?? nav?.userAgent ?? '';
  const points = touch ?? nav?.maxTouchPoints ?? 0;
  const mobile = /android|iphone|ipad|ipod|mobile/i.test(agent) || (points > 1 && /macintosh/i.test(agent)); // iPadOS
  const mem = memGB ?? (nav as unknown as { deviceMemory?: number } | undefined)?.deviceMemory ?? 4;
  const hw = cores ?? nav?.hardwareConcurrency ?? 4;
  if (!mobile) {
    return { mobile: false, ceiling: FULL, start: startingLevel(adapter), fpsCap: 0, maxDpr: 2, lightPost: false };
  }
  // flagship phone: allowed up to level 2 at 45 fps; mid/low phone: level 1 at 30 fps.
  const strong = mem >= 6 && hw >= 8;
  return {
    mobile: true,
    ceiling: strong ? 2 : 1,
    start: strong ? 1 : 0,
    fpsCap: strong ? 45 : 30,
    maxDpr: strong ? 2 : 1.5,
    lightPost: true,
  };
}

/**
 * Frame limiter for a render loop. `shouldRender(now)` returns false until enough time has passed.
 *   const lim = new FpsLimiter(profile.fpsCap);
 *   useFrame((state) => { if (!lim.shouldRender(state.clock.elapsedTime * 1000)) return; … });
 * or with frameloop="never"/"demand": call invalidate() only when lim.shouldRender(now) is true.
 */
export class FpsLimiter {
  private last = 0;
  private interval = 0;
  constructor(fps = 0) { this.setFps(fps); }
  setFps(fps: number) { this.interval = fps > 0 ? 1000 / fps : 0; }
  shouldRender(nowMs: number): boolean {
    if (!this.interval) return true;
    if (nowMs - this.last < this.interval - 1) return false;
    this.last = nowMs;
    return true;
  }
}

/* ───────────────────────── governor ───────────────────────── */

/** Frames per judgement: about two seconds at 60 Hz. */
const WINDOW = 120;
/** A gap this long is a load or a hidden window, not the hologram being slow. */
const IGNORE_MS = 250;
/** Slower than this (under 40 fps) for a whole window steps down. */
const SLOW_MS = 25;
/** Back up only after this many windows at display rate: some twenty seconds. */
const STEADY_WINDOWS = 10;
const STEADY_MS = 18;
/** NEW: a step-up that is undone within this time is judged "too hot": the ceiling drops for the session. */
const LOCK_WINDOW_MS = 120_000;

export class FrameGovernor {
  private samples: number[] = [];
  private steady = 0;
  private lastUpAt = -Infinity;
  private lastUpFrom = -1;
  level: number;
  /** Highest level the governor will go to. Lowered automatically when climbing proves unstable. */
  ceiling: number;

  constructor(ceiling: number, start = ceiling, private readonly now: () => number = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())) {
    this.ceiling = ceiling;
    this.level = Math.min(start, ceiling);
  }

  /** One frame's duration. Returns the new level when it changes, otherwise null. */
  sample(ms: number): number | null {
    if (!(ms > 0) || ms > IGNORE_MS) return null;
    this.samples.push(ms);
    if (this.samples.length < WINDOW) return null;
    const sorted = [...this.samples].sort((a, b) => a - b);
    const median = sorted[sorted.length >> 1]!;
    this.samples = [];
    if (median > SLOW_MS && this.level > 0) {
      // did we just climb and fail? then climbing again would only re-heat the phone: lock the ceiling.
      if (this.now() - this.lastUpAt < LOCK_WINDOW_MS && this.level === this.lastUpFrom + 1) {
        this.ceiling = this.lastUpFrom;
      }
      this.steady = 0;
      this.level -= 1;
      return this.level;
    }
    this.steady = median <= STEADY_MS ? this.steady + 1 : 0;
    if (this.steady >= STEADY_WINDOWS && this.level < this.ceiling) {
      this.steady = 0;
      this.lastUpFrom = this.level;
      this.lastUpAt = this.now();
      this.level += 1;
      return this.level;
    }
    return null;
  }
}
