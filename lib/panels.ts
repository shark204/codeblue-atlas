// lib/panels.ts
import type { LucideIcon } from 'lucide-react';
import {
  Brain,
  HeartPulse,
  GraduationCap,
  BookOpen,
  BookMarked,
  Users2,
  Stethoscope,
  Box,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Panel IDs                                                          */
/* ------------------------------------------------------------------ */

export type PanelId =
  | 'mrcs'
  | 'mrcb'
  | 'undergraduate'
  | 'courses'
  | 'revision'
  | 'study_room'
  | 'usmle'
  | 'atlas';

export const PANEL_IDS: PanelId[] = [
  'mrcs',
  'mrcb',
  'undergraduate',
  'courses',
  'revision',
  'study_room',
  'usmle',
  'atlas',
];

/* ------------------------------------------------------------------ */
/*  Panel kind (grouping by content type)                              */
/* ------------------------------------------------------------------ */

export type PanelKind = 'qbank' | 'courses' | 'revision' | 'study_room' | 'atlas';

export const PANEL_KIND: Record<PanelId, PanelKind> = {
  mrcs:          'qbank',
  mrcb:          'qbank',
  undergraduate: 'qbank',
  usmle:         'qbank',
  courses:       'courses',
  revision:      'revision',
  study_room:    'study_room',
  atlas:         'atlas',
};

export function getPanelKind(id: PanelId): PanelKind {
  return PANEL_KIND[id];
}

/* ------------------------------------------------------------------ */
/*  Panel definition                                                   */
/* ------------------------------------------------------------------ */

export type PanelDef = {
  id: PanelId;
  label: string;
  icon: LucideIcon;
  emoji: string; // kept for backward compatibility
  activeClass: string;
  inactiveClass: string;
};

export const PANELS: PanelDef[] = [
  { id: 'mrcs', label: 'MRCS Bank', icon: Brain, emoji: '🧠', activeClass: 'bg-sky-500 border-sky-500 text-white', inactiveClass: 'bg-slate-800 border-slate-700 text-slate-300 hover:border-sky-500' },
  { id: 'mrcb', label: 'MRCP Bank', icon: HeartPulse, emoji: '💗', activeClass: 'bg-pink-500 border-pink-500 text-white', inactiveClass: 'bg-slate-800 border-slate-700 text-slate-300 hover:border-pink-500' },
  { id: 'undergraduate', label: 'Undergraduate', icon: GraduationCap, emoji: '🎓', activeClass: 'bg-violet-500 border-violet-500 text-white', inactiveClass: 'bg-slate-800 border-slate-700 text-slate-300 hover:border-violet-500' },
  { id: 'courses', label: 'Courses', icon: BookOpen, emoji: '📖', activeClass: 'bg-emerald-500 border-emerald-500 text-white', inactiveClass: 'bg-slate-800 border-slate-700 text-slate-300 hover:border-emerald-500' },
  { id: 'revision', label: 'Code blue Revision', icon: BookMarked, emoji: '📑', activeClass: 'bg-indigo-500 border-indigo-500 text-white', inactiveClass: 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500' },
  { id: 'study_room', label: 'Study Room', icon: Users2, emoji: '👥', activeClass: 'bg-orange-500 border-orange-500 text-white', inactiveClass: 'bg-slate-800 border-slate-700 text-slate-300 hover:border-orange-500' },
  { id: 'atlas', label: '3D Anatomy Atlas', icon: Box, emoji: '🧬', activeClass: 'bg-amber-500 border-amber-500 text-white', inactiveClass: 'bg-slate-800 border-slate-700 text-slate-300 hover:border-amber-500' },
  { id: 'usmle', label: 'USMLE Bank', icon: Stethoscope, emoji: '🩺', activeClass: 'bg-teal-500 border-teal-500 text-white', inactiveClass: 'bg-slate-800 border-slate-700 text-slate-300 hover:border-teal-500' },
];

/* ------------------------------------------------------------------ */
/*  Lookup helpers                                                     */
/* ------------------------------------------------------------------ */

export function getPanelDef(id: PanelId): PanelDef | undefined {
  return PANELS.find(p => p.id === id);
}

/** Returns the DB table name backing a given panel. */
export function getPanelTable(id: PanelId | string): 'questions' | 'undergraduate_questions' {
  return id === 'undergraduate' ? 'undergraduate_questions' : 'questions';
}

/* ------------------------------------------------------------------ */
/*  Type guards                                                        */
/* ------------------------------------------------------------------ */

export function isPanelId(id: string): id is PanelId {
  return (PANEL_IDS as string[]).includes(id);
}

export function isMrcsPanel(id: PanelId | string): boolean          { return id === 'mrcs'; }
export function isMrcbPanel(id: PanelId | string): boolean          { return id === 'mrcb'; }
export function isUndergraduatePanel(id: PanelId | string): boolean { return id === 'undergraduate'; }
export function isCoursesPanel(id: PanelId | string): boolean       { return id === 'courses'; }
export function isRevisionPanel(id: PanelId | string): boolean      { return id === 'revision'; }
export function isStudyRoomPanel(id: PanelId | string): boolean     { return id === 'study_room'; }
export function isUsmlePanel(id: PanelId | string): boolean         { return id === 'usmle'; }