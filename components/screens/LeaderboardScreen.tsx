'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Trophy, Ghost, Loader2, Crown } from 'lucide-react';
import { fetchLeaderboard, fetchMyProfile, updateProfile, type LeaderboardRow } from '../../lib/qbank/leaderboard';
import { useTranslations } from "@/stores/languageStore";

export default function LeaderboardScreen({
  isDark, userId, onBack,
}: { isDark: boolean; userId?: string; onBack: () => void }) {
    const t = useTranslations('components_screens_LeaderboardScreen');
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [ghost, setGhost] = useState(false);
  const [loading, setLoading] = useState(true);
  const card = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const title = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  useEffect(() => {
    Promise.all([fetchLeaderboard(50), userId ? fetchMyProfile(userId) : null]).then(([r, p]) => {
      setRows(r);
      setGhost(p?.ghost_mode ?? false);
      setLoading(false);
    });
  }, [userId]);

  const toggleGhost = async () => {
    if (!userId) return;
    const next = !ghost;
    setGhost(next);
    await updateProfile({ userId, ghost_mode: next });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'}`}>
          <ArrowLeft size={16} />
        </button>
        <h1 className={`text-lg font-black ${title}`}>{t('leaderboard')}</h1>
      </div>

      {userId && (
        <button onClick={toggleGhost} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition ${
          ghost ? 'border-violet-500/50 bg-violet-950/30' : card
        }`}>
          <Ghost size={18} className={ghost ? 'text-violet-400' : muted} />
          <span className={`flex-1 text-start text-xs font-black ${ghost ? 'text-violet-300' : title}`}>
            {ghost ? t('ghost_mode_on') : t('ghost_mode_off')}
          </span>
          <span className={`text-[10px] ${muted}`}>{ghost ? t('hidden') : t('visible')}</span>
        </button>
      )}

      {loading ? (
        <div className="py-20 text-center"><Loader2 size={28} className="animate-spin mx-auto text-amber-500" /></div>
      ) : (
        <div className={`rounded-2xl border-2 overflow-hidden ${card}`}>
          {rows.map((r) => {
            const isMe = r.user_id === userId;
            const medal = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : null;
            return (
              <div key={r.user_id} className={`flex items-center gap-3 px-4 py-3 border-b last:border-0 ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              } ${isMe ? (isDark ? 'bg-sky-500/10' : 'bg-sky-50') : ''}`}>
                <span className={`w-8 text-center text-sm font-black tabular-nums ${medal ? '' : muted}`}>
                  {medal || `#${r.rank}`}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  <Trophy size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-black truncate ${title}`}>
                    {r.public_alias}{isMe && ' (You)'}
                  </p>
                  <p className={`text-[10px] ${muted}`}>{r.total_attempts} attempts · {r.accuracy}% accuracy</p>
                </div>
                {r.rank <= 3 && <Crown size={16} className="text-amber-500 shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}