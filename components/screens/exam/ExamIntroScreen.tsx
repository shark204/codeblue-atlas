'use client';
import { Rocket } from 'lucide-react';
import { IconTimer } from '../../ui/Icons';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  bank?: 'mrcs' | 'undergraduate';
  onStart: () => void;
};

export default function ExamIntroScreen({ isDark, bank = 'mrcs', onStart }: Props) {
    const t = useTranslations('components_screens_exam_ExamIntroScreen');
  const bankLabel = bank === 'undergraduate' ? 'Undergraduate' : 'MRCS';
  const bankEmoji = bank === 'undergraduate' ? '🎓' : '🩺';
  const accentColor = bank === 'undergraduate' ? 'indigo' : 'purple';

  return (
    <div className={`p-6 lg:p-10 rounded-3xl shadow-xl border space-y-6 transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center gap-3 lg:gap-4">
        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-inner ${
          bank === 'undergraduate'
            ? (isDark ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-100 text-indigo-700')
            : (isDark ? 'bg-purple-900/40 text-purple-400' : 'bg-purple-100 text-purple-700')
        }`}>
          <IconTimer />
        </div>
        <div>
          <h2 className={`text-lg lg:text-2xl font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {bankEmoji} {bankLabel} Timed Mock Exam
          </h2>
          <p className="text-[10px] lg:text-xs text-slate-500 font-semibold">
            {t('simulate_real_examination_conditions')}
                                </p>
        </div>
      </div>

      <div className={`p-4 lg:p-5 rounded-xl lg:rounded-2xl border space-y-2 lg:space-y-3 text-xs lg:text-sm ${
        isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}>
        <div className="flex justify-between font-bold">
          <span>{t('bank')}</span>
          <span className={bank === 'undergraduate' ? 'text-indigo-600 dark:text-indigo-400' : 'text-purple-600 dark:text-purple-400'}>
            {bankEmoji} {bankLabel}
          </span>
        </div>
        <div className="flex justify-between font-bold">
          <span>{t('questions_count')}</span>
          <span className={bank === 'undergraduate' ? 'text-indigo-600 dark:text-indigo-400' : 'text-purple-600 dark:text-purple-400'}>
            {t('60_random_questions')}
                                </span>
        </div>
        <div className="flex justify-between font-bold">
          <span>{t('duration')}</span>
          <span className={bank === 'undergraduate' ? 'text-indigo-600 dark:text-indigo-400' : 'text-purple-600 dark:text-purple-400'}>
            {t('60_minutes')}
                                </span>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onStart}
          className={`w-full py-3.5 lg:py-4 text-white font-black text-sm lg:text-base rounded-xl lg:rounded-2xl shadow-lg transition-transform active:scale-95 ${
            bank === 'undergraduate'
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          Start {bankLabel} Exam Now <Rocket size={14} className="inline ms-1" />
        </button>
      </div>
    </div>
  );
}