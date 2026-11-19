'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Flame, Trophy, Snowflake } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  session: any;
  panelId: string;
};

const DEFAULT_FREEZES = 3;

function normalizeDate(d: string | null | undefined): string {
  if (!d) return '';
  try {
    const date = new Date(d);
    if (!isNaN(date.getTime())) return date.toDateString();
  } catch {}
  return String(d);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return 999;
  const MS = 86400000;
  const a0 = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate());
  const b0 = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate());
  return Math.round((a0 - b0) / MS);
}

export default function StreakBadge({ isDark, session, panelId }: Props) {
    const t = useTranslations('components_engagement_StreakBadge');
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [freezes, setFreezes] = useState(DEFAULT_FREEZES);
  const [loading, setLoading] = useState(true);
  const [usedToday, setUsedToday] = useState(false);

  const [showTip, setShowTip] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [tipPos, setTipPos] = useState({ top: 0, left: 0 });

  const uid = session?.user?.id;
  const bestKey = uid ? `codeblue_best_streak_${panelId}_${uid}` : '';
  const freezesKey = uid ? `codeblue_freezes_${panelId}_${uid}` : '';
  const lastFreezeKey = uid ? `codeblue_last_freeze_${panelId}_${uid}` : '';

  useEffect(() => setMounted(true), []);

  const consumeFreeze = (): number => {
    const stored = localStorage.getItem(freezesKey);
    let current = stored !== null ? parseInt(stored, 10) : DEFAULT_FREEZES;
    if (isNaN(current) || current <= 0) current = DEFAULT_FREEZES;

    const next = current - 1;
    const finalValue = next <= 0 ? DEFAULT_FREEZES : next;

    localStorage.setItem(freezesKey, String(finalValue));
    return finalValue;
  };

  useEffect(() => {
    if (!uid) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: progress } = await supabase
        .from('user_progress')
        .select('streak_count, last_active_date')
        .eq('user_id', uid)
        .eq('panel_id', panelId)
        .maybeSingle();

      let currentStreak = progress?.streak_count || 0;
      const today = new Date().toDateString();
      const lastActive = normalizeDate(progress?.last_active_date);

      const storedFreezes = localStorage.getItem(freezesKey);
      let currentFreezes = storedFreezes !== null ? parseInt(storedFreezes, 10) : DEFAULT_FREEZES;
      if (isNaN(currentFreezes) || currentFreezes <= 0) {
        currentFreezes = DEFAULT_FREEZES;
        localStorage.setItem(freezesKey, String(currentFreezes));
      }

      const lastFreezeDate = localStorage.getItem(lastFreezeKey) || '';
      setUsedToday(lastFreezeDate === today);

      let needsUpdate = false;

      if (!progress || !lastActive) {
        currentStreak = 1;
        needsUpdate = true;
      } else {
        const gap = daysBetween(today, lastActive);

        if (gap === 0) {
          // same day
        } else if (gap === 1) {
          currentStreak = currentStreak + 1;
          needsUpdate = true;
        } else {
          if (currentStreak > 0) {
            currentFreezes = consumeFreeze();
            localStorage.setItem(lastFreezeKey, today);
            setUsedToday(true);
          } else {
            currentStreak = 1;
          }
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await supabase
          .from('user_progress')
          .upsert(
            {
              user_id: uid,
              panel_id: panelId,
              streak_count: currentStreak,
              last_active_date: today,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,panel_id' }
          );
      }

      setStreak(currentStreak);
      setFreezes(currentFreezes);

      const storedBest = localStorage.getItem(bestKey);
      const best = storedBest ? parseInt(storedBest, 10) : 0;
      const newBest = Math.max(isNaN(best) ? 0 : best, currentStreak);
      if (newBest > 0) localStorage.setItem(bestKey, String(newBest));
      setBestStreak(newBest);

      setLoading(false);
    };

    fetchData();
  }, [uid, panelId, bestKey, freezesKey, lastFreezeKey]);

  const computeTooltipPosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setTipPos({
      top: rect.top - 10,
      left: rect.left + rect.width / 2,
    });
  };

  const openTip = () => {
    computeTooltipPosition();
    setShowTip(true);
  };
  const closeTip = () => setShowTip(false);

  const useFreezeManually = async () => {
    if (!uid || usedToday) return;

    const today = new Date().toDateString();
    const newValue = consumeFreeze();

    setFreezes(newValue);
    setUsedToday(true);
    localStorage.setItem(lastFreezeKey, today);

    await supabase
      .from('user_progress')
      .upsert(
        {
          user_id: uid,
          panel_id: panelId,
          last_active_date: today,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,panel_id' }
      );

    closeTip();
  };

  if (!session?.user?.id) return null;

  const tipText = usedToday
    ? 'You already used a freeze today. Come back tomorrow.'
    : 'Tap to use a freeze and protect your streak for one missed day. Auto-used when you skip a day. Refills automatically.';

  const dayUnitLabel = streak === 1 ? 'Day' : 'Days';

  return (
    <>
      <div className={`p-5 rounded-3xl border shadow-sm ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between gap-3">

          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}>
              <Flame size={24} className="text-orange-500" />
            </div>
            <div className="min-w-0">
              <p className={`text-[10px] font-black uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {t('current_streak')}
                                            </p>
              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {streak} <span className="text-sm font-bold">{dayUnitLabel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">

            {/* ❄️ Freeze */}
            <button
              ref={buttonRef}
              type="button"
              onMouseEnter={openTip}
              onMouseLeave={closeTip}
              onFocus={openTip}
              onBlur={closeTip}
              onClick={useFreezeManually}
              disabled={usedToday || loading}
              aria-label={t('streak_freeze')}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border transition-all ${
                usedToday
                  ? isDark
                    ? 'bg-slate-800/50 border-slate-700/50 text-slate-500 cursor-not-allowed opacity-70'
                    : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                  : isDark
                    ? 'bg-sky-950/40 border-sky-700/50 text-sky-300 hover:bg-sky-900/60 hover:scale-105 active:scale-95'
                    : 'bg-sky-50 border-sky-200 text-sky-600 hover:bg-sky-100 hover:scale-105 active:scale-95'
              }`}
            >
              <Snowflake size={16} />
              <span className="text-sm font-black tabular-nums">{freezes}</span>
            </button>

            {/* 🏆 Best */}
            <div className="text-end">
              <div className="flex items-center gap-1.5 justify-end">
                <Trophy size={12} className="text-amber-500" />
                <p className={`text-[10px] font-black uppercase ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>{t('best')}</p>
              </div>
              <p className={`text-lg font-black ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                {bestStreak}
              </p>
            </div>
          </div>
        </div>
      </div>

      {mounted && showTip && createPortal(
        <div
          style={{
            position: 'fixed',
            top: tipPos.top,
            left: tipPos.left,
            transform: 'translate(-50%, -100%)',
            zIndex: 999999,
            pointerEvents: 'none',
          }}
        >
          <div className={`w-72 p-3 rounded-xl text-xs leading-relaxed shadow-2xl border ${
            isDark
              ? 'bg-slate-800 border-sky-700/60 text-slate-100'
              : 'bg-white border-sky-300 text-slate-700'
          }`}>
            <p className="font-black mb-1.5 flex items-center gap-1.5 text-sky-400">
              <Snowflake size={13} /> {t('streak_freeze_2')}
                                  </p>
            <p className="mb-2">
              You have <b className="text-sky-400">{freezes}</b>
              {' '}freeze{freezes !== 1 ? 's' : ''} left.
            </p>
            <p className="opacity-80 text-[11px]">{tipText}</p>
          </div>
          <div className={`w-2.5 h-2.5 mx-auto rotate-45 -mt-1.5 ${
            isDark
              ? 'bg-slate-800 border-e border-b border-sky-700/60'
              : 'bg-white border-e border-b border-sky-300'
          }`} />
        </div>,
        document.body
      )}
    </>
  );
}