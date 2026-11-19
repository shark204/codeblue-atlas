'use client';

import DayBoard, { useDocksOpen } from './panels/DayBoard';
import NotesDock from './panels/NotesDock';
import StudyingNowBadge from '@/components/StudyingNowBadge';
import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { UserCog, Share2, Coffee } from 'lucide-react';
import { getMemberTime } from '../../../lib/studyRoomHelpers';
import { VibeIcon } from '../../../lib/vibeIcons';
import {
  TABS, SOUNDS, getConfig, buildCustomConfig, DEFAULT_CUSTOM, VALID_FOCUS_VALUES, UNLIMITED_BREAK_COOLDOWN, clock,
  type CustomSession, type PanelId, type Mode,
} from './studyRoomData';
import { useAmbience } from './useAmbience';
import { TimerRing } from './TimerRing';
import { css } from './studyRoomCss';
import { cssPlus } from './studyRoomCssPlus';
import { cssDeck } from './studyRoomCssDeck';
import { useRoomHistory } from './hooks/useRoomHistory';

import { useUndergradStore } from '../../../stores/undergradStore';
import { useProgressStore } from '../../../stores/progressStore';
import { supabase } from '../../../lib/supabase';
import { useCloudState } from '../../../lib/useCloudState';
import Tip from './ui/Tip';

// Panels
import PeoplePanel from './panels/PeoplePanel';
import SoundsPanel from './panels/SoundsPanel';
// ✅ تم مسح import PlannerPanel
import { type Goal } from './panels/GoalsPanel';
import FlashcardsPanel from './panels/FlashcardsPanel';
import WeakTopicsPanel from './panels/WeakTopicsPanel';
import StatsPanel from './panels/StatsPanel';
import ChallengesTab from './panels/ChallengesTab';
import SettingsPanel from './panels/SettingsPanel';
import BreakActivities from './panels/BreakActivities';

// Modals
import InviteModal from './modals/InviteModal';
import StatusModal from './modals/StatusModal';

// Challenges
import ChallengeRulesModal from '../../challenges/ChallengeRulesModal';
import IncomingChallengeToast from '../../challenges/IncomingChallengeToast';
import ReadyWaitScreen from '../../challenges/ReadyWaitScreen';
import ChallengeLiveScreen from '../../challenges/ChallengeLiveScreen';
import ChallengeResultScreen from '../../challenges/ChallengeResultScreen';
import { useChallenge } from '../../../lib/challenges/useChallenge';
import { useTranslations } from "@/stores/languageStore";
import { useIncomingChallenge } from '../../../lib/challenges/useIncomingChallenge';
import { createChallenge } from '../../../lib/challenges/api';
import type { ChallengeRules } from '../../../lib/challenges/types';
import { getSessionStoreState } from '../../../stores/sessionStore';

