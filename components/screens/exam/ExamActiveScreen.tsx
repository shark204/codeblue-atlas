'use client';
import { Flag, Paperclip, LogOut } from 'lucide-react';
import { useExamStore } from '../../../stores/examStore';
import { useUIStore } from '../../../stores/uiStore';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  onOptionClick: (qId: number, letter: string) => void;
  onToggleFlag: (qId: number) => void;
  onSubmit: () => void;
  onExit: () => void;
};

export default function ExamActiveScreen({ isDark, onOptionClick, onToggleFlag, onSubmit, onExit }: Props) {
    const t = useTranslations('components_screens_exam_ExamActiveScreen');
  const currentPanel = useUIStore(s => s.currentPanel);

  const examQuestions = useExamStore(currentPanel, s => s.examQuestions);
  const currentExamIndex = useExamStore(currentPanel, s => s.currentExamIndex);
  const setCurrentExamIndex = useExamStore(currentPanel, s => s.setCurrentExamIndex);
  const examAnswers = useExamStore(currentPanel, s => s.examAnswers);
  const examReviewFlags = useExamStore(currentPanel, s => s.examReviewFlags);
  const timeLeft = useExamStore(currentPanel, s => s.timeLeft);

  if (!examQuestions || examQuestions.length === 0) return null;

  const safeIndex = Math.min(
    Math.max(0, Number(currentExamIndex) || 0),
    examQuestions.length - 1
  );
  const currentQ = examQuestions[safeIndex];

  if (!currentQ || currentQ.id === undefined || currentQ.id === null) return null;

  if (safeIndex !== currentExamIndex) {
    setCurrentExamIndex(safeIndex);
  }

  const safeFlags: number[] = Array.isArray(examReviewFlags) ? examReviewFlags : [];
  const safeAnswers: Record<number, string> = (examAnswers && typeof examAnswers === 'object') ? examAnswers : {};

  return (
    <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 animate-fade-in w-full items-start">
      <div className={`flex-1 min-w-0 p-4 lg:p-9 rounded-2xl lg:rounded-3xl shadow-xl border flex flex-col justify-between ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div>
          <div className={`flex justify-between items-center mb-4 lg:mb-6 p-3 lg:p-4 rounded-xl lg:rounded-2xl border gap-2 ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            <span className="font-black text-[10px] lg:text-sm whitespace-nowrap">
              Q {safeIndex + 1} / {examQuestions.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleFlag(currentQ.id)}
                className={`px-2.5 py-1 lg:px-4 lg:py-1.5 rounded-lg text-[9px] lg:text-xs font-bold transition-all border shadow-sm ${
                  safeFlags.includes(currentQ.id)
                    ? (isDark ? 'bg-amber-900/50 border-amber-500 text-amber-400' : 'bg-amber-100 border-amber-500 text-amber-700')
                    : (isDark ? 'bg-slate-800 border-slate-600 hover:bg-slate-700' : 'bg-white border-slate-300 hover:bg-slate-100')
                }`}
              >
                <Flag size={12} className="inline me-1" />
                {safeFlags.includes(currentQ.id) ? t('marked') : t('mark')}
              </button>
              <button
                type="button"
                onClick={onExit}
                className={`px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-lg text-[9px] lg:text-xs font-bold transition-all border shadow-sm ${
                  isDark ? 'bg-rose-950 border-rose-800 text-rose-300 hover:bg-rose-900' : 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                }`}
                title={t('exit_exam_progress_is_saved')}
              >
                <LogOut size={12} className="inline me-1" />
                {t('exit')}
                                            </button>
            </div>
          </div>

          {/* ✅ المصدر — يظهر في الموك فقط */}
          {currentQ.source_file && (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold mb-3 ${
              isDark ? 'bg-slate-800/80 text-slate-400 border border-slate-700' : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              <Paperclip size={10} />
              <span className="truncate max-w-[240px]">Source: {currentQ.source_file}</span>
            </div>
          )}

          <p className={`text-sm sm:text-base lg:text-xl font-bold mb-4 lg:mb-6 leading-relaxed ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {currentQ.Question_Text}
          </p>

          <div className="space-y-2.5 lg:space-y-3">
            {[
              { letter: 'A', text: currentQ.Option_A },
              { letter: 'B', text: currentQ.Option_B },
              { letter: 'C', text: currentQ.Option_C },
              { letter: 'D', text: currentQ.Option_D },
              { letter: 'E', text: currentQ.Option_E },
            ].filter(o => Boolean(o.text)).map((opt) => {
              const isSelected = safeAnswers[currentQ.id] === opt.letter;
              const buttonStyle = isSelected
                ? (isDark ? 'bg-purple-900/80 border-purple-500 text-purple-100 ring-2 ring-purple-500 font-black' : 'bg-purple-100 border-purple-600 text-purple-900 ring-2 ring-purple-500 font-black')
                : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50');
              return (
                <button
                  key={opt.letter}
                  type="button"
                  onClick={() => onOptionClick(currentQ.id, opt.letter)}
                  className={`w-full text-start p-3 lg:p-4 rounded-xl lg:rounded-2xl border transition-all text-xs lg:text-sm shadow-sm flex items-center gap-3 ${buttonStyle}`}
                >
                  <span className={`w-6 h-6 lg:w-7 lg:h-7 rounded-lg border flex items-center justify-center text-[10px] lg:text-xs font-bold shrink-0 ${
                    isSelected
                      ? (isDark ? 'bg-purple-800 border-purple-400' : 'bg-purple-600 border-purple-700 text-white')
                      : (isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200')
                  }`}>{opt.letter}</span>
                  <span className="leading-snug flex-1">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between mt-8 lg:mt-10 pt-4 lg:pt-6 border-t dark:border-slate-800">
          <button
            type="button"
            disabled={safeIndex === 0}
            onClick={() => setCurrentExamIndex(safeIndex - 1)}
            className={`px-4 lg:px-6 py-2.5 lg:py-3 font-bold text-xs lg:text-sm rounded-lg lg:rounded-xl disabled:opacity-40 transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            {t('prev')}
                                </button>
          <button
            type="button"
            disabled={safeIndex === examQuestions.length - 1}
            onClick={() => setCurrentExamIndex(safeIndex + 1)}
            className={`px-4 lg:px-6 py-2.5 lg:py-3 font-bold text-xs lg:text-sm rounded-lg lg:rounded-xl disabled:opacity-40 transition-all ${isDark ? 'bg-purple-900 text-purple-200 hover:bg-purple-800' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
          >
            {t('next')}
                                </button>
        </div>
      </div>

      <div className={`w-[85px] shrink-0 lg:w-72 p-2 lg:p-6 rounded-2xl lg:rounded-3xl shadow-xl border flex flex-col sticky top-4 lg:static ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className={`flex flex-col items-center justify-center p-2 lg:p-4 rounded-xl lg:rounded-2xl mb-4 lg:mb-6 shadow-inner ${
          timeLeft < 300 ? 'bg-rose-100 text-rose-700 border-2 border-rose-500 animate-pulse' : (isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-50 text-slate-800')
        }`}>
          <span className="text-[8px] lg:text-xs font-bold uppercase tracking-widest mb-0.5 lg:mb-1 opacity-70">{t('time')}</span>
          <span className="text-sm lg:text-3xl font-black font-mono">
            {Math.floor((timeLeft || 0) / 60)}:{((timeLeft || 0) % 60).toString().padStart(2, '0')}
          </span>
        </div>

        <h3 className="hidden lg:block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">{t('navigator')}</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-1 lg:gap-2 mb-4 lg:mb-6 overflow-y-auto max-h-[50vh] lg:max-h-none pe-1 custom-scrollbar">
          {examQuestions.map((q, idx) => {
            const isAnswered = q?.id !== undefined && !!safeAnswers[q.id];
            const isMarked = q?.id !== undefined && safeFlags.includes(q.id);
            const isCurrent = safeIndex === idx;
            let bgStyle = isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200';
            if (isCurrent) bgStyle = 'bg-sky-600 text-white border-sky-700 ring-1 lg:ring-2 ring-sky-300 font-bold transform scale-110';
            else if (isMarked) bgStyle = isDark ? 'bg-amber-600 text-white border-amber-700 font-bold' : 'bg-amber-500 text-white border-amber-600 font-bold';
            else if (isAnswered) bgStyle = isDark ? 'bg-slate-600 text-white border-slate-500' : 'bg-slate-400 text-white border-slate-500';
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentExamIndex(idx)}
                className={`w-full aspect-square rounded-md lg:rounded-lg border flex items-center justify-center text-[10px] lg:text-xs transition-all shadow-sm ${bgStyle}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-3 lg:pt-4 border-t dark:border-slate-800">
          <button
            type="button"
            onClick={onSubmit}
            className="w-full mt-2 lg:mt-4 py-2 lg:py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] lg:text-sm rounded-lg lg:rounded-xl shadow-md transition-transform active:scale-95"
          >
            {t('submit')}
                                </button>
        </div>
      </div>
    </div>
  );
}