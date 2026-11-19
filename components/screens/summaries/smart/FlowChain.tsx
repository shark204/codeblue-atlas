'use client';
import { ChevronRight, ChevronDown } from 'lucide-react';

export function FlowChain({ steps, label, isDark }: { steps: string[]; label?: string; isDark: boolean }) {
  return (
    <figure className={`my-5 rounded-2xl border-2 p-3 sm:p-4 ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/60'}`}>
      {label && <p className={`mb-2 text-xs font-black ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{label}</p>}
      <ol className="flex flex-col items-stretch gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-y-2">
        {steps.map((s, i) => (
          <li key={i} className="flex flex-col items-center sm:flex-row">
            <span
              className={`w-full rounded-xl border px-3 py-2 text-center text-[13px] font-bold sm:w-auto ${
                i === 0
                  ? isDark ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200' : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : i === steps.length - 1
                    ? isDark ? 'border-amber-500/50 bg-amber-500/15 text-amber-200' : 'border-amber-300 bg-amber-50 text-amber-800'
                    : isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-white text-slate-800'
              }`}
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <>
                <ChevronRight size={16} className={`mx-1 hidden sm:block ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <ChevronDown size={16} className={`my-0.5 sm:hidden ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              </>
            )}
          </li>
        ))}
      </ol>
    </figure>
  );
}