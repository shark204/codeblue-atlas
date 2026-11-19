'use client';

import { useEffect, useState } from 'react';
// ✅ 3 مستويات فوق، مش 2
import { supabase } from '../../../lib/supabase';

// ═══════════════════════════════════════════════════════════
//  Types
// ═══════════════════════════════════════════════════════════
export type Year4Group = {
  name: string;
  lessons: string[];
};

export type Year4Module = {
  id: number;
  subject: string;
  topic: string;
  subsection: string;
  slug: string;
  displayOrder: number;
  groups: Year4Group[];
  totalLessons: number;
  raw: any;
};

export type Year4ContentState = {
  modules: Year4Module[];
  loading: boolean;
  error: string | null;
  reload: () => void;
};

// ═══════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════

export function toSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function getModuleSlug(subsection: string): string {
  return `year4-${toSlug(subsection)}`;
}

function countLessons(groups: Year4Group[] | undefined): number {
  if (!Array.isArray(groups)) return 0;
  return groups.reduce((sum, g) => sum + (g.lessons?.length || 0), 0);
}

function sortModules(modules: Year4Module[]): Year4Module[] {
  return [...modules].sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
    return a.subsection.localeCompare(b.subsection, 'en', { sensitivity: 'base' });
  });
}

function sortLessons(lessons: string[]): string[] {
  return [...lessons].sort((a, b) => {
    const numA = parseInt(a.match(/^\d+/)?.[0] || '0', 10);
    const numB = parseInt(b.match(/^\d+/)?.[0] || '0', 10);
    if (numA && numB && numA !== numB) return numA - numB;
    return a.localeCompare(b, 'en', { sensitivity: 'base' });
  });
}

function buildModule(row: any): Year4Module {
  const rawGroups: Year4Group[] = row.content_json?.groups || [];
  const groups: Year4Group[] = rawGroups.map((g: any) => ({
    name: g.name || 'Lessons',
    lessons: sortLessons(Array.isArray(g.lessons) ? g.lessons : []),
  }));

  return {
    id: row.id,
    subject: row.subject,
    topic: row.topic,
    subsection: row.subsection,
    slug: getModuleSlug(row.subsection),
    displayOrder: row.display_order ?? 9999,
    groups,
    totalLessons: countLessons(groups),
    raw: row,
  };
}

// ═══════════════════════════════════════════════════════════
//  Cache
// ═══════════════════════════════════════════════════════════
let _cache: Year4Module[] | null = null;
let _cachePromise: Promise<Year4Module[]> | null = null;

async function fetchYear4Modules(): Promise<Year4Module[]> {
  if (_cache) return _cache;
  if (_cachePromise) return _cachePromise;

  _cachePromise = (async () => {
    const { data, error } = await supabase
      .from('summaries')
      .select('*')
      .eq('subject', 'Year 4')
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('subsection', { ascending: true });

    if (error) throw new Error(error.message);

    const modules = (data || []).map(buildModule);
    const sorted = sortModules(modules);

    _cache = sorted;
    _cachePromise = null;
    return sorted;
  })();

  return _cachePromise;
}

export function clearYear4Cache(): void {
  _cache = null;
  _cachePromise = null;
}

// ═══════════════════════════════════════════════════════════
//  Hook
// ═══════════════════════════════════════════════════════════
export function useYear4Content(): Year4ContentState {
  const [modules, setModules] = useState<Year4Module[]>(_cache || []);
  const [loading, setLoading] = useState(!_cache);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    fetchYear4Modules()
      .then((mods) => {
        if (!alive) return;
        setModules(mods);
        setLoading(false);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err.message || 'Failed to load Year 4 content');
        setLoading(false);
      });

    return () => { alive = false; };
  }, [tick]);

  const reload = () => {
    clearYear4Cache();
    setTick((t) => t + 1);
  };

  return { modules, loading, error, reload };
}

// ═══════════════════════════════════════════════════════════
//  Helpers للاستخدام المباشر
// ═══════════════════════════════════════════════════════════

export function findModuleBySlug(
  modules: Year4Module[],
  slug: string,
): Year4Module | undefined {
  return modules.find((m) => m.slug === slug);
}

export function findModuleByName(
  modules: Year4Module[],
  name: string,
): Year4Module | undefined {
  const target = name.trim().toLowerCase();
  return modules.find((m) => m.subsection.trim().toLowerCase() === target);
}

export function getAllLessons(modules: Year4Module[]): { module: string; lesson: string }[] {
  const out: { module: string; lesson: string }[] = [];
  for (const m of modules) {
    for (const g of m.groups) {
      for (const l of g.lessons) {
        out.push({ module: m.subsection, lesson: l });
      }
    }
  }
  return out;
}