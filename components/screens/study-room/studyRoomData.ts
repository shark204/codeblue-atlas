'use client';
import {
  Waves, Wind, Bug, Droplets,
  type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════ */
/* Types                                                        */
/* ═══════════════════════════════════════════════════════════ */
export type PanelId =
 | 'flashcards' | 'weak' | 'stats' 
  | 'people' | 'challenges' | 'sounds' | 'settings';
export type Mode = 'focus' | 'break';

export type SessionConfig = {
  total: number;
  chunks: number;
  chunkDur: number;
  breakDur: number;
  label: string;
  noBreaks?: boolean;
};

/* ═══════════════════════════════════════════════════════════ */
/* Session configs                                              */
/* ═══════════════════════════════════════════════════════════ */
export const SESSION_CONFIGS: Record<string, SessionConfig> = {
  '25': { total: 25 * 60, chunks: 1,        chunkDur: 25 * 60,  breakDur: 0,      label: '25 min' },
  '50': { total: 50 * 60, chunks: 3,        chunkDur: 1000,     breakDur: 1 * 60, label: '50 min' },
  '90': { total: 90 * 60, chunks: 4,        chunkDur: 1350,     breakDur: 2 * 60, label: '90 min' },
  '-1': { total: -1,      chunks: Infinity, chunkDur: 30 * 60,  breakDur: 5 * 60, label: '∞ Marathon' },
  '-2': { total: -1,      chunks: Infinity, chunkDur: 24 * 60 * 60, breakDur: 0,   label: 'Non-stop', noBreaks: true },
};

export const getConfig = (setting: number): SessionConfig =>
  SESSION_CONFIGS[String(setting)] || SESSION_CONFIGS['25'];

/* ── Custom session (القيمة 0) ── */
export type CustomSession = { focus: number; brk: number; rounds: number };
export const DEFAULT_CUSTOM: CustomSession = { focus: 40, brk: 5, rounds: 3 };
export const buildCustomConfig = (c: CustomSession): SessionConfig => ({
  total: c.focus * c.rounds * 60,
  chunks: c.rounds,
  chunkDur: c.focus * 60,
  breakDur: c.brk * 60,
  label: `${c.focus}/${c.brk} × ${c.rounds}`,
});

export const VALID_FOCUS_VALUES = [25, 50, 90, 0, -1, -2];
export const UNLIMITED_BREAK_COOLDOWN = 30 * 60;

/* ═══════════════════════════════════════════════════════════ */
/* Tabs (مرتبة حسب الأهمية للطالب)                               */
/* ═══════════════════════════════════════════════════════════ */
export const TABS: { id: PanelId; label: string; d: string; tip: string }[] = [
  { id: 'flashcards', label: 'Cards',      d: 'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', tip: "Review your mistakes, flagged questions and notes from the main question bank as flashcards." },
  { id: 'weak',       label: 'Weak',       d: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', tip: "Topics where you have the most unresolved mistakes. Practice each one with a 10-question quiz." },
  { id: 'stats',      label: 'Stats',      d: 'M18 20V10M12 20V4M6 20v-6', tip: "Your focus time today and your current level." },
  { id: 'people',     label: 'People',     d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8', tip: "See who is in the room and how long each person has studied today." },
  { id: 'challenges', label: 'Challenges', d: 'M14.5 17.5 3 6V5a2 2 0 0 1 2-2h1.5L18 15M6 19l4-4M14 10l6-6M9 12H3M13 16h8M18 6l3-3M3 21l3-3', tip: "Challenge someone in this room to a head-to-head question duel." },
  { id: 'sounds',     label: 'Sounds',     d: 'M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14', tip: "Ambient sounds that play only for you. Mix them and set each volume." },
  { id: 'settings',   label: 'Settings',   d: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z', tip: "Choose your session length and breaks, and manage room options." },
];

/* ═══════════════════════════════════════════════════════════ */
/* Sounds                                                       */
/* ═══════════════════════════════════════════════════════════ */
export const SOUNDS: { id: string; label: string; Icon: LucideIcon; url?: string }[] = [
  { id: 'waves',      label: 'Waves',        Icon: Waves },
  { id: 'wind',       label: 'Whisper',      Icon: Wind },
  {
    id: 'crickets',
    label: 'Suzumushi',
    Icon: Bug,
    url: 'https://oxpkwwvltjophnmvlmda.supabase.co/storage/v1/object/public/study-sounds/suzumushi%20(1).mp3',
  },
  {
    id: 'rain-glass',
    label: 'Window Drops',
    Icon: Droplets,
    url: 'https://oxpkwwvltjophnmvlmda.supabase.co/storage/v1/object/public/study-sounds/window-drops%20(1).mp3',
  },
];

/* ═══════════════════════════════════════════════════════════ */
/* Helpers                                                      */
/* ═══════════════════════════════════════════════════════════ */
export const pad = (n: number) => String(n).padStart(2, '0');
export const clock = (s: number) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
export const hm = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
};