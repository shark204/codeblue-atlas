'use client';
import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cleanLatex } from './parse';

export function MathText({ tex, display = false }: { tex: string; display?: boolean }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, { displayMode: display, throwOnError: true, strict: 'ignore', trust: false });
    } catch {
      return null;
    }
  }, [tex, display]);

  if (!html) return <span>{cleanLatex(tex)}</span>;
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function MathBlock({ tex, isDark }: { tex: string; isDark: boolean }) {
  return (
    <div
      className={`smart-math-block my-4 overflow-x-auto rounded-xl border px-3 py-3 text-center sm:px-4 sm:py-4 ${
        isDark ? 'border-sky-500/30 bg-sky-500/5 text-sky-100' : 'border-sky-200 bg-sky-50 text-slate-800'
      }`}
    >
      <MathText tex={tex} display />
    </div>
  );
}

export function InlineMath({
  parts, bullet, isDark,
}: { parts: { t: 'text' | 'math'; v: string }[]; bullet: boolean; isDark: boolean }) {
  return (
    <p className={`my-2 text-sm leading-7 ${isDark ? 'text-slate-200' : 'text-slate-700'} ${bullet ? 'flex gap-2' : ''}`}>
      {bullet && <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />}
      <span className="min-w-0 break-words">
        {parts.map((p, i) =>
          p.t === 'math' ? (
            <span key={i} className={`smart-inline-math mx-1 inline-block max-w-full overflow-x-auto rounded-md px-2 py-0.5 align-middle ${isDark ? 'bg-sky-500/10' : 'bg-sky-50'}`}>
              <MathText tex={p.v} />
            </span>
          ) : (
            <span key={i}>{p.v}</span>
          ),
        )}
      </span>
    </p>
  );
}