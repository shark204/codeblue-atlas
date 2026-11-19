// lib/safeStorage.ts

export const safeGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const safeSet = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};

export const safeRemove = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {}
};

export const safeParseJSON = <T = any>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};