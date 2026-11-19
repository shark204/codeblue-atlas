'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  BookOpen, BookMarked, Library, CheckCircle, CheckCheck, Award,
  Target, Crosshair, Zap, Flame, Calendar, CalendarDays, Trophy,
  FileText, Crown, RotateCcw, Shield, StickyNote, Brain, GraduationCap,
  Sparkles, Users, Clock, Compass, Globe, TrendingUp, Rocket, Sunrise,
  Moon, Bell, HelpCircle, Lock,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BADGE_DEFS, TIER_COLORS, BadgeDef, BadgeCategory, getProgressPct } from '../../lib/badges';
import { useUIStore } from '../../stores/uiStore';
import { TIERS, getTier } from '../ui/AvatarFrame';
import { useTranslations } from "@/stores/languageStore";

const ICONS: Record<string, any> = {
  BookOpen, BookMarked, Library, CheckCircle, CheckCheck, Award,
  Target, Crosshair, Zap, Flame, Calendar, CalendarDays, Trophy,
  FileText, Crown, RotateCcw, Shield, StickyNote, Brain, GraduationCap,
  Sparkles, Users, Clock, Compass, Globe, TrendingUp, Rocket, Sunrise,
  Moon, Bell, HelpCircle,
};

type Props = {
  isDark: boolean;
  session: any;
  panelId: string;
};

type FilterTab = 'all' | 'unlocked' | 'progress' | 'locked';

