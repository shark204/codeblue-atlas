'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Trophy, Target, XCircle, MinusCircle, Clock, Zap,
  ChevronRight, RotateCcw, BarChart3, TrendingDown, TrendingUp,
} from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';
import { useProgressStore } from '../../stores/progressStore';
import { useUIStore, type PanelId } from '../../stores/uiStore';
import { computeSessionStats, formatDuration } from '../../lib/qbank/sessionAnalytics';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  onReviewWrong: (wrongIds: number[]) => void;
  onRetakeAll: () => void;
  onClose: () => void;
  startedAt?: number;
};

export default function SessionAnalyticsScreen({
  isDark,
  onReviewWrong,
  onRetakeAll,
  onClose,
  startedAt,
}: Props) {
    const t = useTranslations('components_screens_SessionAnalyticsScreen');
  const currentPanel = useUIStore(s => s.currentPanel) as PanelId;

  const sessionQuestions = useSessionStore(currentPanel, s => s.sessionQuestions);
  const sessionAnswers = useSessionStore(currentPanel, s => s.sessionAnswers);

  // 🕐 Session start time — نحفظه في localStorage لما الجلسة تبدأ
  const [sessionStart] = useState<number>(() => {
    if (startedAt) return startedAt;
    try {
      const saved = localStorage.getItem('cb:session-start');
      if (saved) return parseInt(saved, 10);
    } catch {}
    return Date.now();
  });

  const stats = useMemo(
    () => computeSessionStats({
      questions: sessionQuestions,
      answers: sessionAnswers,
      startedAt: sessionStart,
    }),
    [sessionQuestions, sessionAnswers, sessionStart],
  );

  // 🎨 Colors
  const card = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const title = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  // 🎯 Accuracy color
  const accColor =
    stats.accuracy >= 80 ? 'text-emerald-500' :
    stats.accuracy >= 60 ? 'text-amber-500' :
    'text-rose-500';

  const accGradient =
    stats.accuracy >= 80 ? 'from-emerald-500 to-teal-400' :
    stats.accuracy >= 60 ? 'from-amber-500 to-orange-400' :
    'from-rose-500 to-pink-400';

  return (
    <div className="animate-fade-in w-full max-w-4xl mx-auto space-y-5">
      {/* ═══ Hero ═══ */}
      <div className={`relative overflow-hidden rounded-3xl border-2 ${card}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${accGradient} opacity-[0.08]`} />
        <div className="relative z-10 p-6 sm:p-10 text-center">
          <div className={`mx-auto w-20 h-20 rounded-3xl flex items-center justify-center bg-gradient-to-br ${accGradient} text-white shadow-2xl mb-4`}>
            {stats.accuracy >= 80 ? <Trophy size={40} /> : stats.accuracy >= 60 ? <Target size={40} /> : <TrendingDown size={40} />}
          </div>

          <h2 className={`text-2xl sm:text-3xl font-black mb-1 ${title}`}>
            {t('session_complete')}
                                </h2>
          <p className={`text-sm mb-4 ${muted}`}>
            You answered {stats.answered} of {stats.total} questions
          </p>

          <div className="flex items-baseline justify-center gap-2">
            <span className={`text-5xl sm:text-6xl font-black tabular-nums ${accColor}`}>
              {stats.accuracy}
            </span>
            <span className={`text-2xl font-black ${accColor}`}>%</span>
          </div>
          <p className={`text-xs mt-1 ${muted}`}>
            {stats.correct} correct · {stats.incorrect} wrong
          </p>
        </div>
      </div>

      {/* ═══ Quick Stats ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Target size={18} />}
          label={t('correct')}
          value={stats.correct}
          color="emerald"
          isDark={isDark}
        />
        <StatCard
          icon={<XCircle size={18} />}
          label={t('wrong')}
          value={stats.incorrect}
          color="rose"
          isDark={isDark}
        />
        <StatCard
          icon={<MinusCircle size={18} />}
          label={t('skipped')}
          value={stats.skipped}
          color="slate"
          isDark={isDark}
        />
        <StatCard
          icon={<Clock size={18} />}
          label={t('duration')}
          value={formatDuration(stats.durationMs)}
          color="sky"
          isDark={isDark}
        />
      </div>

      {/* ═══ Time Info ═══ */}
      {stats.answered > 0 && (
        <div className={`rounded-2xl border-2 p-4 flex items-center gap-3 ${card}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-violet-500/15 text-violet-300' : 'bg-violet-50 text-violet-600'}`}>
            <Zap size={18} />
          </div>
          <div className="flex-1">
            <p className={`text-[11px] font-black uppercase tracking-wider ${muted}`}>
              {t('average_time_question')}
                                      </p>
            <p className={`text-lg font-black ${title}`}>
              {formatDuration(stats.avgTimePerQuestion)}
            </p>
          </div>
        </div>
      )}

      {/* ═══ By Category ═══ */}
      {stats.byCategory.length > 0 && (
        <div className={`rounded-2xl border-2 overflow-hidden ${card}`}>
          <div className={`px-5 py-3 border-b-2 border-dashed flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <BarChart3 size={16} className="text-sky-500" />
            <h3 className={`text-sm font-black ${title}`}>{t('by_category')}</h3>
            <span className={`ms-auto text-[10px] font-bold ${muted}`}>
              {stats.byCategory.length} categories
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: isDark ? 'rgba(30,41,59,0.5)' : 'rgba(226,232,240,0.5)' }}>
            {stats.byCategory.map((c) => (
              <div key={c.category} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${title}`}>{c.category}</p>
                  <p className={`text-[10px] ${muted}`}>{c.correct} / {c.total} correct</p>
                </div>
                <div className="w-24 h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-full transition-all duration-700 ${
                      c.accuracy >= 80 ? 'bg-emerald-500' :
                      c.accuracy >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${c.accuracy}%` }}
                  />
                </div>
                <span className={`text-sm font-black tabular-nums w-12 text-end ${
                  c.accuracy >= 80 ? 'text-emerald-500' :
                  c.accuracy >= 60 ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {c.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ By Difficulty ═══ */}
      {stats.byDifficulty.length > 1 && (
        <div className={`rounded-2xl border-2 overflow-hidden ${card}`}>
          <div className={`px-5 py-3 border-b-2 border-dashed flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <TrendingUp size={16} className="text-amber-500" />
            <h3 className={`text-sm font-black ${title}`}>{t('by_difficulty')}</h3>
          </div>
          <div className="divide-y" style={{ borderColor: isDark ? 'rgba(30,41,59,0.5)' : 'rgba(226,232,240,0.5)' }}>
            {stats.byDifficulty.map((d) => (
              <div key={d.difficulty} className="flex items-center gap-3 px-5 py-3">
                <span className={`w-12 text-xs font-black ${muted}`}>
                  {Array.from({ length: d.difficulty }).map((_, i) => '⭐').join('')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] ${muted}`}>{d.correct} / {d.total} correct</p>
                </div>
                <span className={`text-sm font-black tabular-nums ${
                  d.accuracy >= 80 ? 'text-emerald-500' :
                  d.accuracy >= 60 ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {d.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Actions ═══ */}
      <div className="flex flex-col sm:flex-row gap-3">
        {stats.wrongIds.length > 0 && (
          <button
            onClick={() => onReviewWrong(stats.wrongIds)}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm transition-all active:scale-95 shadow-lg"
          >
            <RotateCcw size={16} />
            Review {stats.wrongIds.length} Wrong
          </button>
        )}

        {stats.wrongIds.length > 0 && (
          <button
            onClick={onRetakeAll}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border-2 font-black text-sm transition-all active:scale-95 ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <RotateCcw size={16} />
            {t('retake_session')}
                                </button>
        )}

        <button
          onClick={onClose}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-sm transition-all active:scale-95 shadow-lg"
        >
          {t('done')} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ═══ Sub-component ═══
function StatCard({
  icon, label, value, color, isDark,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: 'emerald' | 'rose' | 'slate' | 'sky';
  isDark: boolean;
}) {
  const bg =
    color === 'emerald' ? isDark ? 'bg-emerald-950/40 border-emerald-800/50' : 'bg-emerald-50 border-emerald-200'
  : color === 'rose'    ? isDark ? 'bg-rose-950/40 border-rose-800/50' : 'bg-rose-50 border-rose-200'
  : color === 'sky'     ? isDark ? 'bg-sky-950/40 border-sky-800/50' : 'bg-sky-50 border-sky-200'
  : isDark              ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200';

  const iconBg =
    color === 'emerald' ? isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-600'
  : color === 'rose'    ? isDark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-600'
  : color === 'sky'     ? isDark ? 'bg-sky-500/20 text-sky-300' : 'bg-sky-100 text-sky-600'
  : isDark              ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500';

  const txt = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`rounded-2xl border-2 p-3.5 ${bg}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${iconBg}`}>
        {icon}
      </div>
      <p className={`text-[10px] font-black uppercase tracking-wider ${muted}`}>
        {label}
      </p>
      <p className={`text-xl font-black tabular-nums ${txt}`}>{value}</p>
    </div>
  );
}