'use client';
import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { TreeItem } from './parse';
import { useTranslations } from "@/stores/languageStore";

type TNode = { text: string; children: TNode[]; id: number };

function build(items: TreeItem[]): TNode[] {
  const roots: TNode[] = [];
  const stack: TNode[] = [];
  items.forEach((it, id) => {
    const node: TNode = { text: it.text, children: [], id };
    while (stack.length > it.depth) stack.pop();
    if (stack.length) stack[stack.length - 1].children.push(node);
    else roots.push(node);
    stack.push(node);
  });
  return roots;
}

function splitLabel(text: string): { name: string; chips: string[] } {
  const colon = text.indexOf(':');
  if (colon > 0 && colon < text.length - 1) {
    const rest = text.slice(colon + 1).trim();
    return { name: text.slice(0, colon).trim(), chips: splitTop(rest) };
  }
  const paren = text.match(/^(.*?)\s*\((.+)\)\s*:?$/);
  if (paren) return { name: paren[1].trim(), chips: splitTop(paren[2]) };
  return { name: text.replace(/:\s*$/, ''), chips: [] };
}

function splitTop(s: string): string[] {
  const out: string[] = [];
  let depth = 0, cur = '';
  for (const ch of s) {
    if ('([{'.includes(ch)) depth++;
    if (')]}'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter(Boolean);
}

const PALETTE = [
  { dot: 'bg-emerald-500', ring: 'border-emerald-500/50', chip: '', chipDark: 'bg-emerald-500/15 text-emerald-300', chipLight: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  { dot: 'bg-sky-500', ring: 'border-sky-500/50', chip: '', chipDark: 'bg-sky-500/15 text-sky-300', chipLight: 'bg-sky-50 text-sky-700 border border-sky-200' },
  { dot: 'bg-violet-500', ring: 'border-violet-500/50', chip: '', chipDark: 'bg-violet-500/15 text-violet-300', chipLight: 'bg-violet-50 text-violet-700 border border-violet-200' },
  { dot: 'bg-amber-500', ring: 'border-amber-500/50', chip: '', chipDark: 'bg-amber-500/15 text-amber-300', chipLight: 'bg-amber-50 text-amber-700 border border-amber-200' },
];

function Branch({ node, depth, isDark, collapsed, toggle }: {
  node: TNode; depth: number; isDark: boolean; collapsed: Set<number>; toggle: (id: number) => void;
}) {
  const pal = PALETTE[Math.min(depth, PALETTE.length - 1)];
  const { name, chips } = splitLabel(node.text);
  const hasKids = node.children.length > 0;
  const closed = collapsed.has(node.id);

  return (
    <li className="relative">
      <div
        className={`flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-xl border px-3 py-2 ${
          hasKids
            ? isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
            : isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        {hasKids ? (
          <button
            onClick={() => toggle(node.id)}
            aria-expanded={!closed}
            aria-label={closed ? 'Expand' : 'Collapse'}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${pal.dot} text-white`}
          >
            <ChevronDown size={13} className={`transition-transform ${closed ? '-rotate-90' : ''}`} />
          </button>
        ) : (
          <span className={`h-2 w-2 shrink-0 rounded-full ${pal.dot}`} />
        )}
        <span className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{name}</span>
        {hasKids && closed && (
          <span className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            +{node.children.length}
          </span>
        )}
        {chips.map((c, i) => (
          <span key={i} className={`rounded-md px-2 py-0.5 text-xs font-semibold ${isDark ? pal.chipDark : pal.chipLight}`}>
            {c}
          </span>
        ))}
      </div>

      {hasKids && !closed && (
        <ul className={`ms-[18px] mt-2 space-y-2 border-s-2 ps-4 ${pal.ring}`}>
          {node.children.map((c) => (
            <Branch key={c.id} node={c} depth={depth + 1} isDark={isDark} collapsed={collapsed} toggle={toggle} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function TreeDiagram({ items, isDark }: { items: TreeItem[]; isDark: boolean }) {
    const t = useTranslations('components_screens_summaries_smart_TreeDiagram');
  const roots = useMemo(() => build(items), [items]);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const parentIds = useMemo(() => {
    const ids: number[] = [];
    const walk = (n: TNode) => { if (n.children.length) { ids.push(n.id); n.children.forEach(walk); } };
    roots.forEach(walk);
    return ids;
  }, [roots]);

  const toggle = (id: number) =>
    setCollapsed((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const allClosed = collapsed.size >= parentIds.length && parentIds.length > 0;

  return (
    <figure className={`my-5 rounded-2xl border-2 p-3 sm:p-4 ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/60'}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {t('classification_tap_a_branch_to')}
                          </span>
        <button
          onClick={() => setCollapsed(allClosed ? new Set() : new Set(parentIds))}
          className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-white'}`}
        >
          {allClosed ? t('expand_all') : t('collapse_all')}
        </button>
      </div>
      <ul className="space-y-2">
        {roots.map((r) => (
          <Branch key={r.id} node={r} depth={0} isDark={isDark} collapsed={collapsed} toggle={toggle} />
        ))}
      </ul>
    </figure>
  );
}