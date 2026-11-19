'use client';

import { useEffect, useState } from 'react';
import { Trophy, Target, TrendingUp, Percent } from 'lucide-react';
import { fetchWeeklyStats } from '../../lib/challenges/api';
import type { WeeklyStats } from '../../lib/challenges/types';
import { useTranslations } from "@/stores/languageStore";

export default function WeeklyStatsCard({
  isDark, userId,
}: { isDark: boolean; userId: string }) {
    const t = useTranslations('components_challenges_WeeklyStatsCard');
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchWeeklyStats(userId).then((s) => { setStats(s); setLoading(false); });
  }, [userId]);

  const card = isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200';
  const title = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  if (loading) {
    return (
      <div className={`rounded-2xl border-2 p-4 ${card}`}>
        <p className={`text-[11px] font-black uppercase tracking-[0.15em] ${muted}`}>{t('this_week')}</p>
        <div className="mt-3 h-16 animate-pulse rounded-lg bg-slate-800/40" />
      </div>
    );
  }

  if (!stats || stats.challenges === 0) {
    return (
      <div className={`rounded-2xl border-2 border-dashed p-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={13} className={muted} />
          <p className={`text-[11px] font-black uppercase tracking-[0.15em] ${muted}`}>{t('this_week')}</p>
        </div>
        <p className={`text-xs font-bold leading-relaxed ${title}`}>
          {t('no_challenges_yet')}
                        </p>
        <p className={`text-[11px] mt-0.5 ${muted}`}>
          {t('start_your_first_challenge')}
                        </p>
      </div>
    );
  }

  const winRate = stats.challenges > 0 ? Math.round((stats.wins / stats.challenges) * 100) : 0;
  const accuracy = stats.total_questions > 0 ? Math.round((stats.total_correct / stats.total_questions) * 100) : 0;

  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${card}`}>
      <div className={`px-4 py-3 border-b border-dashed flex items-center gap-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <TrendingUp size={13} className="text-emerald-500" />
        <p className={`text-[11px] font-black uppercase tracking-[0.15em] ${title}`}>{t('this_week')}</p>
        <span className={`ms-auto text-[10px] font-bold tabular-nums ${muted}`}>{stats.week_key}</span>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        <Stat icon={<Trophy size={14} />}   label={t('wins')}      value={stats.wins}   color="emerald" isDark={isDark} />
        <Stat icon={<Percent size={14} />}  label={t('win_rate')}  value={`${winRate}%`} color="amber"   isDark={isDark} />
        <Stat icon={<Target size={14} />}   label={t('accuracy')}  value={`${accuracy}%`} color="sky"    isDark={isDark} />
        <Stat icon={<TrendingUp size={14} />} label={t('total')}   value={stats.challenges} color="violet" isDark={isDark} />
      </div>
    </div>
  );
}

function Stat({ icon, label, value, color, isDark }: any) {
  const colors: any = {
    emerald: isDark ? 'bg-emerald-950/40 text-emerald-300' : 'bg-emerald-50 text-emerald-600',
    amber:   isDark ? 'bg-amber-950/40 text-amber-300'     : 'bg-amber-50 text-amber-600',
    sky:     isDark ? 'bg-sky-950/40 text-sky-300'         : 'bg-sky-50 text-sky-600',
    violet:  isDark ? 'bg-violet-950/40 text-violet-300'   : 'bg-violet-50 text-violet-600',
  };

  return (
    <div className={`rounded-xl p-2.5 ${colors[color]}`}>
      <div className="flex items-center gap-1 mb-1 opacity-80">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-[0.1em]">{label}</span>
      </div>
      <p className="text-lg font-black tabular-nums leading-none">{value}</p>
    </div>
  );
}