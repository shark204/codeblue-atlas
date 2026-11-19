'use client';
import { useState, useEffect } from 'react';
import { Lightbulb, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  panelId: string;
};

const TOTAL_CASES = 350;

export default function MrcsCases({ isDark, panelId }: Props) {
    const t = useTranslations('components_engagement_MrcsCases');
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [caseNumber, setCaseNumber] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCase = async () => {
      setIsLoading(true);

      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - start.getTime();
      const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

      const caseIndex = ((dayOfYear - 1) % TOTAL_CASES) + 1;
      setCaseNumber(caseIndex);

      const { data } = await supabase
        .from('mrcs_cases')
        .select('*')
        .eq('case_index', caseIndex)
        .maybeSingle();

      if (data) setItem(data);
      setIsLoading(false);
    };

    fetchCase();
  }, []);

  const handleCopy = () => {
    if (!item?.case_text) return;
    navigator.clipboard.writeText(item.case_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className={`relative overflow-hidden p-6 rounded-3xl border shadow-sm transition-all hover:shadow-lg ${
      isDark
        ? 'bg-gradient-to-br from-emerald-950/40 to-teal-950/20 border-emerald-800/40'
        : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
    }`}>
      <div className="relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md bg-gradient-to-br from-emerald-500 to-teal-600">
              <Lightbulb size={24} className="text-white" />
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                <Sparkles size={10} />
                {t('mrcs_fact_of_the_day')}
                                            </p>
              <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('did_you_know')}
                                            </p>
            </div>
          </div>

          <div className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
            isDark
              ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800'
              : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
          }`}>
            #{caseNumber} / {TOTAL_CASES}
          </div>
        </div>

        {/* Fact (one box only) */}
        <div className={`p-5 rounded-2xl border mb-4 ${
          isDark
            ? 'bg-slate-900/60 border-emerald-900/40'
            : 'bg-white/80 border-emerald-100'
        }`}>
          <p className={`text-base font-bold leading-relaxed ${
            isDark ? 'text-slate-100' : 'text-slate-800'
          }`}>
            "{item.case_text}"
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3">
          <div className={`flex items-center gap-1.5 text-[10px] font-bold ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <Sparkles size={12} />
            {t('a_new_fact_every_day')}
                                </div>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
              copied
                ? 'bg-emerald-500 text-white'
                : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {copied ? <><Check size={12} /> {t('copied')}</> : <><Copy size={12} /> {t('copy')}</>}
          </button>
        </div>

      </div>
    </div>
  );
}