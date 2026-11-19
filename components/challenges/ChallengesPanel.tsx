'use client';

import { useState } from 'react';
import { Swords, Crown, Users, Trophy, TrendingUp } from 'lucide-react';
import { useRoomChallenges } from '../../lib/challenges/useRoomChallenges';
import { useTranslations } from "@/stores/languageStore";

type Member = { id: string; name: string; status: 'focus' | 'idle' | 'break' };

type Props = {
  isDark: boolean;
  roomId: string;
  currentUserId: string;
  members: Member[];
  onChallenge: (opponentId: string, opponentName: string) => void;
};

export default function ChallengesPanel({
  isDark, roomId, currentUserId, members, onChallenge,
}: Props) {
    const t = useTranslations('components_challenges_ChallengesPanel');
  const { challenges, crown } = useRoomChallenges(roomId);
  const [tab, setTab] = useState<'available' | 'active' | 'history'>('available');

  const card = isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200';
  const title = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  const others = members.filter((m) => m.id !== currentUserId);
  const activeOnes = challenges.filter((c) => ['pending', 'ready_wait', 'live'].includes(c.status));
  const historyOnes = challenges.filter((c) => ['completed', 'declined', 'expired', 'forfeited'].includes(c.status));

  return (
    <div className="space-y-4">
      {/* ═══ Crown ═══ */}
      {crown && crown.consecutive_wins >= 2 && (
        <div className={`rounded-2xl border-2 p-4 flex items-center gap-3 ${
          isDark ? 'border-amber-700/60 bg-amber-950/30' : 'border-amber-300 bg-amber-50'
        }`}>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white shadow-lg shrink-0">
            <Crown size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              {t('room_champion')}
                                      </p>
            <p className={`text-sm font-black truncate mt-0.5 ${title}`}>
              {members.find((m) => m.id === crown.holder_id)?.name || 'Unknown'}
            </p>
            <p className={`text-[10px] mt-0.5 ${muted}`}>
              {crown.consecutive_wins} win streak · {crown.total_wins} total
            </p>
          </div>
        </div>
      )}

      {/* ═══ Tabs ═══ */}
      <div className={`flex gap-1 rounded-xl border-2 p-1 ${card}`}>
        {[
          { id: 'available' as const, label: t('available'), count: others.length,       icon: Users },
          { id: 'active'    as const, label: t('live'),      count: activeOnes.length,   icon: Swords },
          { id: 'history'   as const, label: t('history'),   count: historyOnes.length,  icon: TrendingUp },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-black tracking-wide transition ${
                active
                  ? isDark ? 'bg-rose-500/15 text-rose-300' : 'bg-rose-50 text-rose-600'
                  : muted + (isDark ? ' hover:bg-slate-800/40' : ' hover:bg-slate-100')
              }`}
            >
              <Icon size={12} />
              {t.label}
              {t.count > 0 && (
                <span className={`px-1.5 rounded-md text-[9px] tabular-nums ${active ? 'bg-black/20' : isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══ Available ═══ */}
      {tab === 'available' && (
        <div className="space-y-2">
          {others.length === 0 && (
            <Empty icon={Users} title={t('no_one_else_in_the')} subtitle="Invite a friend to start" isDark={isDark} />
          )}
          {others.map((m) => {
            const canChallenge = true;
            return (
              <div key={m.id} className={`rounded-xl border-2 p-3 flex items-center gap-3 ${card}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  m.status === 'focus'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Users size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-black truncate ${title}`}>{m.name}</p>
                  <p className={`text-[10px] mt-0.5 ${muted}`}>
                    {m.status === 'focus' ? t('in_focus') : m.status === 'break' ? '☕ On break' : '⚪ Available'}
                  </p>
                </div>
                <button
                  onClick={() => onChallenge(m.id, m.name)}
                  disabled={!canChallenge}
                  className={`shrink-0 px-3 py-2 rounded-lg text-[11px] font-black tracking-wide transition active:scale-95 ${
                    canChallenge
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md shadow-rose-500/30'
                      : isDark ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Swords size={12} className="inline me-1" />
                  {t('challenge')}
                                        </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Active ═══ */}
      {tab === 'active' && (
        <div className="space-y-2">
          {activeOnes.length === 0 && (
            <Empty icon={Swords} title={t('no_live_challenges')} subtitle="Start a new one" isDark={isDark} />
          )}
          {activeOnes.map((c) => {
            const isMe = c.challenger_id === currentUserId || c.opponent_id === currentUserId;
            const challenger = members.find((m) => m.id === c.challenger_id)?.name || 'Unknown';
            const opponent = members.find((m) => m.id === c.opponent_id)?.name || 'Unknown';
            return (
              <div key={c.id} className={`rounded-xl border-2 p-3 ${card} ${isMe ? 'border-rose-500/40' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    c.status === 'pending'     ? 'bg-amber-500/20 text-amber-400'
                    : c.status === 'ready_wait' ? 'bg-sky-500/20 text-sky-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {c.status === 'pending' ? t('pending') : c.status === 'ready_wait' ? 'Ready check' : 'Live!'}
                  </span>
                  <span className={`text-[10px] font-bold ${muted}`}>{c.rules?.count} questions</span>
                </div>
                <p className={`text-xs font-bold ${title}`}>{challenger} ⚔️ {opponent}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ History ═══ */}
      {tab === 'history' && (
        <div className="space-y-2">
          {historyOnes.length === 0 && (
            <Empty icon={Trophy} title={t('no_challenge_history')} subtitle="Complete your first challenge" isDark={isDark} />
          )}
          {historyOnes.slice(0, 10).map((c) => {
            const challenger = members.find((m) => m.id === c.challenger_id)?.name || 'Unknown';
            const opponent = members.find((m) => m.id === c.opponent_id)?.name || 'Unknown';
            const winnerName = c.winner_id === c.challenger_id ? challenger : c.winner_id === c.opponent_id ? opponent : null;
            const cs = c.challenger_score;
            const os = c.opponent_score;
            return (
              <div key={c.id} className={`rounded-xl border-2 p-3 ${card}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Trophy size={12} className="text-amber-500 shrink-0" />
                  <span className={`text-[11px] font-black truncate ${title}`}>
                    {winnerName ? `🏆 ${winnerName} won` : t('tie')}
                  </span>
                </div>
                <p className={`text-[10px] tabular-nums ${muted}`}>
                  {challenger}: {cs?.correct ?? 0}/{cs?.total ?? 0} · {opponent}: {os?.correct ?? 0}/{os?.total ?? 0}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Empty({ icon: Icon, title, subtitle, isDark }: any) {
  return (
    <div className={`rounded-xl border-2 border-dashed p-6 text-center ${
      isDark ? 'border-slate-800' : 'border-slate-200'
    }`}>
      <Icon size={26} className={`mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
      <p className={`text-xs font-black ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
      <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{subtitle}</p>
    </div>
  );
}