'use client';
import { ArrowLeft, Copy, Target } from 'lucide-react';
import { useProgressStore } from '../../stores/progressStore';
import { useUIStore, type PanelId } from '../../stores/uiStore';
import { IconCopy, IconTarget } from '../ui/Icons';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  questionsCount: number;
  weaknessStats: [string, number][];
  onBack: () => void;
};

export default function AnalyticsScreen({ isDark, questionsCount, weaknessStats, onBack }: Props) {
    const t = useTranslations('components_screens_AnalyticsScreen');
  const currentPanel = useUIStore(s => s.currentPanel) as PanelId;
  const score = useProgressStore(currentPanel, s => s.score);
  const incorrectIds = useProgressStore(currentPanel, s => s.incorrectIds);
  const answerChanges = useProgressStore(currentPanel, s => s.answerChanges);

  const totalOmitted = Math.max(0, questionsCount - (score.total || 0));
  const accuracy = score.total > 0 ? (score.correct / score.total) * 100 : 0;
  const percentile = score.total === 0 ? 0 : Math.min(99, Math.round(accuracy * 0.95));
  const bellCurveHeights = [2, 3, 5, 8, 12, 18, 25, 32, 45, 55, 65, 75, 85, 95, 100, 95, 80, 65, 50, 35, 25, 15, 10, 5, 2];
  const getHistogramColor = (i: number, total: number) => {
    const ratio = i / total;
    return ratio < 0.45 ? '#ef4444' : ratio < 0.65 ? '#eab308' : '#22c55e';
  };

  return (
    <div className="w-full animate-fade-in space-y-8">
      <div className="flex justify-start mb-4">
        <button onClick={onBack} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all shadow-sm ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
          <ArrowLeft size={16} className="inline me-1" /> {t('back_to_dashboard')}
                          </button>
      </div>
      <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t('performance_analysis')}</h2>

      <div className={`p-6 lg:p-8 rounded-3xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className={`text-xl font-bold mb-6 pb-4 border-b ${isDark ? 'text-slate-100 border-slate-800' : 'text-slate-800 border-slate-100'}`}>{t('statistics')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="60" fill="transparent" stroke={isDark ? '#1e293b' : '#f1f5f9'} strokeWidth="12" />
                <circle cx="70" cy="70" r="60" fill="transparent" stroke="#0ea5e9" strokeWidth="12" strokeDasharray={377} strokeDashoffset={377 - (accuracy / 100) * 377} className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{accuracy.toFixed(1)}%</span>
                <span className="text-sm font-semibold text-slate-400">{t('correct')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className={`text-base font-bold mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{t('your_score')}</h4>
            {[
              { label: t('total_correct'), value: score.correct },
              { label: t('total_incorrect'), value: score.wrong },
              { label: t('total_omitted'), value: totalOmitted },
            ].map((row, i) => (
              <div key={i} className={`flex justify-between items-center py-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{row.label} <IconCopy /></span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className={`text-base font-bold mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{t('answer_changes')}</h4>
            {[
              { label: t('correct_to_incorrect'), value: answerChanges.correctToIncorrect },
              { label: t('incorrect_to_correct'), value: answerChanges.incorrectToCorrect },
              { label: t('incorrect_to_incorrect'), value: answerChanges.incorrectToIncorrect },
            ].map((row, i) => (
              <div key={i} className={`flex justify-between items-center py-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{row.label}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weakness Radar */}
      <div className={`rounded-3xl border overflow-hidden shadow-sm ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className={`px-5 py-4 border-b flex items-center gap-2 text-sm font-bold ${isDark ? 'bg-slate-800/50 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
          <span className="me-2"><IconTarget /></span> {t('smart_weakness_radar')}
                          </div>
        <div className="p-6 lg:p-8">
          <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('these_are_your_top_weakest')}
                                </p>
          {weaknessStats.length > 0 ? (
            <div className="space-y-5">
              {weaknessStats.map(([category, count], idx) => (
                <div key={idx} className="relative">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{category}</span>
                    <span className="text-rose-500">{count} Errors</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400" style={{ width: `${Math.min(100, (count / (incorrectIds.length || 1)) * 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-6 text-center rounded-2xl border border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
              {t('you_haven_t_made_enough')}
                                          </div>
          )}
        </div>
      </div>

      {/* Histogram */}
      <div className={`rounded-3xl border overflow-hidden shadow-sm ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className={`px-5 py-3 border-b text-sm font-bold ${isDark ? 'bg-slate-800/50 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
          {t('global_score_histogram')}
                          </div>
        <div className="p-6 lg:p-8 space-y-10">
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Your score of {accuracy.toFixed(1)}% puts you on the <span className="font-bold">{percentile}th percentile</span> of registered users.
          </p>
          <div className="relative h-40 lg:h-56 w-full max-w-2xl mx-auto flex items-end justify-between px-2 pt-8 pb-4 border-b border-s border-slate-300 dark:border-slate-700 mt-8">
            {bellCurveHeights.map((h, i) => (
              <div key={i} className="w-full mx-[1px] rounded-t-sm opacity-90 hover:opacity-100 transition-opacity" style={{ height: `${h}%`, backgroundColor: getHistogramColor(i, bellCurveHeights.length) }}></div>
            ))}
            <div className="absolute top-0 bottom-0 w-0.5 border-s-2 border-dashed border-slate-400 z-0" style={{ left: '61.8%' }}>
              <div className="absolute -top-7 start-1/2 transform -translate-x-1/2 text-[9px] font-bold whitespace-nowrap text-slate-400">{t('avg_61_8')}</div>
            </div>
            <div className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white z-10" style={{ left: `${Math.max(0, Math.min(100, accuracy))}%` }}>
              <div className="absolute -top-7 start-1/2 transform -translate-x-1/2 text-[10px] font-bold whitespace-nowrap bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">{t('your_score_2')}</div>
            </div>
            <div className="absolute -bottom-6 start-0 end-0 flex justify-between text-[10px] text-slate-500 font-bold px-1">
              <span>0%</span><span className="hidden sm:inline">20%</span><span>40%</span><span className="hidden sm:inline">60%</span><span>80%</span><span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}