type Props = {
  isDark: boolean;
  currentRoom: any;
  roomMembers: any[];
  session: any;
  inviteCode: string;
  roomAlias: string;
  setRoomAlias: (v: string) => void;
  roomEmoji: string;
  setRoomEmoji: (v: string) => void;
  showStatusModal: boolean;
  setShowStatusModal: (b: boolean) => void;
  showInviteModal: boolean;
  setShowInviteModal: (b: boolean) => void;
  onLeave: (onBeforeLeave?: () => void | Promise<void>) => void;
  onToggleTimer: (mode?: 'focus' | 'break', durationSeconds?: number) => void;
  onResetTimer?: (mode: 'focus' | 'break', durationSeconds: number) => void;
  onKickMember: (id: string, name: string) => void;
  onSaveStatus: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  panelId?: string;
};
const dayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function StudyRoomLiveInner({
  isDark, currentRoom, roomMembers, session, inviteCode,
  roomAlias, setRoomAlias, roomEmoji, setRoomEmoji,
  showStatusModal, setShowStatusModal,
  showInviteModal, setShowInviteModal,
  onLeave, onToggleTimer, onResetTimer, onKickMember, onSaveStatus, onShowToast,
  panelId = 'mrcs',
}: Props) {
    const t = useTranslations('components_screens_study_room_StudyRoomLive');
  const examBank = useUndergradStore((s) => s.examBank);
  const actualPanelId = (panelId === 'study_room' ? examBank : panelId) as any;
  const userId = session?.user?.id as string | undefined;

  useEffect(() => {
    console.log('StudyRoom panelId:', panelId, '→ actual:', actualPanelId);
  }, [panelId, actualPanelId]);

  const progIncorrect = (useProgressStore(actualPanelId, (s: any) => s.incorrectIds) || []) as number[];
  const progFlagged   = (useProgressStore(actualPanelId, (s: any) => s.flaggedIds)   || []) as number[];
  const progNotes     = (useProgressStore(actualPanelId, (s: any) => s.userNotes)    || {}) as Record<string, string>;
  const progSr        = (useProgressStore(actualPanelId, (s: any) => s.srData)       || {}) as Record<string, { step: number; nextReview: number }>;
  const setProgIncorrect = useProgressStore(actualPanelId, (s: any) => s.setIncorrectIds);

  const dueIds = useMemo(
    () => Object.entries(progSr).filter(([, v]) => v.nextReview <= Date.now()).map(([k]) => Number(k)),
    [progSr],
  );

  const [tab, setTab] = useState<PanelId | null>(null);
  const [mode, setMode] = useState<Mode>('focus');
  const [focusSetting, setFocusSetting] = useState<number>(() => {
    try {
      const p = localStorage.getItem('sr-pending-focus');
      if (p) { const v = parseInt(p, 10); if (VALID_FOCUS_VALUES.includes(v)) return v; }
      const s = localStorage.getItem('sr-last-focus');
      if (s) { const v = parseInt(s, 10); if (VALID_FOCUS_VALUES.includes(v)) return v; }
    } catch {}
    return 25;
  });
  const [currentChunk, setCurrentChunk] = useState(0);
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [chunkEndTrigger, setChunkEndTrigger] = useState(0);
  const [showHours, setShowHours] = useState(true);
  const [copied, setCopied] = useState(false);
  const [levels, setLevel, loadingIds] = useAmbience();

  const [docksOpen, toggleDocks] = useDocksOpen();

  const [goals, setGoals] = useCloudState<Goal[]>(userId, 'goals', []);
  const [custom, setCustom] = useCloudState<CustomSession>(userId, 'custom-session', DEFAULT_CUSTOM);

  const [showRules, setShowRules] = useState(false);
  const [targetOpponent, setTargetOpponent] = useState<{ id: string; name: string } | null>(null);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const { challenge: liveChallenge } = useChallenge(activeChallengeId);
  const { pending: incomingChallenge, refresh: refreshIncoming } = useIncomingChallenge(session?.user?.id);

  const lastProcessedEndRef = useRef<string | null>(null);
  const lastUserSwitchRef = useRef<number>(0);
  const cumulativeFocusRef = useRef(0);

  const [breaksUsed, setBreaksUsed] = useState(0);
  const [lastBreakStartFocusSeconds, setLastBreakStartFocusSeconds] = useState(0);
  const [maxFocusSeconds, setMaxFocusSeconds] = useState(0);
  const [currentFocusSeconds, setCurrentFocusSeconds] = useState(0);

  const resolveConfig = useCallback(
    (v: number, c: CustomSession = custom) => (v === 0 ? buildCustomConfig(c) : getConfig(v)),
    [custom],
  );
  const config = useMemo(() => resolveConfig(focusSetting), [focusSetting, resolveConfig]);
  const isUnlimited = focusSetting === -1;
  const isTracking = focusSetting === -2;
  const isInfinite = config.chunks === Infinity;
  const hasBreaks = config.breakDur > 0;

  const me = useMemo(() => roomMembers.find((m) => m.user_id === session?.user?.id), [roomMembers, session?.user?.id]);
  const mySeconds = me ? getMemberTime(me) : 0;

  const everyone = useMemo(
    () => roomMembers
      .map((m) => ({ id: m.id, user_id: m.user_id, name: m.alias || 'Guest', vibe: m.status_emoji || 'bookOpen', seconds: getMemberTime(m), status: m.is_studying ? 'focus' : 'idle', me: m.user_id === session?.user?.id }))
      .sort((a, b) => b.seconds - a.seconds),
    [roomMembers, session?.user?.id]
  );

  const { history, addRecord, deleteRecord, clearHistory, saveGoalsSnapshot } = useRoomHistory(
    session?.user?.id,
    mySeconds,
    cumulativeFocusRef,
  );
// ✅ إضافة حساب عدد جلسات اليوم من الهيستوري
  const todaySessions = useMemo(() => {
    const k = dayKey();
    return history.filter((r) => {
      const d = new Date(r.date);
      const rk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return rk === k;
    }).length;
  }, [history]);
  const saveSessionRecord = useCallback((focusSecs: number) => {
    if (focusSecs < 10 * 60) return;
    addRecord({
      id: Date.now(),
      date: new Date().toISOString(),
      focusSeconds: focusSecs,
      goalsDone: goals.filter((g) => g.done).map((g) => g.t),
      goalsTotal: goals.length,
      configLabel: config.label,
    });
  }, [goals, config.label, addRecord]);

  const leaveRoom = useCallback(() => {
    onLeave(() => {
      const focus = cumulativeFocusRef.current;
      if (focus >= 10 * 60) {
        saveSessionRecord(focus);
      }
      cumulativeFocusRef.current = 0;
    });
  }, [saveSessionRecord, onLeave]);

  useEffect(() => {
    const h = () => {
      if (cumulativeFocusRef.current >= 10 * 60) {
        saveSessionRecord(cumulativeFocusRef.current);
        cumulativeFocusRef.current = 0;
      }
    };
    window.addEventListener('pagehide', h);
    return () => window.removeEventListener('pagehide', h);
  }, [saveSessionRecord]);

  const resolveMistake = useCallback((id: number, correct: boolean) => {
    const cur = progIncorrect.map(Number);
    const has = cur.includes(id);
    let next: number[] | null = null;
    if (correct && has) next = cur.filter((x) => x !== id);
    else if (!correct && !has) next = [...cur, id];
    if (!next || !userId) return;

    setProgIncorrect(next);
    supabase.from('user_progress')
      .update({ incorrect_ids: next, updated_at: new Date().toISOString() })
      .eq('user_id', userId).eq('panel_id', actualPanelId)
      .then(({ error }) => { if (error) console.warn('incorrect_ids sync failed:', error.message); });
  }, [progIncorrect, setProgIncorrect, userId, actualPanelId]);

  useEffect(() => {
    try { const s = localStorage.getItem(`sr-total-focus:${currentRoom?.id}`); setMaxFocusSeconds(s ? parseInt(s, 10) : 0); } catch {}
  }, [currentRoom?.id]);

  useEffect(() => { try { localStorage.setItem('sr-last-focus', String(focusSetting)); } catch {} }, [focusSetting]);

  useEffect(() => {
    if (!currentRoom?.id) return;
    try {
      const p = localStorage.getItem('sr-pending-focus');
      if (p) {
        const v = parseInt(p, 10);
        if (VALID_FOCUS_VALUES.includes(v)) {
          setFocusSetting(v);
          const cfg = resolveConfig(v);
          setLeft(cfg.chunkDur);
          setBreaksUsed(0); setLastBreakStartFocusSeconds(0); setCurrentFocusSeconds(0);
          cumulativeFocusRef.current = 0;
        }
        localStorage.removeItem('sr-pending-focus');
      }
    } catch {}
  }, [currentRoom?.id]);

  useEffect(() => { (window as any).__srReset = onResetTimer; return () => { delete (window as any).__srReset; }; }, [onResetTimer]);

  useEffect(() => {
    if (!me?.is_studying || !me?.session_ends_at) return;
    const delay = Math.max(0, new Date(me.session_ends_at).getTime() - Date.now()) + 400;
    const t = setTimeout(() => setChunkEndTrigger((x) => x + 1), delay);
    return () => clearTimeout(t);
  }, [me?.is_studying, me?.session_ends_at]);

  useEffect(() => {
    const sr = !!me?.is_studying;
    if (sr !== running) setRunning(sr);
    if (me?.session_mode && me.session_mode !== mode) setMode(me.session_mode as Mode);
  }, [me?.is_studying, me?.session_mode]);

  useEffect(() => {
    if (!me?.is_studying || !me?.session_ends_at) {
      const dur = mode === 'focus' ? config.chunkDur : config.breakDur;
      setLeft(dur);
      return;
    }
    if (chunkEndTrigger === 0) return;
    if (Date.now() - lastUserSwitchRef.current < 3000) return;
    if (lastProcessedEndRef.current === me.session_ends_at) return;
    lastProcessedEndRef.current = me.session_ends_at;

    if (mode === 'focus') {
      const isLast = !isInfinite && currentChunk + 1 >= config.chunks;
      if (isLast) {
        setSessions((s) => s + 1); setRunning(false); setCurrentChunk(0); setBreaksUsed(0); setMode('focus'); setLeft(config.chunkDur);
        saveSessionRecord(cumulativeFocusRef.current);
      } else {
        setCurrentChunk((c) => c + 1); setLeft(config.chunkDur);
      }
      if ((window as any).__srReset) (window as any).__srReset('focus', config.chunkDur);
      return;
    }
    if (mode === 'break') { setMode('focus'); setLeft(config.chunkDur); if ((window as any).__srReset) (window as any).__srReset('focus', config.chunkDur); }
  }, [chunkEndTrigger, me?.is_studying, me?.session_ends_at, mode, currentChunk, config, isInfinite, saveSessionRecord]);

  useEffect(() => {
    if (mode !== 'focus' || !me?.is_studying) return;
    const t = setInterval(() => {
      cumulativeFocusRef.current += 1;
      if (cumulativeFocusRef.current % 5 === 0) {
        setCurrentFocusSeconds(cumulativeFocusRef.current);
        setMaxFocusSeconds((prev) => prev + 5);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [mode, me?.is_studying]);

  useEffect(() => {
    if (!currentRoom?.id || maxFocusSeconds <= 0) return;
    try { localStorage.setItem(`sr-total-focus:${currentRoom.id}`, String(maxFocusSeconds)); } catch {}
  }, [maxFocusSeconds, currentRoom?.id]);

  const totalBreaksAllowed = isUnlimited ? Infinity : Math.max(0, config.chunks - 1);
  const breaksRemaining = isInfinite ? Infinity : Math.max(0, totalBreaksAllowed - breaksUsed);
  const focusSinceLastBreak = isUnlimited ? Math.max(0, currentFocusSeconds - lastBreakStartFocusSeconds) : 0;
  const cooldownLeft = isUnlimited ? Math.max(0, UNLIMITED_BREAK_COOLDOWN - focusSinceLastBreak) : 0;

  const canTakeBreak = (() => {
    if (!hasBreaks) return false;
    if (mode === 'break') return false;
    if (isUnlimited) return focusSinceLastBreak >= UNLIMITED_BREAK_COOLDOWN;
    return breaksRemaining > 0;
  })();

  const breakLabel = (() => {
    if (!hasBreaks) return '';
    if (mode === 'break') return 'On Break';
    if (isUnlimited) return cooldownLeft > 0 ? `Break in ${clock(cooldownLeft)}` : 'Start Break';
    if (breaksRemaining <= 0) return 'No Breaks Left';
    return `Start Break (${breaksRemaining})`;
  })();

  const isFocusMode = mode === 'focus';
  const isCountingUp = isFocusMode && (isUnlimited || isTracking);
  const isUnlimitedNow = isFocusMode && isUnlimited;
  const segmentTotal = isFocusMode ? config.chunkDur : config.breakDur;

  const chunkLabel = (() => {
    if (!isFocusMode) return 'Break';
    if (isTracking) return 'Non-stop';
    if (isUnlimited) return 'Marathon';
    if (config.chunks === 1) return `Session #${sessions + 1}`;
    return `Chunk ${currentChunk + 1} / ${config.chunks}`;
  })();

  const durationFor = (m: Mode): number => m === 'focus' ? config.chunkDur : config.breakDur;

  const reset = async () => {
    if (cumulativeFocusRef.current >= 10 * 60) saveSessionRecord(cumulativeFocusRef.current);
    const duration = durationFor(mode);
    setLeft(duration); setRunning(false); setCurrentChunk(0); setBreaksUsed(0);
    setLastBreakStartFocusSeconds(0); setCurrentFocusSeconds(0);
    cumulativeFocusRef.current = 0;
    if (onResetTimer && me?.is_studying) await onResetTimer(mode, duration);
  };

  const handlePlayPause = async () => {
    setRunning(!me?.is_studying);
    await onToggleTimer(mode, durationFor(mode));
  };

  const handleStartBreak = async () => {
    if (!canTakeBreak) return;
    lastUserSwitchRef.current = Date.now();
    if (isUnlimited) setLastBreakStartFocusSeconds(currentFocusSeconds);
    else setBreaksUsed((c) => c + 1);
    setMode('break'); setRunning(true); setLeft(config.breakDur);
    await onToggleTimer('break', config.breakDur);
    if (me?.is_studying) await onToggleTimer('break', config.breakDur);
  };

  const applyFocus = (val: number, c: CustomSession = custom) => {
    setFocusSetting(val);
    try { localStorage.setItem('sr-last-focus', String(val)); } catch {}
    const cfg = resolveConfig(val, c);
    setCurrentChunk(0); setBreaksUsed(0); setLastBreakStartFocusSeconds(0);
    setCurrentFocusSeconds(0); cumulativeFocusRef.current = 0;
    setMode('focus'); setLeft(cfg.chunkDur);
    if (me?.is_studying) { onToggleTimer('focus', cfg.chunkDur); onToggleTimer('focus', cfg.chunkDur); }
  };

  const copy = () => {
    navigator.clipboard?.writeText(currentRoom?.invite_code || inviteCode);
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };

  const shareRoomLink = async () => {
    const code = currentRoom?.invite_code || inviteCode;
    if (!code) return;
    const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/?join=${code}`;
    const shareData = { title: t('code_blue_bank_study_room'), text: `انضم لغرفة الدراسة واتحداني! 🎯\n\nكود الغرفة: ${code}`, url: link };
    try {
      if ((navigator as any).share) { await (navigator as any).share(shareData); onShowToast?.('تمت المشاركة! 🎉', 'success'); return; }
    } catch (err: any) { if (err?.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(`${shareData.text}\n${link}`); onShowToast?.('تم نسخ اللينك! 📋', 'success'); } catch {}
  };

  const openRulesFor = (id: string, name: string) => { setTargetOpponent({ id, name }); setShowRules(true); };

  const getQuestionsFromIds = useCallback((ids: number[]) => {
    const state = getSessionStoreState(actualPanelId);
    const all = [...(state.sessionQuestions || []), ...(state.reviewQuestions || [])];
    const map = new Map(all.map((q: any) => [q.id, q]));
    return ids.map((id) => map.get(id)).filter(Boolean) as any[];
  }, [actualPanelId]);

  const handleReady = async (rules: ChallengeRules) => {
    if (!targetOpponent || !currentRoom?.id) return;
    setShowRules(false);
    const state = getSessionStoreState(actualPanelId);
    let pool: any[] = state.sessionQuestions || [];
    if (rules.category !== 'all') pool = pool.filter((q: any) => q.Theme_Category === rules.category);
    if (pool.length < rules.count) pool = state.sessionQuestions || [];
    const r = await createChallenge({
      roomId: currentRoom.id, opponentId: targetOpponent.id,
      questionIds: pool.slice(0, rules.count).map((q: any) => q.id),
      seed: `${currentRoom.id}:${Date.now()}`, rules, acceptSeconds: 60,
    });
    if (r.ok && r.id) setActiveChallengeId(r.id);
    else onShowToast(r.error || 'فشل إنشاء التحدي', 'error');
    setTargetOpponent(null);
  };

  const sidebarButtons = useMemo(() => TABS.map((t) => (
    <Tip key={t.id} text={t.tip} side="right">
      <button
        className={`sr-tab-btn ${tab === t.id ? 'on' : ''}`}
        onClick={() => setTab(tab === t.id ? null : t.id)}
        aria-pressed={tab === t.id}
        aria-label={t.label}
      >
        <div className="sr-tab-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d={t.d} />
          </svg>
        </div>
        <span className="sr-tab-label">{t.label}</span>
      </button>
    </Tip>
  )), [tab]);

  return (
    <div dir="ltr" className={`sr-root ${mode} ${isDark ? '' : 'light'}`}>
      <style>{css}{cssPlus}{cssDeck}</style>
      <div className="sr-bg"><i /><i /></div>

      <nav className="sr-side">
        <div className="sr-brand">📖</div>
        {sidebarButtons}
        <Tip text="Leave this room. Your study time is saved." side="right"><button className="leave" onClick={leaveRoom}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg><span>{t('leave')}</span></button></Tip>
      </nav>

      <aside className={`sr-panel ${tab ? 'open' : ''}`}>
        {tab && (
          <div className="sr-panel-in" key={tab}>
            <div className="sr-ph">
              <h2>{TABS.find((t) => t.id === tab)!.label}</h2>
              <button onClick={() => setTab(null)}>✕</button>
            </div>
            {tab === 'people' && <PeoplePanel members={everyone} showHours={showHours} />}
            {tab === 'sounds' && <SoundsPanel levels={levels} loadingIds={loadingIds} setLevel={setLevel} />}
            {/* ✅ تم مسح {tab === 'planner' && <PlannerPanel userId={userId} />} */}
            {tab === 'flashcards' && (
              <FlashcardsPanel
                userId={userId} panelId={actualPanelId}
                mistakes={progIncorrect} flagged={progFlagged} notes={progNotes} due={dueIds}
              />
            )}
            {tab === 'weak' && (
              <WeakTopicsPanel panelId={actualPanelId} incorrectIds={progIncorrect} onResolve={resolveMistake} />
            )}
            {tab === 'stats' && <StatsPanel isDark={isDark} mySeconds={mySeconds} sessions={todaySessions} members={everyone} />}
            {tab === 'challenges' && (
              <ChallengesTab
                isDark={isDark} currentRoom={currentRoom} inviteCode={inviteCode}
                copied={copied} onCopy={copy} onShare={shareRoomLink}
                members={everyone.map((e) => ({ id: e.user_id || e.id, name: e.name, status: e.status === 'focus' ? 'focus' : 'idle' }))}
                userId={session?.user?.id} onChallenge={openRulesFor}
              />
            )}
            {tab === 'settings' && (
              <SettingsPanel
                isDark={isDark} focusSetting={focusSetting}
                isTracking={isTracking} isUnlimited={isUnlimited} config={config}
                showHours={showHours} onToggleHours={setShowHours}
                custom={custom}
                onSaveCustom={(c) => { setCustom(c); applyFocus(0, c); }}
                onChangeFocus={(v) => applyFocus(v)}
                onLeave={leaveRoom}
              />
            )}
          </div>
        )}
      </aside>

      <main className="sr-main">
        <header className="sr-top">
          <div>
            <h1>{currentRoom?.name || 'Study Room'}</h1>
            <StudyingNowBadge roomMembers={roomMembers} isDark={isDark} size="md" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setRoomAlias(me?.alias || ''); setRoomEmoji(me?.status_emoji || 'bookOpen'); setShowStatusModal(true); }} className="sr-pill"><UserCog size={16} /></button>
            <button className="sr-pill" onClick={() => setShowInviteModal(true)} dir="ltr"><Share2 size={16} /> {currentRoom?.invite_code || inviteCode}</button>
          </div>
        </header>

        <div className={`sr-workspace ${docksOpen ? '' : 'closed'}`}>
          <NotesDock isDark={isDark} userId={userId} open={docksOpen} onToggle={toggleDocks} />

          <section className="sr-stage">
            <div className="sr-toprow">
              <div className="sr-mode-indicator">
                <span className={`sr-mode-dot ${mode}`} />
                <span className="sr-mode-text">{mode === 'focus' ? (isTracking ? 'Non-stop' : isUnlimited ? 'Marathon' : 'Focus') : t('break')}</span>
                {hasBreaks && !isTracking && <span className="sr-mode-hint">{isUnlimited ? (cooldownLeft > 0 ? `Focus ${clock(cooldownLeft)} more` : 'Break ready') : `${breaksRemaining} break${breaksRemaining === 1 ? '' : 's'} left`}</span>}
              </div>

              <div className="sr-strip">
                {everyone.map((p) => (
                  <div key={p.id} className={`sr-chip ${p.status}`} title={p.name}>
                    <span><VibeIcon name={p.vibe} size={15} strokeWidth={2} /></span>
                    <small>{p.me ? t('you') : p.name}</small>
                  </div>
                ))}
              </div>
            </div>

            <TimerRing endsAt={me?.session_ends_at ? new Date(me.session_ends_at).getTime() : null} mode={mode} chunkDur={config.chunkDur} breakDur={config.breakDur} isCountingUp={isCountingUp} currentFocusSeconds={currentFocusSeconds} isUnlimitedNow={isUnlimitedNow} chunkLabel={chunkLabel} maxFocusSeconds={maxFocusSeconds} />

            <div className="sr-ctrl">
              <button className="ghost" onClick={reset}>↺</button>
              <button className="go" onClick={handlePlayPause}>{running ? t('pause') : (isUnlimitedNow ? (currentFocusSeconds > 0 ? 'Resume' : 'Start Focus') : (left < segmentTotal ? 'Resume' : 'Start Focus'))}</button>
              {hasBreaks && !isTracking && (
                <button className="ghost break-btn" onClick={handleStartBreak} disabled={!canTakeBreak} title={breakLabel} style={{ width: 'auto', padding: '0 16px', fontSize: 14, fontWeight: 600 }}>
                  <Coffee size={16} className="inline me-1" />
                  {mode === 'break' ? t('on_break') : isUnlimited ? (cooldownLeft > 0 ? `${clock(cooldownLeft)}` : 'Start Break') : `Break (${breaksRemaining})`}
                </button>
              )}
            </div>

            {mode === 'break' && <BreakActivities />}
          </section>

          <DayBoard
            isDark={isDark}
            userId={userId}
            goals={goals}
            setGoals={setGoals}
            history={history}
            onDeleteRecord={deleteRecord}
            todaySeconds={mySeconds}
            onSnapshot={(updated, action) =>
              saveGoalsSnapshot(updated, action as any, config.label)
            }
            open={docksOpen}
            onToggle={toggleDocks}
          />
        </div>
      </main>

      {showInviteModal && <InviteModal isDark={isDark} code={currentRoom?.invite_code || inviteCode} onCopy={() => { navigator.clipboard.writeText(currentRoom?.invite_code || inviteCode); onShowToast('Code copied!', 'success'); }} onClose={() => setShowInviteModal(false)} />}
      {showStatusModal && <StatusModal isDark={isDark} roomAlias={roomAlias} setRoomAlias={setRoomAlias} roomEmoji={roomEmoji} setRoomEmoji={setRoomEmoji} onSave={onSaveStatus} onClose={() => setShowStatusModal(false)} />}

      {showRules && targetOpponent && <ChallengeRulesModal isDark={isDark} opponentName={targetOpponent.name} onReady={handleReady} onCancel={() => { setShowRules(false); setTargetOpponent(null); }} />}
      {incomingChallenge && !activeChallengeId && <IncomingChallengeToast isDark={isDark} challenge={incomingChallenge} challengerName={everyone.find((e) => (e.user_id || e.id) === incomingChallenge.challenger_id)?.name || 'لاعب'} onAccepted={(id) => { setActiveChallengeId(id); refreshIncoming(); }} onDeclined={() => refreshIncoming()} />}
      {liveChallenge && liveChallenge.status === 'ready_wait' && <ReadyWaitScreen isDark={isDark} challenge={liveChallenge} currentUserId={session?.user?.id} challengerName={everyone.find((e) => (e.user_id || e.id) === liveChallenge.challenger_id)?.name || 'لاعب'} opponentName={everyone.find((e) => (e.user_id || e.id) === liveChallenge.opponent_id)?.name || 'لاعب'} onBothReady={() => {}} onCancel={() => { setActiveChallengeId(null); refreshIncoming(); }} />}
      {liveChallenge && liveChallenge.status === 'live' && <ChallengeLiveScreen isDark={isDark} challenge={liveChallenge} questions={getQuestionsFromIds(liveChallenge.question_ids)} currentUserId={session?.user?.id} opponentName={everyone.find((e) => (e.user_id || e.id) !== session?.user?.id && ((e.user_id || e.id) === liveChallenge.challenger_id || (e.user_id || e.id) === liveChallenge.opponent_id))?.name || 'خصم'} onFinished={(r) => { setResultData({ ...r, challenge: liveChallenge }); setShowResult(true); }} />}
      {showResult && resultData && <ChallengeResultScreen isDark={isDark} myUserId={session?.user?.id} challengerId={resultData.challenge.challenger_id} challengerName={everyone.find((e) => (e.user_id || e.id) === resultData.challenge.challenger_id)?.name || 'لاعب'} opponentName={everyone.find((e) => (e.user_id || e.id) === resultData.challenge.opponent_id)?.name || 'لاعب'} winnerId={resultData.winner_id} challengerScore={resultData.challenger_score} opponentScore={resultData.opponent_score} onRematch={() => { const wasC = resultData.challenge.challenger_id === session?.user?.id; const otherId = wasC ? resultData.challenge.opponent_id : resultData.challenge.challenger_id; const otherName = everyone.find((e) => (e.user_id || e.id) === otherId)?.name || 'لاعب'; setShowResult(false); setResultData(null); setActiveChallengeId(null); openRulesFor(otherId, otherName); }} onClose={() => { setShowResult(false); setResultData(null); setActiveChallengeId(null); }} />}
    </div>
  );
}

const StudyRoomLive = memo(StudyRoomLiveInner);
export default StudyRoomLive;