'use client';

/**
 * Browser ring-buffer diagnostic log for the Web 3D Anatomy Atlas.
 * Replaces the Tauri desktop invoke calls with browser localStorage + file download.
 */

export interface LogEntry {
  /** Milliseconds since the epoch. */
  at: number;
  level: "info" | "warn" | "error";
  source: string;
  message: string;
}

const LOG_STORAGE_KEY = "anatria3d.log.v1";
const MAX_LOG_ENTRIES = 400;
let memoryBuffer: LogEntry[] = [];

function loadBuffer(): LogEntry[] {
  if (typeof window === "undefined") return memoryBuffer;
  try {
    const raw = window.localStorage.getItem(LOG_STORAGE_KEY);
    if (!raw) return memoryBuffer;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memoryBuffer = parsed;
      return memoryBuffer;
    }
  } catch {
    // Fallback to in-memory buffer
  }
  return memoryBuffer;
}

function saveBuffer(entries: LogEntry[]): void {
  memoryBuffer = entries.slice(-MAX_LOG_ENTRIES);
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(memoryBuffer));
  } catch {
    // Ignore quota errors on diagnostic ring buffer
  }
}

export function logEvent(
  level: LogEntry["level"],
  source: string,
  message: string,
): void {
  try {
    const current = loadBuffer();
    current.push({
      at: Date.now(),
      level,
      source,
      message,
    });
    saveBuffer(current);
  } catch {
    // Never throw from diagnostic logger
  }
}

export async function readLog(): Promise<LogEntry[]> {
  return [...loadBuffer()];
}

export async function logLocation(): Promise<string | null> {
  return "Browser localStorage (anatria3d.log.v1)";
}

export async function clearLog(): Promise<void> {
  memoryBuffer = [];
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(LOG_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}

export async function saveLogCopy(contents: string): Promise<string | null> {
  if (typeof window === "undefined" || typeof document === "undefined") return null;
  try {
    const filename = `codeblue-atlas-log-${new Date().toISOString().slice(0, 10)}.txt`;
    const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return filename;
  } catch {
    return null;
  }
}
