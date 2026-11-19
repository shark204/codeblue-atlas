'use client';

import { useEffect, useState } from 'react';
import { Swords, X, Check, Clock } from 'lucide-react';
import { acceptChallenge, declineChallenge } from '../../lib/challenges/api';
import type { RoomChallenge } from '../../lib/challenges/types';

type Props = {
  isDark: boolean;
  challenge: RoomChallenge;
  challengerName: string;
  onAccepted: (id: string) => void;
  onDeclined: (id: string) => void;
};

export default function IncomingChallengeToast({
  isDark, challenge, challengerName, onAccepted, onDeclined,
}: Props) {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const deadline = new Date(challenge.accept_deadline).getTime();
    const update = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) onDeclined(challenge.id);
    };
    update();
    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, [challenge.id, challenge.accept_deadline, onDeclined]);

  const accept = async () => {
    setBusy(true);
    const r = await acceptChallenge(challenge.id);
    setBusy(false);
    if (r.ok) onAccepted(challenge.id);
  };

  const decline = async () => {
    setBusy(true);
    await declineChallenge(challenge.id);
    setBusy(false);
    onDeclined(challenge.id);
  };

  const progress = (secondsLeft / 60) * 100;

  return (
    <div className="fixed bottom-6 end-6 z-[250] animate-slide-in-right">
      <div className={`w-[340px] rounded-2xl border-2 shadow-2xl overflow-hidden ${
        isDark ? 'bg-slate-900 border-rose-700/60' : 'bg-white border-rose-400'
      }`}>
        {/* Progress bar */}
        <div className={`h-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shrink-0">
              <Swords size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                ⚔️ تحدي من {challengerName}
              </p>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>
                {challenge.rules?.count ?? 10} أسئلة · {challenge.rules?.mode ?? 'adaptive'}
              </p>
            </div>
            <div className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg ${
              secondsLeft <= 15
                ? 'bg-rose-500/20 text-rose-400'
                : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
            }`}>
              <Clock size={11} />
              <span className="text-[10px] font-black tabular-nums">{secondsLeft}s</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={decline}
              disabled={busy}
              className={`flex-1 py-2.5 rounded-lg text-xs font-black transition active:scale-95 ${
                isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <X size={12} className="inline me-1" /> رفض
            </button>
            <button
              onClick={accept}
              disabled={busy}
              className="flex-[1.4] py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-black transition active:scale-95 shadow-md shadow-rose-500/30"
            >
              <Check size={12} className="inline me-1" /> قبول
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}