'use client';
import { useEffect, useState } from 'react';
import { Eye, Lightbulb, Target } from 'lucide-react';
import { toRecallCard } from './parse';
import { useTranslations } from "@/stores/languageStore";

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return String(h);
}

export function PearlCards({
  items, variant, title, isDark, recall,
}: { items: string[]; variant: 'pearls' | 'remember'; title: string; isDark: boolean; recall: boolean }) {
    const t = useTranslations('components_screens_summaries_smart_PearlCards');
  const [shown, setShown] = useState<Set<number>>(new Set());
  const isRemember = variant === 'remember';
  const Icon = isRemember ? Target : Lightbulb;

  useEffect(() => { if (!recall) setShown(new Set()); }, [recall]);

  const accent = isRemember
    ? isDark ? 'border-amber-500/50 bg-amber-500/5' : 'border-amber-300 bg-amber-50/70'
    : isDark ? 'border-violet-500/40 bg-violet-500/5' : 'border-violet-200 bg-violet-50/60';
  const iconBox = isRemember ? 'bg-amber-500 text-white' : 'bg-violet-500 text-white';

  return (
    <section className={`my-6 rounded-2xl border-2 p-3 sm:p-4 ${accent}`}>
      <header className="mb-3 flex items-center gap-2.5">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBox}`}><Icon size={16} /></span>
        {title && <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>}
        {recall && <span className={`ms-auto text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('tap_a_card_to_reveal')}</span>}
      </header>

      <ul className="space-y-2">
        {items.map((text, i) => {
          const card = recall ? toRecallCard(text) : null;
          const revealed = shown.has(i);
          return (
            <li
              key={i}
              className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 ${isDark ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-white'}`}
            >
              <div className="min-w-0 flex-1 text-sm leading-6">
                {card ? (
                  <button
                    onClick={() => setShown((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                    className="w-full text-start"
                    aria-expanded={revealed}
                  >
                    <span className={isDark ? 'text-slate-100' : 'text-slate-800'}>{card.prompt} </span>
                    {revealed ? (
                      <span className={`rounded px-1 font-bold ${isDark ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-100 text-emerald-800'}`}>{card.answer}</span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 rounded px-2 text-xs font-bold ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                        <Eye size={12} /> ?
                      </span>
                    )}
                  </button>
                ) : (
                  <span className={isDark ? 'text-slate-100' : 'text-slate-800'}>{text}</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}