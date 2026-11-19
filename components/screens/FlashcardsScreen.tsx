'use client';
import { ChevronLeft, ChevronRight, Zap, Lightbulb, Paperclip } from 'lucide-react';
import { getCorrectLetter } from '../../lib/helpers';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  flashcardsList: any[];
  fcIndex: number;
  setFcIndex: (i: number | ((p: number) => number)) => void;
  fcFlipped: boolean;
  setFcFlipped: (b: boolean) => void;
  onBack: () => void;
};

export default function FlashcardsScreen({
  isDark, flashcardsList, fcIndex, setFcIndex, fcFlipped, setFcFlipped, onBack,
}: Props) {
    const t = useTranslations('components_screens_FlashcardsScreen');
  const q = flashcardsList[fcIndex];
  const correctLetter = getCorrectLetter(q?.Correct_Answer);
  const correctText =
    correctLetter === 'A' ? q?.Option_A :
    correctLetter === 'B' ? q?.Option_B :
    correctLetter === 'C' ? q?.Option_C :
    correctLetter === 'D' ? q?.Option_D : q?.Option_E;

  return (
    <div className="w-full animate-fade-in max-w-2xl mx-auto space-y-6 py-4">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm border transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-sky-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-blue-600 hover:bg-blue-50'}`}>
          <ChevronLeft size={14} className="inline" /> {t('back_to_dashboard')}
                          </button>
        {flashcardsList.length > 0 && (
          <span className="text-xs font-bold text-slate-400">Card {fcIndex + 1} of {flashcardsList.length}</span>
        )}
      </div>

      {flashcardsList.length === 0 ? (
        <div className={`p-10 text-center rounded-3xl border border-dashed ${isDark ? 'border-slate-700 bg-slate-900/50 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'}`}>
          <Zap size={48} className="mx-auto mb-4 text-teal-500" />
          <p className="text-lg font-black mb-2">{t('no_flashcards_available_yet')}</p>
          <p className="text-sm">{t('import_questions_first_to_start')}</p>
        </div>
      ) : (
        <>
          <div
            onClick={() => setFcFlipped(!fcFlipped)}
            className={`w-full min-h-[380px] p-6 sm:p-10 rounded-3xl border shadow-2xl cursor-pointer flex flex-col justify-between transition-all transform duration-300 select-none relative ${isDark ? 'bg-slate-900 border-slate-800 hover:border-sky-500 shadow-black/50' : 'bg-white border-slate-200 hover:border-blue-400 shadow-slate-200/50'}`}
          >
            <div className="flex justify-between items-center">
              <span className={`text-xs px-3 py-1 rounded-full font-bold border ${isDark ? 'bg-sky-950/80 text-sky-300 border-sky-800' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                {q?.Theme_Category}
              </span>
              <span className="text-xs font-bold text-amber-500">
                <Lightbulb size={12} className="inline me-1" /> {t('click_card_to_flip')}
                                                </span>
            </div>

            <div className="my-auto text-center py-6">
              {!fcFlipped ? (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-sky-500 mb-3">{t('question')}</h3>
                  {q?.source_file && (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold mb-3 ${isDark ? 'bg-slate-800/80 text-slate-400 border border-slate-700' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                      <Paperclip size={10} />
                      <span className="truncate max-w-[180px]">المصدر: {q.source_file}</span>
                    </div>
                  )}
                  <p className={`text-base sm:text-xl font-bold leading-relaxed ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {q?.Question_Text}
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">{t('correct_answer')}</h3>
                  <p className="text-lg sm:text-2xl font-black text-emerald-500 mb-6 px-4">{correctText}</p>
                  <div className={`p-4 rounded-xl text-xs sm:text-sm text-start border ${isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <span className="font-bold block mb-1 text-sky-400">{t('explanation')}</span>
                    {q?.Explanation}
                  </div>
                </div>
              )}
            </div>

            <div className="text-center text-[11px] font-bold text-slate-500">
              {!fcFlipped ? t('tap_to_reveal_correct_answer') : t('tap_to_go_back_to')}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              disabled={fcIndex === 0}
              onClick={() => { setFcIndex(i => i - 1); setFcFlipped(false); }}
              className={`flex-1 py-3.5 font-bold text-sm rounded-2xl shadow-sm transition-all disabled:opacity-30 ${isDark ? 'bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-800' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
              <ChevronLeft size={14} className="inline" /> {t('previous_card')}
                                          </button>
            <button
              disabled={fcIndex === flashcardsList.length - 1}
              onClick={() => { setFcIndex(i => i + 1); setFcFlipped(false); }}
              className="flex-1 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-sm rounded-2xl shadow-lg transition-transform active:scale-95"
            >
              {t('next_card')} <ChevronRight size={14} className="inline" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}