'use client';
import { useState } from 'react';

export function MatrixTable({ header, rows, isDark }: { header: string[]; rows: string[][]; isDark: boolean }) {
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [openGroup, setOpenGroup] = useState<number | null>(null);

  const th = isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700';
  const border = isDark ? 'border-slate-800' : 'border-slate-200';

  // 🧩 جمّع الصفوف حسب العمود الأول (فاضي = تابع للصف السابق)
  const groups: { category: string; rows: string[][] }[] = [];
  for (const r of rows) {
    const cat = (r[0] || '').trim();
    if (cat) {
      groups.push({ category: cat, rows: [r] });
    } else if (groups.length) {
      groups[groups.length - 1].rows.push(r);
    } else {
      groups.push({ category: '', rows: [r] });
    }
  }

  return (
    <figure className="my-5">
      {/* ═══════ Desktop: جدول مجمّع بدون فراغات ═══════ */}
      <div className={`hidden overflow-x-auto rounded-2xl border-2 md:block ${border}`}>
        <table className="w-full border-collapse text-start text-[13px] leading-6">
          <thead>
            <tr>
              {header.map((h, c) => (
                <th
                  key={c}
                  onMouseEnter={() => setHoverCol(c)}
                  onMouseLeave={() => setHoverCol(null)}
                  className={`px-3 py-2.5 text-xs font-black ${th} ${c === 0 ? 'sticky start-0 z-10' : ''} ${
                    hoverCol === c ? (isDark ? '!bg-emerald-500/20' : '!bg-emerald-100') : ''
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((grp, gi) => (
              <tr key={gi} className={`border-t ${border} ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-emerald-50/40'}`}>
                {/* العمود الأول — Category */}
                <td
                  onMouseEnter={() => setHoverCol(0)}
                  onMouseLeave={() => setHoverCol(null)}
                  className={`px-3 py-2.5 align-top text-sm font-black ${
                    isDark ? 'bg-slate-900 text-emerald-300' : 'bg-white text-emerald-700'
                  } ${hoverCol === 0 ? (isDark ? 'bg-emerald-500/5' : 'bg-emerald-50') : ''}`}
                >
                  {grp.category}
                </td>

                {/* الأعمدة التانية — دمج الصفوف الفرعية في خلية واحدة */}
                {header.slice(1).map((_, ci) => (
                  <td
                    key={ci}
                    onMouseEnter={() => setHoverCol(ci + 1)}
                    onMouseLeave={() => setHoverCol(null)}
                    className={`px-3 py-2.5 align-top ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    } ${hoverCol === ci + 1 ? (isDark ? 'bg-emerald-500/5' : 'bg-emerald-50') : ''}`}
                  >
                    <div className="space-y-1.5">
                      {grp.rows.map((r, ri) => {
                        const cell = (r[ci + 1] || '').trim();
                        if (!cell) return null;
                        return (
                          <div
                            key={ri}
                            className={
                              ri > 0 && grp.rows[ri - 1]?.[ci + 1]?.trim()
                                ? `pt-1.5 border-t ${isDark ? 'border-slate-800/60' : 'border-slate-200/60'}`
                                : ''
                            }
                          >
                            {cell}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ═══════ Mobile: كروت مجمّعة ═══════ */}
      <div className="space-y-3 md:hidden">
        {groups.map((grp, gi) => {
          const open = openGroup === gi;
          const title = grp.category || grp.rows[0]?.[1] || '—';

          return (
            <div key={gi} className={`overflow-hidden rounded-xl border-2 ${border} ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
              <button
                onClick={() => setOpenGroup(open ? null : gi)}
                aria-expanded={open}
                className={`flex w-full items-center justify-between gap-2 border-s-4 px-3 py-2.5 text-start text-sm font-black ${
                  isDark ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300' : 'border-emerald-500 bg-emerald-50 text-emerald-700'
                }`}
              >
                <span className="leading-snug">{title}</span>
                <span className={`shrink-0 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{open ? '–' : '+'}</span>
              </button>
              {open && (
                <div className={`space-y-3 border-t-2 ${border} px-3 py-3`}>
                  {grp.rows.map((r, ri) => (
                    <div key={ri}>
                      <dl className="space-y-2">
                        {r.slice(1).map((cell, ci) => {
                          if (!cell.trim()) return null;
                          return (
                            <div key={ci}>
                              <dt className={`text-[11px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {header[ci + 1]}
                              </dt>
                              <dd className={`text-sm leading-6 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{cell}</dd>
                            </div>
                          );
                        })}
                      </dl>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </figure>
  );
}