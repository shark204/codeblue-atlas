'use client';

import { useTranslations } from "@/stores/languageStore";

type Props = { raw: string; isDark: boolean };

// ═══ Parse box-flow diagram ═══
function parseBoxFlow(raw: string): string[] {
  const items: string[] = [];
  let buffer: string[] = [];
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t) continue;
    if (/^\+[-─═+]+$/.test(t)) {
      if (buffer.length > 0) { items.push(buffer.join(' ').trim()); buffer = []; }
    } else if (/^\|.*\|$/.test(t)) {
      const text = t.replace(/^\|\s*/, '').replace(/\s*\|$/, '').trim();
      if (text) buffer.push(text);
    }
  }
  if (buffer.length > 0) items.push(buffer.join(' ').trim());
  return items;
}

// ═══ Parse tree diagram ═══
type TreeNode = { text: string; level: number };

function parseTree(raw: string): TreeNode[] {
  const nodes: TreeNode[] = [];
  for (const line of raw.split('\n')) {
    const t = line.trimEnd();
    if (!t.trim()) continue;
    const match = t.match(/^([│\s]*)([├└]──\s+)?(.+)$/);
    if (!match) continue;
    const indent = match[1];
    const hasMarker = !!match[2];
    const text = match[3].trim();
    if (!text) continue;
    const level = hasMarker ? Math.floor(indent.length / 4) + 1 : 0;
    nodes.push({ text, level });
  }
  return nodes;
}

function detectLayout(raw: string): 'boxflow' | 'tree' | 'plain' {
  if (/[├└]──/.test(raw)) return 'tree';
  if (/\+[-─═+]{3,}\+/.test(raw) && /\|.*\|/.test(raw)) return 'boxflow';
  return 'plain';
}

export default function MindMap({ raw, isDark }: Props) {
    const t = useTranslations('components_screens_summaries_MindMap');
  const layout = detectLayout(raw);

  const wrap = `relative overflow-hidden rounded-2xl border-2 ${isDark ? 'border-emerald-500/30 bg-slate-950/50' : 'border-emerald-300 bg-emerald-50/30'}`;
  const label = (
    <div className={`absolute top-3 start-4 z-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      {t('mind_map')}
              </div>
  );

  // ═══ BOX FLOW ═══
  if (layout === 'boxflow') {
    const items = parseBoxFlow(raw);
    if (items.length === 0) return null;
    return (
      <div className={wrap}>
        {label}
        <div className="p-6 pt-10">
          <div className="flex flex-col items-center">
            {items.map((item, i) => (
              <div key={i} className="flex flex-col items-center w-full max-w-xl">
                <div className={`w-full px-5 py-3.5 rounded-2xl border-2 shadow-md text-center text-xs sm:text-sm font-bold ${
                  isDark
                    ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-500/40 text-emerald-100'
                    : 'bg-gradient-to-br from-white to-emerald-50 border-emerald-300 text-emerald-900'
                }`}>
                  {item}
                </div>
                {i < items.length - 1 && (
                  <svg width="20" height="32" viewBox="0 0 20 32" className="text-emerald-500 my-0.5">
                    <path d="M10 0 L10 24" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M5 24 L10 32 L15 24 Z" fill="currentColor" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ═══ TREE ═══
  if (layout === 'tree') {
    const nodes = parseTree(raw);
    if (nodes.length === 0) return null;
    return (
      <div className={wrap}>
        {label}
        <div className="p-5 pt-10 overflow-x-auto">
          <div className="space-y-1.5 min-w-max">
            {nodes.map((node, i) => (
              <div key={i} className="flex items-center gap-2.5" style={{ paddingLeft: node.level * 22 }}>
                {node.level === 0 ? (
                  <span className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm ${
                    isDark ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {node.text}
                  </span>
                ) : (
                  <>
                    <span
                      className={`shrink-0 rounded-full ${isDark ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                      style={{
                        width: node.level === 1 ? 9 : node.level === 2 ? 6 : 4,
                        height: node.level === 1 ? 9 : node.level === 2 ? 6 : 4,
                      }}
                    />
                    <span className={`${
                      node.level === 1
                        ? isDark ? 'text-emerald-100 font-bold text-xs sm:text-sm' : 'text-emerald-800 font-bold text-xs sm:text-sm'
                        : isDark ? 'text-slate-400 text-[11px] sm:text-xs' : 'text-slate-600 text-[11px] sm:text-xs'
                    }`}>
                      {node.text}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ═══ PLAIN fallback ═══
  return (
    <div className={wrap}>
      {label}
      <div className="p-4 pt-10 overflow-x-auto">
        <pre className={`text-[10px] font-mono whitespace-pre min-w-max ${isDark ? 'text-emerald-100' : 'text-emerald-900'}`}>
          {raw}
        </pre>
      </div>
    </div>
  );
}