export default function XPBadges({ isDark, session, panelId }: Props) {
    const t = useTranslations('components_engagement_XPBadges');
  const showToast = useUIStore(s => s.showToast);
  const [showHelpTip, setShowHelpTip] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [unlockedMap, setUnlockedMap] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<FilterTab>('all');
  const [categoryFilter, setCategoryFilter] = useState<BadgeCategory | 'all'>('all');
  const [tab, setTab] = useState<'badges' | 'log'>('badges');
  const [xpLog, setXpLog] = useState<any[]>([]);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [animatedWidth, setAnimatedWidth] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLevelRef = useRef(1);
  const framesRef = useRef<HTMLDivElement>(null);

  // ═══════════ Fetch Data ═══════════
  const fetchAll = useCallback(async (silent = false) => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    setError(null);

    try {
      const userId = session.user.id;

      const { data: xpRow } = await supabase
        .from('user_xp')
        .select('xp, level')
        .eq('user_id', userId)
        .eq('panel_id', panelId)
        .maybeSingle();

      const currentXp = xpRow?.xp ?? 0;
      const currentLevel = xpRow?.level ?? 1;
      setXp(currentXp);
      setLevel(currentLevel);

      const { data: badges } = await supabase
        .from('user_badges')
        .select('badge_id, unlocked_at')
        .eq('user_id', userId)
        .eq('panel_id', panelId);

      const map: Record<string, string> = {};
      badges?.forEach((b: any) => { map[b.badge_id] = b.unlocked_at; });
      setUnlockedMap(map);

      const { data: up } = await supabase
        .from('user_progress')
        .select('total_score, correct_score, streak_count, user_notes, exam_date')
        .eq('user_id', userId)
        .eq('panel_id', panelId)
        .maybeSingle();

      const { count: dailyCaseCount } = await supabase
        .from('xp_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('panel_id', panelId)
        .eq('reason', 'daily_case');

      const { count: correctedCount } = await supabase
        .from('xp_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('panel_id', panelId)
        .eq('reason', 'question_corrected');

      const { count: goalHitCount } = await supabase
        .from('daily_activity')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('panel_id', panelId)
        .eq('goal_hit', true);

      const totalSolved = up?.total_score ?? 0;
      const totalCorrect = up?.correct_score ?? 0;
      const accuracy100 = totalSolved >= 100 ? Math.round((totalCorrect / totalSolved) * 100) : 0;
      const accuracy200 = totalSolved >= 200 ? Math.round((totalCorrect / totalSolved) * 100) : 0;
      const accuracy300 = totalSolved >= 300 ? Math.round((totalCorrect / totalSolved) * 100) : 0;

      setStats({
        questions_solved: totalSolved,
        questions_correct: totalCorrect,
        streak: up?.streak_count ?? 0,
        notes_count: up?.user_notes ? Object.keys(up.user_notes).length : 0,
        has_exam_date: up?.exam_date ? 1 : 0,
        level: currentLevel,
        daily_case_count: dailyCaseCount ?? 0,
        corrected_count: correctedCount ?? 0,
        goal_hit_count: goalHitCount ?? 0,
        accuracy_100: accuracy100,
        accuracy_200: accuracy200,
        accuracy_300: accuracy300,
      });

      const { data: log } = await supabase
        .from('xp_events')
        .select('amount, reason, created_at')
        .eq('user_id', userId)
        .eq('panel_id', panelId)
        .order('created_at', { ascending: false })
        .limit(20);
      setXpLog(log ?? []);

    } catch (e: any) {
      setError(e?.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, panelId]);

  // ═══════════ Initial Load ═══════════
  useEffect(() => {
    fetchAll(false);
  }, [fetchAll]);

  // ═══════════ XP Bar Animation ═══════════
  useEffect(() => {
    setAnimatedWidth(0);
    const t = setTimeout(() => {
      setAnimatedWidth((xp % 500) / 5);
    }, 250);
    return () => clearTimeout(t);
  }, [xp]);

  // ═══════════ Scroll Frames to Current ═══════════
  useEffect(() => {
    const el = framesRef.current;
    if (!el || loading) return;
    const currentTier = getTier(xp);
    const currentEl = el.querySelector<HTMLElement>(`[data-tier="${currentTier.id}"]`);
    if (currentEl) {
      currentEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [xp, loading]);

  // ═══════════ Realtime ═══════════
  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;

    const channel = supabase
      .channel(`xp_badges_${panelId}_${userId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${userId}`
        },
        () => { fetchAll(true); }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_xp',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          const newLevel = payload.new?.level ?? 1;
          if (newLevel > prevLevelRef.current) {
            showToast(`🎉 Reached Level ${newLevel}!`, 'success');
          }
          prevLevelRef.current = newLevel;
          fetchAll(true);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session?.user?.id, fetchAll, showToast, panelId]);

  // ═══════════ Scroll Hint ═══════════
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || loading) return;
    const shouldShow = el.scrollHeight > el.clientHeight + 20;
    setShowScrollHint(shouldShow);
    const onScroll = () => setShowScrollHint(false);
    el.addEventListener('scroll', onScroll, { once: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [loading, filter, tab]);

  // ═══════════ Filter Logic ═══════════
  const filteredBadges = BADGE_DEFS.filter(b => {
    const isUnlocked = !!unlockedMap[b.id];
    const pct = getProgressPct(b, stats);

    if (filter === 'unlocked' && !isUnlocked) return false;
    if (filter === 'locked' && isUnlocked) return false;
    if (filter === 'progress' && (isUnlocked || pct === 0)) return false;
    if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
    return true;
  });

  const closestBadges = BADGE_DEFS
    .filter(b => !unlockedMap[b.id])
    .map(b => ({ badge: b, pct: getProgressPct(b, stats) }))
    .filter(x => x.pct > 0)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);

  const unlockedCount = Object.keys(unlockedMap).length;
  const totalCount = BADGE_DEFS.length;

  // ═══════════ Current Tier ═══════════
  const currentTier = getTier(xp);

  // ═══════════ Loading State ═══════════
  if (loading) {
    return (
      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="animate-pulse space-y-3">
          <div className={`h-6 w-1/3 rounded ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className={`h-4 w-full rounded ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={`h-24 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════ Error State ═══════════
  if (error) {
    return (
      <div className={`p-5 rounded-2xl border text-center ${isDark ? 'bg-slate-900 border-red-900' : 'bg-white border-red-200'}`}>
        <p className={`text-sm mb-3 ${isDark ? 'text-red-400' : 'text-red-600'}`}>⚠️ {error}</p>
        <button
          onClick={() => fetchAll(false)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold rounded-xl"
        >
          {t('try_again')}
                        </button>
      </div>
    );
  }

  // ═══════════ No Session ═══════════
  if (!session?.user?.id) {
    return (
      <div className={`p-5 rounded-2xl border text-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {t('sign_in_to_view_your')}
                        </p>
      </div>
    );
  }

  const xpToNext = 500 - (xp % 500);

  // ═══════════ Main Render ═══════════
  return (
    <div className={`relative overflow-hidden rounded-2xl border grain-overlay shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy size={18} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
            <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('badges')}
                                      </h3>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowHelpTip(v => !v)}
                className={`p-0.5 rounded-full transition-colors ${isDark ? 'text-slate-500 hover:text-sky-400' : 'text-slate-400 hover:text-sky-600'}`}
                aria-label={t('what_is_xp')}
              >
                <HelpCircle size={15} />
              </button>
              {showHelpTip && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowHelpTip(false)} />
                  <div className={`absolute top-7 start-0 z-50 w-64 p-3 rounded-xl shadow-2xl border text-[11px] leading-relaxed ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    {t('the_more')} <b>{t('xp')}</b> {t('you_earn_the_more')} <b>{t('exclusive_frames')}</b> {t('you_unlock_around_your_avatar')}
                                                          <br /><br />
                    <span className="text-emerald-500 font-bold">{t('each_correct_answer_10_xp')}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {unlockedCount}/{totalCount}
          </span>
        </div>

        {/* XP + Level */}
        <div className={`flex items-center gap-3 p-3 rounded-xl mb-3 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
          <div className="flex-1">
            <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <bdi>{xpToNext}</bdi> {t('xp_to')} <bdi>Level {level + 1}</bdi>
            </p>
            <div className={`mt-2 h-2.5 rounded-full overflow-hidden relative ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
              <div
                className="h-full bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-500 transition-all duration-[1500ms] ease-out relative"
                style={{
                  width: `${animatedWidth}%`,
                  boxShadow: '0 0 12px rgba(56, 189, 248, 0.7)',
                }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
              </div>
            </div>
          </div>
          <div className="text-end shrink-0">
            <p className={`text-lg font-black ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>
              {xp.toLocaleString()} XP
            </p>
          </div>
        </div>

        {/* ═══════════ Frame Tiers Progress ═══════════ */}
        <div className={`p-3 rounded-xl mb-3 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <p className={`text-[10px] font-black uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('frame_tiers')}
                                </p>
          <div ref={framesRef} className="flex items-end gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {TIERS.map((tier, idx) => {
              const isUnlocked = xp >= tier.minXP;
              const isCurrent = currentTier.id === tier.id;
              return (
                <div
                  key={tier.id}
                  data-tier={tier.id}
                  className="relative flex flex-col items-center shrink-0"
                  style={{ minWidth: 64 }}
                >
                  {/* ▼ Arrow above current tier */}
                  {isCurrent && (
                    <div
                      className="absolute -top-3 text-sm font-black animate-bounce"
                      style={{ color: tier.color }}
                    >
                      ▼
                    </div>
                  )}

                  {/* Frame image */}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                      isCurrent ? 'scale-110' : ''
                    }`}
                    style={{
                      filter: !isUnlocked
                        ? 'grayscale(1) opacity(0.35)'
                        : isCurrent
                          ? `drop-shadow(0 0 8px ${tier.color})`
                          : 'none',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/frames/${tier.id}.png`}
                      alt={tier.nameEn}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Name */}
                  <p
                    className={`text-[9px] font-black mt-1 text-center leading-tight ${
                      isCurrent
                        ? ''
                        : isUnlocked
                          ? (isDark ? 'text-slate-300' : 'text-slate-600')
                          : (isDark ? 'text-slate-600' : 'text-slate-400')
                    }`}
                    style={isCurrent ? { color: tier.color } : undefined}
                  >
                    {tier.nameEn}
                  </p>

                  {/* XP requirement */}
                  <p className={`text-[8px] font-bold mt-0.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                    {tier.minXP.toLocaleString()}
                  </p>

                  {/* Connector line between tiers */}
                  {idx < TIERS.length - 1 && (
                    <div className="absolute top-5 -end-2 w-3 h-px bg-slate-600/40" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-3">
          <button
            onClick={() => setTab('badges')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'badges'
                ? 'bg-sky-600 text-white'
                : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t('badges')}
                                </button>
          <button
            onClick={() => setTab('log')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'log'
                ? 'bg-sky-600 text-white'
                : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t('xp_log')}
                                </button>
        </div>

        {/* Filters */}
        {tab === 'badges' && (
          <div className="flex gap-1 flex-wrap mb-2">
            {(['all', 'unlocked', 'progress', 'locked'] as FilterTab[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                  filter === f
                    ? 'bg-sky-600 text-white'
                    : isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? t('all') : f === 'unlocked' ? 'Unlocked' : f === 'progress' ? 'In Progress' : 'Locked'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div
        ref={scrollRef}
        className="px-5 pb-5 max-h-[500px] overflow-y-auto custom-scrollbar relative"
      >
        {tab === 'badges' && (
          <>
            {filter === 'all' && closestBadges.length > 0 && (
              <div className="mb-4">
                <h4 className={`text-xs font-black mb-2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  {t('closest_to_unlock')}
                                                  </h4>
                <div className="grid grid-cols-3 gap-2">
                  {closestBadges.map(({ badge, pct }) => (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      isUnlocked={false}
                      unlockedAt={null}
                      pct={pct}
                      isDark={isDark}
                      compact
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {filteredBadges.map(badge => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isUnlocked={!!unlockedMap[badge.id]}
                  unlockedAt={unlockedMap[badge.id] ?? null}
                  pct={getProgressPct(badge, stats)}
                  isDark={isDark}
                />
              ))}
            </div>

            {filteredBadges.length === 0 && (
              <p className={`text-center py-8 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {t('no_badges_in_this_filter')}
                                            </p>
            )}
          </>
        )}

        {tab === 'log' && (
          <div className="space-y-2">
            {xpLog.length === 0 ? (
              <p className={`text-center py-8 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {t('no_xp_log_yet_start')}
                                            </p>
            ) : (
              xpLog.map((e, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2.5 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}
                >
                  <div>
                    <p className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {e.reason}
                    </p>
                    <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {new Date(e.created_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <span className={`text-sm font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    +{e.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {showScrollHint && (
          <div className="sticky bottom-2 flex justify-center pointer-events-none">
            <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold animate-bounce ${
              isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
            }`}>
              {t('scroll_down')}
                                      </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════ Badge Card Component ═══════════
function BadgeCard({
  badge, isUnlocked, unlockedAt, pct, isDark, compact = false,
}: {
  badge: BadgeDef;
  isUnlocked: boolean;
  unlockedAt: string | null;
  pct: number;
  isDark: boolean;
  compact?: boolean;
}) {
  const Icon = ICONS[badge.icon] ?? HelpCircle;
  const tier = TIER_COLORS[badge.tier];

  const cardClass = isUnlocked
    ? `${tier.bg} ${tier.border} border-2`
    : isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-slate-100 border border-slate-200';

  return (
    <div
      className={`relative rounded-xl p-2.5 transition-all ${cardClass} ${isUnlocked ? 'shadow-lg ' + tier.glow : ''}`}
      title={badge.desc_ar}
    >
      <div className="flex justify-center mb-1.5">
        {isUnlocked ? (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tier.bg} border-2 ${tier.border}`}>
            <Icon size={20} className={tier.text} />
          </div>
        ) : (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
            <Lock size={16} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
          </div>
        )}
      </div>

      <p className={`text-[10px] font-bold text-center truncate ${isUnlocked ? tier.text : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        {badge.secret && !isUnlocked ? '???' : (badge.name_ar || badge.id)}
      </p>
      <p className={`text-[9px] font-black text-center mt-0.5 ${
  isUnlocked
    ? 'text-emerald-500'
    : isDark ? 'text-slate-600' : 'text-slate-400'
}`}>
  +{badge.xp_reward} XP
</p>
      {!isUnlocked && pct > 0 && (
        <div className="mt-1.5">
          <div className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
            <div className="h-full bg-sky-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className={`text-[9px] text-center mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {pct}%
          </p>
        </div>
      )}

      {isUnlocked && unlockedAt && !compact && (
        <p className={`text-[8px] text-center mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {new Date(unlockedAt).toLocaleDateString('en-GB')}
        </p>
      )}
    </div>
  );
}