'use client';
import { Sprout, Flame, Zap, Gem, Trophy, Crown } from 'lucide-react';
import { hm } from '../studyRoomData';
import { useTranslations } from "@/stores/languageStore";

type Member = { id: string; name: string; seconds: number; status: string; me: boolean };

function getTier(totalMin: number) {
  if (totalMin < 10)  return { Icon: Sprout, title: 'Just Getting Started', color: '#34d399', msg: 'The journey begins with a single minute.' };
  if (totalMin < 30)  return { Icon: Flame,  title: 'Warming Up',           color: '#fbbf24', msg: 'Momentum is building. Keep going.' };
  if (totalMin < 60)  return { Icon: Zap,    title: 'In The Zone',          color: '#f97316', msg: "You're on a roll — don't stop now." };
  if (totalMin < 120) return { Icon: Gem,    title: 'Deep Focus',           color: '#22d3ee', msg: 'This is where real progress happens.' };
  if (totalMin < 240) return { Icon: Trophy, title: 'Champion Mode',        color: '#a78bfa', msg: "Elite territory. You're unstoppable." };
  return                { Icon: Crown,  title: 'Legendary',            color: '#f43f5e', msg: 'Legendary focus. Absolute master.' };
}

function nextTier(totalMin: number): number | null {
  if (totalMin < 10) return 10;
  if (totalMin < 30) return 30;
  if (totalMin < 60) return 60;
  if (totalMin < 120) return 120;
  if (totalMin < 240) return 240;
  return null;
}

export default function StatsPanel({
  isDark, mySeconds, sessions, members,
}: { isDark: boolean; mySeconds: number; sessions: number; members: Member[] }) {
    const t = useTranslations('components_screens_study_room_panels_StatsPanel');
  const totalMin = Math.floor(mySeconds / 60);
  const studying = members.filter((p) => p.status === 'focus').length;

  return (
    <div className="sr-stats">
      <div className="sr-kpis">
        <div><b>{hm(mySeconds)}</b><small>{t('today')}</small></div>
        <div><b>{sessions}</b><small>{t('sessions_done')}</small></div>
        <div><b>{studying}</b><small>{t('studying')}</small></div>
      </div>

      {members.length === 0 ? (
        <p className="sr-history-empty">{t('no_one_in_the_room')}</p>
      ) : members.length === 1 ? (
        (() => {
          const tier = getTier(totalMin);
          const TierIcon = tier.Icon;
          const next = nextTier(totalMin);
          return (
            <div className={`relative overflow-hidden rounded-2xl p-6 text-center transition-all duration-500 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
              <div className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-700" style={{ background: `radial-gradient(circle at 50% 0%, ${tier.color} 0%, transparent 70%)` }} />
              <div className="relative z-10">
                <div className="flex justify-center mb-3">
                  <TierIcon size={56} strokeWidth={1.6} style={{ color: tier.color, filter: `drop-shadow(0 0 16px ${tier.color}) drop-shadow(0 0 32px ${tier.color}80)`, animation: 'sr-icon-float 3s ease-in-out infinite' }} />
                </div>
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: tier.color }}>{tier.title}</p>
                <p className="text-5xl font-black mb-1 tabular-nums" style={{ color: tier.color, textShadow: `0 0 24px ${tier.color}60` }}>{hm(mySeconds)}</p>
                <p className={`text-xs italic max-w-[240px] mx-auto mt-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>"{tier.msg}"</p>
                {next && (() => {
                  const pct = Math.min(100, (totalMin / next) * 100);
                  return (
                    <div className="mt-4 max-w-[200px] mx-auto">
                      <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700/50' : 'bg-slate-200'}`}>
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: tier.color, boxShadow: `0 0 8px ${tier.color}` }} />
                      </div>
                      <p className={`text-[10px] mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{next - totalMin}m to next level</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })()
      ) : (
        <div className="sr-bars" role="img" aria-label={t('study_hours')}>
          {members.slice(0, 7).map((p) => {
            const maxS = Math.max(...members.map((x) => x.seconds), 1);
            const pct = Math.max(6, (p.seconds / maxS) * 100);
            return (
              <div key={p.id} className={p.me ? 'today' : ''} title={`${p.name}: ${hm(p.seconds)}`}>
                <span style={{ height: `${pct}%` }} />
                <small>{p.name.slice(0, 3)}</small>
                <em style={{ fontSize: 9, opacity: 0.7, fontStyle: 'normal' }}>{hm(p.seconds)}</em>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
