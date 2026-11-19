export const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
};

export const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const getMemberTime = (member: any) => {
  if (!member) return 0;
  let total = member.total_time_seconds || 0;
  if (member.is_studying && member.current_session_start) {
    total += Math.floor((Date.now() - new Date(member.current_session_start).getTime()) / 1000);
  }
  return total;
};

export const getCardColor = (seconds: number, isDark: boolean) => {
  if (seconds === 0) return isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200';
  if (seconds < 30 * 60) return 'bg-amber-900/40 border-amber-700/50';
  if (seconds < 60 * 60) return 'bg-orange-800/50 border-orange-600/50';
  if (seconds < 2 * 60 * 60) return 'bg-orange-700/60 border-orange-500/60';
  return 'bg-rose-800/60 border-rose-600/60';
};

export const statusEmojis = [
  { cat: 'Deep Focus', list: ['🧠', '📚', '🎯', '🤫', '🧘', '📖', '✍️'] },
  { cat: 'High Energy', list: ['🔥', '⚡', '💪', '🚀', '☕', '🍵', '🏃'] },
  { cat: 'On Break', list: ['😴', '🛌', '🎧', '🌙', '🍩', '🥤'] },
  { cat: 'Feeling Good', list: ['😄', '😎', '🤓', '🐱', '🐶', '🦊', '🍕'] },
  { cat: 'Struggling', list: ['😵‍💫', '😭', '🫠', '😤', '🤯', '💀'] },
];
// ═══════════════════════════════════════════════════════════
// ✅ Session countdown — بيتحسب من session_ends_at (مش من interval)
// ═══════════════════════════════════════════════════════════
export const getSessionCountdown = (
  member: any,
  defaultDuration = 1500
): { left: number; total: number; isFinished: boolean; mode: 'focus' | 'break' } => {
  const mode: 'focus' | 'break' = member?.session_mode === 'break' ? 'break' : 'focus';
  const total = defaultDuration;

  if (!member?.is_studying || !member?.session_ends_at) {
    return { left: total, total, isFinished: false, mode };
  }

  const endsAt = new Date(member.session_ends_at).getTime();
  const left = Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
  const isFinished = left <= 0;

  return { left, total, isFinished, mode };
};