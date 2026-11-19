import { FileText } from 'lucide-react';
import { useTranslations } from "@/stores/languageStore";

const EMOJI_HEAD = /^[⭐🎯🩺🧠⚡📌🔥💊🔬📋✅❌⚠️📝🧩📐🩸🫀🏠🔁🕸️🔗🚰🎗️🍂🏗️📏🔍🧵🧷🧴🪶➖🔱💪🧱⚙️🛡️📍🧬⛰️🕳️⚧️📈📉🔵🔴🟢🟡🟣🟠🟤⚪⚫🟥🟦🟩🟨🟪🟧🟫⬛⬜]/;

export default function RichText({ text, isDark }: { text: string | null; isDark: boolean }) {
    const t = useTranslations('components_screens_summaries_RichText');
  const safe = (text || '').trim();
  if (!safe) {
    return (
      <div className={`p-6 text-center rounded-xl border-2 border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
        <FileText size={24} className="mx-auto mb-2 opacity-40" />
        <p className="text-xs font-bold">{t('no_content')}</p>
      </div>
    );
  }

  const textCls = isDark ? 'text-slate-300' : 'text-slate-700';
  const headCls = isDark ? 'text-emerald-400' : 'text-emerald-600';

  const render = (line: string, i: number) => {
    const t = line.trim();
    if (!t) return <div key={i} className="h-2" />;

    if (EMOJI_HEAD.test(t)) return <h5 key={i} className={`text-sm font-black mt-3 mb-1.5 ${headCls}`}>{t}</h5>;

    if (/^#{1,3}\s/.test(t)) {
      return (
        <h4 key={i} className={`text-sm font-black mt-3 mb-1 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <span className="w-1.5 h-4 rounded-full bg-emerald-500" />
          {t.replace(/^#+\s*/, '').replace(/\*\*/g, '')}
        </h4>
      );
    }
    if (/^\*\*[^*]+\*\*:?\s*$/.test(t)) {
      return (
        <h5 key={i} className={`text-[12px] font-black uppercase tracking-wider mt-3 mb-1.5 ${headCls}`}>
          {t.replace(/\*\*/g, '').replace(/:$/, '')}
        </h5>
      );
    }
    if (/^[•\-*]\s/.test(t)) {
      const body = t.replace(/^[•\-*]\s*/, '');
      return (
        <li key={i} className={`flex gap-2 text-[13px] leading-relaxed ${textCls}`}>
          <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span dangerouslySetInnerHTML={{ __html: body.replace(/\*\*(.+?)\*\*/g, '<strong class="font-black text-emerald-500">$1</strong>') }} />
        </li>
      );
    }
    if (/^\d+[\.)]\s/.test(t)) {
      const num = t.match(/^\d+/)?.[0];
      return (
        <li key={i} className={`flex gap-2 text-[13px] leading-relaxed ${textCls}`}>
          <span className="text-emerald-500 font-black shrink-0 min-w-[16px]">{num}.</span>
          <span dangerouslySetInnerHTML={{ __html: t.replace(/^\d+[\.)]\s*/, '').replace(/\*\*(.+?)\*\*/g, '<strong class="font-black text-emerald-500">$1</strong>') }} />
        </li>
      );
    }
    return (
      <p key={i} className={`text-[13px] leading-relaxed ${textCls}`}
         dangerouslySetInnerHTML={{ __html: t.replace(/\*\*(.+?)\*\*/g, '<strong class="font-black text-emerald-500">$1</strong>') }} />
    );
  };

  const lines = safe.split('\n');
  const hasBullets = lines.some(l => /^[•\-*]\s|^\d+[\.)]\s/.test(l.trim()));
  return hasBullets
    ? <ul className="space-y-1.5">{lines.map(render)}</ul>
    : <div className="space-y-1.5">{lines.map(render)}</div>;
}
