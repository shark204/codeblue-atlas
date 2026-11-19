'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Loader2, X, Zap } from 'lucide-react';
import { setChallengeReady } from '../../lib/challenges/api';
import type { RoomChallenge } from '../../lib/challenges/types';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  challenge: RoomChallenge;
  currentUserId: string;
  challengerName: string;
  opponentName: string;
  onBothReady: () => void;
  onCancel: () => void;
};

export default function ReadyWaitScreen({
  isDark, challenge, currentUserId,
  challengerName, opponentName, onBothReady, onCancel,
}: Props) {
    const t = useTranslations('components_challenges_ReadyWaitScreen');
  const [busy, setBusy] = useState(false);
  const isChallenger = currentUserId === challenge.challenger_id;
  const myReady = isChallenger ? challenge.challenger_ready : challenge.opponent_ready;
  const theirReady = isChallenger ? challenge.opponent_ready : challenge.challenger_ready;
  const theirName = isChallenger ? opponentName : challengerName;

  const handleReady = async () => {
    setBusy(true);
    const r = await setChallengeReady(challenge.id);
    setBusy(false);
    if (r.ok && r.status === 'live') onBothReady();
  };

  const card = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const title = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="fixed inset-0 z-[220] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-3xl border-2 shadow-2xl ${card} animate-fade-in`}>
        <div className="p-6 sm:p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xl">
            <Zap size={28} />
          </div>
          <h2 className={`text-xl font-black mb-1 ${title}`}>الاستعداد</h2>
          <p className={`text-xs ${muted} mb-6`}>
            {t('ready')}
                                </p>

          <div className={`rounded-2xl border-2 border-dashed p-5 mb-5 space-y-3 ${
            isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/60'
          }`}>
            <div className="flex items-center gap-3">
              {myReady ? (
                <CheckCircle2 size={22} className="text-emerald-500 shrink-0" />
              ) : (
                <Circle size={22} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
              )}
              <span className={`text-sm font-black ${title}`}>أنت</span>
              <span className={`ms-auto text-[10px] font-bold uppercase ${myReady ? 'text-emerald-500' : muted}`}>
                {myReady ? 'جاهز ✓' : 'بانتظارك'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {theirReady ? (
                <CheckCircle2 size={22} className="text-emerald-500 shrink-0" />
              ) : (
                <Circle size={22} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
              )}
              <span className={`text-sm font-black truncate ${title}`}>{theirName}</span>
              <span className={`ms-auto text-[10px] font-bold uppercase ${theirReady ? 'text-emerald-500' : muted}`}>
                {theirReady ? 'جاهز ✓' : 'بانتظار'}
              </span>
            </div>
          </div>

          {!myReady ? (
            <button
              onClick={handleReady}
              disabled={busy}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60 text-white font-black text-base shadow-lg shadow-emerald-500/30 transition active:scale-95 flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
              {busy ? 'جاري...' : 'أنا جاهز ⚡'}
            </button>
          ) : (
            <div className={`py-4 rounded-2xl flex items-center justify-center gap-2 ${
              isDark ? 'bg-emerald-950/40 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
            }`}>
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm font-black">بانتظار {theirName}...</span>
            </div>
          )}

          <button
            onClick={onCancel}
            className={`mt-3 w-full py-2.5 rounded-xl text-xs font-bold transition ${
              isDark ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <X size={12} className="inline me-1" /> إلغاء التحدي
          </button>
        </div>
      </div>
    </div>
  );
}