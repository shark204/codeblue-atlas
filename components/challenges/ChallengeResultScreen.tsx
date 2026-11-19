'use client';

import { useEffect, useState } from 'react';
import { Trophy, Skull, Users, RotateCcw, Home, Award, Clock, CheckCircle2 } from 'lucide-react';
import type { ChallengeScore } from '../../lib/challenges/types';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  myUserId: string;
  challengerId: string;
  challengerName: string;
  opponentName: string;
  winnerId: string | null;
  challengerScore: ChallengeScore;
  opponentScore: ChallengeScore;
  onRematch: () => void;
  onClose: () => void;
};

export default function ChallengeResultScreen({
  isDark, myUserId, challengerId, challengerName, opponentName,
  winnerId, challengerScore, opponentScore, onRematch, onClose,
}: Props) {
    const t = useTranslations('components_challenges_ChallengeResultScreen');
  const isChallenger = myUserId === challengerId;
  const myScore = isChallenger ? challengerScore : opponentScore;
  const theirScore = isChallenger ? opponentScore : challengerScore;
  const myName = 'أنت';
  const theirName = isChallenger ? opponentName : challengerName;

  const isWinner = winnerId === myUserId;
  const isTie = winnerId === null;

  const myAcc = myScore.total > 0 ? Math.round((myScore.correct / myScore.total) * 100) : 0;
  const theirAcc = theirScore.total > 0 ? Math.round((theirScore.correct / theirScore.total) * 100) : 0;

  const [confetti, setConfetti] = useState<number[]>([]);
  useEffect(() => {
    if (isWinner) setConfetti(Array.from({ length: 40 }, (_, i) => i));
  }, [isWinner]);

  const card = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const title = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  const fmtTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[240] bg-slate-950 overflow-y-auto">
      {/* Confetti */}
      {confetti.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
          {confetti.map((i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${(i * 37) % 100}%`,
                top: '-10px',
                background: ['#f43f5e', '#fbbf24', '#22d3ee', '#34d399', '#a78bfa'][i % 5],
                animation: `fall ${2 + (i % 3)}s linear ${(i % 5) * 0.2}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14 relative z-20">
        {/* ═══ Winner Banner ═══ */}
        <div className="text-center mb-8">
          <div className={`mx-auto w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl mb-5 ${
            isWinner
              ? 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-amber-500/40'
              : isTie
                ? 'bg-gradient-to-br from-slate-500 to-slate-700 shadow-slate-700/40'
                : 'bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-700/40'
          }`}>
            {isWinner ? <Trophy size={48} className="text-white" /> : isTie ? <Users size={48} className="text-white" /> : <Skull size={48} className="text-white" />}
          </div>
          <h1 className={`text-3xl sm:text-4xl font-black mb-2 ${title}`}>
            {isWinner ? '🏆 فوز رائع!' : isTie ? '🤝 تعادل' : '💀 خسارة'}
          </h1>
          <p className={`text-sm ${muted}`}>
            {isWinner
              ? `أحسنت! تغلبت على ${theirName}`
              : isTie
                ? 'الاتنين بنفس النتيجة والدقة'
                : `${theirName} فاز — حاول تاني!`}
          </p>
        </div>

        {/* ═══ Comparison ═══ */}
        <div className={`rounded-3xl border-2 overflow-hidden mb-5 ${card}`}>
          {/* You */}
          <div className={`p-5 sm:p-6 ${isWinner ? (isDark ? 'bg-amber-950/20' : 'bg-amber-50/60') : ''}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-black ${title}`}>{myName}</p>
                <p className={`text-[10px] ${muted}`}>{myScore.correct} / {myScore.total} صحيح</p>
              </div>
              <div className="text-end">
                <p className={`text-3xl font-black tabular-nums ${myAcc >= theirAcc ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {myAcc}%
                </p>
                <div className={`flex items-center gap-1 justify-end mt-0.5 ${muted}`}>
                  <Clock size={10} />
                  <span className="text-[10px] font-bold tabular-nums">{fmtTime(myScore.time_ms)}</span>
                </div>
              </div>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-400" style={{ width: `${myAcc}%` }} />
            </div>
          </div>

          {/* VS divider */}
          <div className={`flex items-center gap-3 px-6 py-2 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <span className={`text-[11px] font-black ${muted}`}>{t('vs')}</span>
            <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </div>

          {/* Them */}
          <div className={`p-5 sm:p-6 ${!isWinner && !isTie ? (isDark ? 'bg-amber-950/20' : 'bg-amber-50/60') : ''}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Award size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-black truncate ${title}`}>{theirName}</p>
                <p className={`text-[10px] ${muted}`}>{theirScore.correct} / {theirScore.total} صحيح</p>
              </div>
              <div className="text-end">
                <p className={`text-3xl font-black tabular-nums ${theirAcc > myAcc ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {theirAcc}%
                </p>
                <div className={`flex items-center gap-1 justify-end mt-0.5 ${muted}`}>
                  <Clock size={10} />
                  <span className="text-[10px] font-bold tabular-nums">{fmtTime(theirScore.time_ms)}</span>
                </div>
              </div>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <div className="h-full bg-gradient-to-r from-rose-500 to-pink-400" style={{ width: `${theirAcc}%` }} />
            </div>
          </div>
        </div>

        {/* ═══ Actions ═══ */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRematch}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-sm shadow-lg shadow-rose-500/30 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} /> مباراة تانية
          </button>
          <button
            onClick={onClose}
            className={`flex-1 py-4 rounded-2xl border-2 font-black text-sm transition active:scale-95 flex items-center justify-center gap-2 ${
              isDark ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Home size={16} /> رجوع للغرفة
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}