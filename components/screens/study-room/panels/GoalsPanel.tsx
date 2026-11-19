'use client';
import { useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { hm } from '../studyRoomData';
import type { SessionRecord } from '../hooks/useRoomHistory';
import { useCloudState } from '@/lib/useCloudState';
import SaveBadge from '../ui/SaveBadge';
import Tip from '../ui/Tip';
import { useTranslations } from "@/stores/languageStore";

export type Goal = { id: number; t: string; done: boolean; day?: string; carried?: boolean };

type Props = {
  userId?: string;
  todaySeconds: number;
  goals: Goal[];
  history: SessionRecord[];
  onAdd: (text: string) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onDeleteRecord: (id: number) => void;
  onClearHistory: () => void;
};

const PRESETS = [60, 120, 180, 240];
const fmtMin = (m: number) => (m % 60 === 0 ? `${m / 60}h` : `${Math.floor(m / 60)}h ${m % 60}m`);

export default function GoalsPanel({
  userId, todaySeconds, goals, history, onAdd, onToggle, onDelete, onDeleteRecord, onClearHistory,
}: Props) {
    const t = useTranslations('components_screens_study_room_panels_GoalsPanel');
  const [newGoal, setNewGoal] = useState('');
  const [targets, setTargets, { status }] = useCloudState(userId, 'targets', { dailyMin: 120, weeklyHours: 14 });

  const submit = () => {
    if (!newGoal.trim()) return;
    onAdd(newGoal.trim());
    setNewGoal('');
  };

  // ── Daily ring
  const todayMin = Math.floor(todaySeconds / 60);
  const dailyPct = Math.min(100, Math.round((todayMin / targets.dailyMin) * 100));
  const reached = todayMin >= targets.dailyMin;

  // ── Weekly (من الجلسات المكتملة آخر 7 أيام)
  const weekAgo = Date.now() - 7 * 86400000;
  const weekSecs = history.filter((s) => new Date(s.date).getTime() >= weekAgo).reduce((a, s) => a + s.focusSeconds, 0);
  const weekPct = Math.min(100, Math.round((weekSecs / 3600 / targets.weeklyHours) * 100));

  const doneCount = goals.filter((g) => g.done).length;

  return (
    <div className="sr-goals-wrap">
      {/* ═══ Daily target ═══ */}
      <section className="sr-card sr-target">
        <Tip text="Today's study time as a share of your daily target. The ring fills as you study and glows when you reach the target." side="bottom"><div className={`sr-ring-mini ${reached ? 'full' : ''}`} style={{ ['--p' as any]: dailyPct }}>
          <b>{dailyPct}%</b>
        </div></Tip>
        <div className="sr-target-info">
          <div className="sr-row-between">
            <h3>{t('today')}</h3>
            <SaveBadge status={status} />
          </div>
          <p className="sr-big">{hm(todaySeconds)} <span>of {fmtMin(targets.dailyMin)}</span></p>
          <p className="sr-sub">{reached ? t('target_reached_anything_extra_is') : `${fmtMin(targets.dailyMin - todayMin)} to go`}</p>
        </div>
        <div className="sr-target-ctrl">
          <Tip text="Pick your daily study target in hours." side="top"><div className="sr-seg" role="group" aria-label={t('daily_target')}>
            {PRESETS.map((m) => (
              <button key={m} className={targets.dailyMin === m ? 'on' : ''} onClick={() => setTargets((t) => ({ ...t, dailyMin: m }))}>{m / 60}h</button>
            ))}
          </div></Tip>
          <Tip text="Fine-tune your daily target in 30-minute steps." side="top"><div className="sr-stepper">
            <button aria-label={t('less')} onClick={() => setTargets((t) => ({ ...t, dailyMin: Math.max(30, t.dailyMin - 30) }))}><Minus size={14} /></button>
            <span>{fmtMin(targets.dailyMin)} / day</span>
            <button aria-label={t('more')} onClick={() => setTargets((t) => ({ ...t, dailyMin: Math.min(960, t.dailyMin + 30) }))}><Plus size={14} /></button>
          </div></Tip>
        </div>
      </section>

      {/* ═══ Weekly ═══ */}
      <section className="sr-card sr-weekly">
        <div className="sr-row-between">
          <h3>{t('this_week')}</h3>
          <Tip text="Set your weekly goal in hours." side="bottom"><div className="sr-stepper sm">
            <button aria-label={t('less')} onClick={() => setTargets((t) => ({ ...t, weeklyHours: Math.max(1, t.weeklyHours - 1) }))}><Minus size={12} /></button>
            <span>{targets.weeklyHours}h goal</span>
            <button aria-label={t('more')} onClick={() => setTargets((t) => ({ ...t, weeklyHours: Math.min(112, t.weeklyHours + 1) }))}><Plus size={12} /></button>
          </div></Tip>
        </div>
        <Tip text="Focus time from your completed sessions in the last 7 days, compared with your weekly goal." side="top"><div className="sr-bar"><i style={{ width: `${weekPct}%` }} /></div></Tip>
        <p className="sr-sub">{hm(weekSecs)} from completed sessions · {weekPct}%</p>
      </section>

      {/* ═══ Tasks ═══ */}
      <section>
        <div className="sr-row-between" style={{ marginBottom: 8 }}>
          <h3 className="sr-h3">{t('session_tasks')}</h3>
          <span className="sr-sub">{doneCount} of {goals.length} done</span>
        </div>

        <div className="sr-add">
          <input
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder={t('what_will_you_finish_in')}
            aria-label={t('new_task')}
          />
          <button onClick={submit}>{t('add')}</button>
        </div>

        <ul className="sr-goals">
          {goals.map((g) => (
            <li key={g.id} className={g.done ? 'done' : ''}>
              <label>
                <input type="checkbox" checked={g.done} onChange={() => onToggle(g.id)} />
                <span>{g.t}</span>
              </label>
              {g.carried && !g.done && <Tip text="You did not finish this task earlier, so it moved to today." side="top"><em className="sr-carried"><RotateCcw size={10} /> {t('carried')}</em></Tip>}
              <button onClick={() => onDelete(g.id)} aria-label={t('delete_task')}>✕</button>
            </li>
          ))}
          {!goals.length && <li className="empty">{t('no_tasks_yet_add_one')}</li>}
        </ul>
      </section>

      {/* ═══ History ═══ */}
      <div className="sr-history">
        <div className="sr-history-head">
          <h3>{t('session_history')}</h3>
          {history.length > 0 && (
            <button onClick={() => { if (confirm('Clear all session history?')) onClearHistory(); }}>{t('clear_all')}</button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="sr-history-empty">{t('no_sessions_yet_complete_a')}</p>
        ) : (
          <ul className="sr-history-list">
            {history.map((s) => {
              const d = new Date(s.date);
              const now = Date.now();
              const isToday = d.toDateString() === new Date(now).toDateString();
              const isYest = new Date(now - 86400000).toDateString() === d.toDateString();
              const day = isToday ? 'Today' : isYest ? 'Yesterday' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
              const achieved = s.goalsDone.length;
              return (
                <li key={s.id} className="sr-history-item">
                  <div className="sr-history-row">
                    <span className="sr-history-date">{day} · {time}</span>
                    <button onClick={() => onDeleteRecord(s.id)} aria-label={t('delete_this_record')} className="sr-history-del" title={t('delete_record')}>✕</button>
                    <span className="sr-history-time">{hm(s.focusSeconds)}</span>
                  </div>
                  <div className="sr-history-meta">
                    <span className="sr-history-config">{s.configLabel}</span>
                    {s.goalsTotal > 0 && (
                      <span className={`sr-history-goals ${achieved === s.goalsTotal ? 'all' : ''}`}>✓ {achieved}/{s.goalsTotal} goals</span>
                    )}
                  </div>
                  {s.goalsDone.length > 0 && (
                    <ul className="sr-history-achievements">
                      {s.goalsDone.map((t, i) => <li key={i}>• {t}</li>)}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
