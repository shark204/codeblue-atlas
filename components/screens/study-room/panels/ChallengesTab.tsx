'use client';
import { Share2 } from 'lucide-react';
import WeeklyStatsCard from '../../../challenges/WeeklyStatsCard';
import ChallengesPanel from '../../../challenges/ChallengesPanel';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  currentRoom: any;
  inviteCode: string;
  copied: boolean;
  onCopy: () => void;
  onShare: () => void;
  members: { id: string; name: string; status: string }[];
  userId?: string;
  onChallenge: (opponentId: string, opponentName: string) => void;
};

export default function ChallengesTab({
  isDark, currentRoom, inviteCode, copied, onCopy, onShare, members, userId, onChallenge,
}: Props) {
    const t = useTranslations('components_screens_study_room_panels_ChallengesTab');
  // ✅ fallback عشان نتجنب Type 'string | undefined'
  const safeUserId = userId || '';

  return (
    <div className="space-y-4">
      {/* Invite card */}
      <div className={`rounded-2xl border-2 p-4 ${isDark ? 'border-rose-700/40 bg-gradient-to-br from-rose-950/30 to-pink-950/20' : 'border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50'}`}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-rose-500/40">
            <Share2 size={17} />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className={`text-sm font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('challenge_your_friends')}
                                      </h3>
            <p className={`text-[11px] mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('share_the_room_code_and')}
                                      </p>
          </div>
        </div>

        <div className={`rounded-xl border-2 border-dashed p-4 mb-3 ${isDark ? 'border-rose-700/40 bg-slate-950/60' : 'border-rose-300 bg-white'}`}>
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-center mb-2 ${isDark ? 'text-rose-400/80' : 'text-rose-500/80'}`}>
            {t('room_code')}
                                </p>
          <p className={`text-center font-mono font-black text-3xl tracking-[0.35em] ${isDark ? 'text-rose-300' : 'text-rose-600'}`} dir="ltr">
            {currentRoom?.invite_code || inviteCode}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCopy}
            className={`flex-1 py-2.5 rounded-lg text-xs font-black tracking-wide transition active:scale-95 ${
              isDark
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {copied ? t('copied') : t('copy_code')}
          </button>
          <button
            onClick={onShare}
            className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-black tracking-wide transition active:scale-95 shadow-md shadow-rose-500/30 flex items-center justify-center gap-1.5"
          >
            <Share2 size={13} /> {t('share_link')}
                                </button>
        </div>
      </div>

      <WeeklyStatsCard isDark={isDark} userId={safeUserId} />

      <ChallengesPanel
        isDark={isDark}
        roomId={currentRoom?.id || ''}
        currentUserId={safeUserId}
        members={members as any}
        onChallenge={onChallenge}
      />
    </div>
  );
}
