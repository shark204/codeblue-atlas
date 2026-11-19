'use client';
import { useEffect, useState } from 'react';
import { Sparkles, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import {
  fetchCachedExplanation,
  canGenerateAI,
  generateExplanation,
} from '../../lib/ai/api';
import type { AIExplanation, AIStatus } from '../../lib/ai/types';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  questionId: number;
  questionText: string;
  options: Record<string, string>;
  correctAnswer: string;
  category?: string;
  userId?: string;
};

export default function AIExplanationCard({
  isDark, questionId, questionText, options, correctAnswer, category, userId,
}: Props) {
    const t = useTranslations('components_ai_AIExplanationCard');
  const [status, setStatus] = useState<AIStatus>('idle');
  const [content, setContent] = useState<string | null>(null);
  const [cached, setCached] = useState<AIExplanation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const card = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const title = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  useEffect(() => {
    if (!questionId) return;
    setStatus('idle');
    setContent(null);
    setCached(null);
    setError(null);
    fetchCachedExplanation(questionId).then((c) => {
      if (c) {
        setCached(c);
        setContent(c.content);
        setStatus('ready');
      }
    });
  }, [questionId]);

  const handleGenerate = async () => {
    if (!userId) return;
    setError(null);
    setStatus('searching');

    const allowed = await canGenerateAI();
    if (!allowed) {
      setError('Daily AI limit reached (20/day)');
      setStatus('error');
      return;
    }

    setStatus('generating');
    const r = await generateExplanation({
      questionId,
      questionText,
      options,
      correctAnswer,
      category,
    });

    if (!r.ok) {
      setError(r.error || 'Failed');
      setStatus('error');
      return;
    }

    setContent(r.content || '');
    setStatus('ready');
  };

  return (
    <section className={`rounded-2xl border-2 ${card} overflow-hidden`}>
      <header className={`px-5 py-3 border-b-2 border-dashed flex items-center gap-2 ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white">
          <Sparkles size={15} />
        </div>
        <h3 className={`flex-1 text-sm font-black ${title}`}>{t('ai_explanation')}</h3>
        {cached && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
            isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
          }`}>
            {t('cached')}
                                </span>
        )}
      </header>

      <div className="p-4">
        {status === 'idle' && !content && (
          <button
            onClick={handleGenerate}
            disabled={!userId}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-violet-500/30 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles size={14} /> {t('generate_ai_explanation')}
                                </button>
        )}

        {(status === 'searching' || status === 'generating') && (
          <div className={`flex items-center gap-2 p-4 rounded-xl ${
            isDark ? 'bg-slate-800/50' : 'bg-slate-50'
          }`}>
            <Loader2 size={16} className="animate-spin text-violet-500" />
            <span className={`text-xs font-bold ${muted}`}>
              {status === 'searching' ? t('searching_sources') : t('generating')}
            </span>
          </div>
        )}

        {status === 'ready' && content && (
          <>
            <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              {content}
            </div>
            {!cached && (
              <button
                onClick={handleGenerate}
                className={`mt-3 text-[11px] font-bold flex items-center gap-1 ${muted} hover:text-violet-500`}
              >
                <RefreshCw size={11} /> {t('regenerate')}
                                            </button>
            )}
          </>
        )}

        {status === 'error' && (
          <div className={`flex items-start gap-2 p-3 rounded-xl ${
            isDark ? 'bg-rose-950/30 text-rose-300' : 'bg-rose-50 text-rose-700'
          }`}>
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold">{error}</p>
              <button onClick={handleGenerate} className="text-[11px] font-black mt-2 underline">
                {t('try_again')}
                                            </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}