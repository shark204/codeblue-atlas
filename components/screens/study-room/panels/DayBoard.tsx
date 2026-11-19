'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check, ChevronDown, ChevronLeft, ChevronRight, Clock, CalendarDays, Copy, Flame, ListChecks, Minus, Plus, Trash2, TrendingUp, Trophy,
} from 'lucide-react';
import { useCloudState } from '@/lib/useCloudState';
import PlannerPanel from './PlannerPanel';
import { useTranslations } from "@/stores/languageStore";

/* ═══════════════════════════════════════════════════════════════════
 * DayBoard — always-open dock next to the timer.
 * Two pages, switched with the big toggle under the header:
 *   PLAN     week strip, the day's tasks (any day), copy to other days, daily goal,
 *            and the exam planner (exam date + weekly subjects) as a collapsible card
 *   PROGRESS weekly equation + chart, 12-week history heatmap, sessions of any day
 * Nothing is deleted automatically: past days stay as your record.
 * ═══════════════════════════════════════════════════════════════════ */

export type DayGoal = { id: number; t: string; done: boolean; day?: string; carried?: boolean };
export type HistoryRecord = {
  id: number; date: string; focusSeconds: number;
  goalsDone?: string[]; goalsTotal?: number; configLabel?: string;
};

type Props = {
  isDark: boolean;
  userId?: string;
  goals: DayGoal[];
  setGoals: (g: DayGoal[]) => void;
  history: HistoryRecord[];
  onDeleteRecord: (id: number) => void;
  todaySeconds: number; // live seconds studied today (from the room)
  onSnapshot?: (g: DayGoal[], action: 'add' | 'toggle' | 'delete' | 'copy' | 'move') => void;
  open: boolean;          // shared with NotesDock: both docks open or closed together
  onToggle: () => void;
};

/* One shared open/closed state for both docks (remembered between visits). */
export function useDocksOpen(): [boolean, () => void] {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    try { if (localStorage.getItem('sr-docks') === '0') setOpen(false); } catch {}
  }, []);
  const toggle = () => setOpen((o) => {
    const n = !o;
    try { localStorage.setItem('sr-docks', n ? '1' : '0'); } catch {}
    return n;
  });
  return [open, toggle];
}

/* ───────────── date helpers (all local time, key = YYYY-MM-DD) ───────────── */
const WEEK_START = 6; // 6 = Saturday, 0 = Sunday, 1 = Monday
const pad = (n: number) => String(n).padStart(2, '0');
const key = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (k: string) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (k: string, n: number) => { const d = parse(k); d.setDate(d.getDate() + n); return key(d); };
const weekStartKey = (k: string) => {
  const d = parse(k);
  d.setDate(d.getDate() - ((d.getDay() - WEEK_START + 7) % 7));
  return key(d);
};
const fmt = (k: string, o: Intl.DateTimeFormatOptions) => parse(k).toLocaleDateString('en-US', o);
const hm = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
};

const goalDay = (g: DayGoal, today: string) => g.day || (g.id > 1e12 ? key(new Date(g.id)) : today);

const level = (sec: number, done: number) => {
  const a = sec <= 0 ? 0 : sec < 1800 ? 1 : sec < 5400 ? 2 : sec < 10800 ? 3 : 4;
  const b = done <= 0 ? 0 : done === 1 ? 1 : done <= 3 ? 2 : done <= 5 ? 3 : 4;
  return Math.max(a, b);
};

/* ───────────── small pieces ───────────── */
function Eq({ label, a, b, r }: { label: string; a: [string, string | number]; b: [string, string | number]; r: [string, string | number] }) {
  return (
    <div className="db-eq">
      <span className="db-eq-l">{label}</span>
      <div className="db-eq-row">
        <div><small>{a[0]}</small><b>{a[1]}</b></div>
        <i>−</i>
        <div><small>{b[0]}</small><b>{b[1]}</b></div>
        <i>=</i>
        <div className="res"><small>{r[0]}</small><b>{r[1]}</b></div>
      </div>
    </div>
  );
}

function CopyPanel({
  base, count, onConfirm, onCancel,
}: { base: string; count: number; onConfirm: (days: string[]) => void; onCancel: () => void }) {
    const t = useTranslations('components_screens_study_room_panels_DayBoard');
  const [picked, setPicked] = useState<string[]>([]);
  const weekEnd = addDays(weekStartKey(base), 6);
  const rest: string[] = [];
  for (let k = addDays(base, 1); k <= weekEnd; k = addDays(k, 1)) rest.push(k);
  const toggle = (k: string) => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const addAll = (list: string[]) => setPicked((p) => Array.from(new Set([...p, ...list])));
  const next14 = Array.from({ length: 14 }, (_, i) => addDays(base, i + 1));

  return (
    <div className="db-copy">
      <p>Copy {count} {count === 1 ? 'task' : 'tasks'} to:</p>
      <div className="db-presets">
        <button onClick={() => addAll([addDays(base, 1)])}>{t('tomorrow')}</button>
        {rest.length > 0 && <button onClick={() => addAll(rest)}>{t('rest_of_this_week')}</button>}
        <button onClick={() => addAll([addDays(base, 7)])}>{t('same_day_next_week')}</button>
      </div>
      <div className="db-pick">
        {next14.map((k) => (
          <button key={k} className={picked.includes(k) ? 'on' : ''} onClick={() => toggle(k)} aria-pressed={picked.includes(k)}>
            <small>{fmt(k, { weekday: 'short' })}</small>
            <b>{parse(k).getDate()}</b>
          </button>
        ))}
      </div>
      <div className="db-copy-act">
        <button className="ghost" onClick={onCancel}>{t('cancel')}</button>
        <button className="go" disabled={picked.length === 0} onClick={() => onConfirm(picked)}>
          Copy to {picked.length} {picked.length === 1 ? 'day' : 'days'}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════ Component ═══════════════════════════ */
export default function DayBoard({
  isDark, userId, goals, setGoals, history, onDeleteRecord, todaySeconds, onSnapshot, open, onToggle,
}: Props) {
    const t = useTranslations('components_screens_study_room_panels_DayBoard');
  const today = key(new Date());
  const [sel, setSel] = useState(today);
  const [text, setText] = useState('');
  const [copyIds, setCopyIds] = useState<number[] | null>(null);
  const [targetHrs, setTargetHrs] = useCloudState<number>(userId, 'weekly-target-hours', 20);
  const [dailyMin, setDailyMin] = useCloudState<number>(userId, 'daily-target-minutes', 120);
  const [page, setPageState] = useState<'plan' | 'progress'>('plan');
  useEffect(() => {
    try { if (localStorage.getItem('db-page') === 'progress') setPageState('progress'); } catch {}
  }, []);
  const setPage = (p: 'plan' | 'progress') => {
    setPageState(p);
    try { localStorage.setItem('db-page', p); } catch {}
  };
  const dMin = Math.max(15, Number(dailyMin) || 120);
  const [plannerOpen, setPlannerOpen] = useState(false);
  useEffect(() => {
    try { if (localStorage.getItem('db-planner-open') === '1') setPlannerOpen(true); } catch {}
  }, []);
  const togglePlanner = () => setPlannerOpen((o) => {
    try { localStorage.setItem('db-planner-open', o ? '0' : '1'); } catch {}
    return !o;
  });

  /* ── per-day numbers: planned / done tasks and focused seconds ── */
  const byDay = useMemo(() => {
    const m = new Map<string, { planned: number; done: number; sec: number }>();
    const get = (k: string) => {
      let v = m.get(k);
      if (!v) { v = { planned: 0, done: 0, sec: 0 }; m.set(k, v); }
      return v;
    };
    for (const g of goals) { const v = get(goalDay(g, today)); v.planned++; if (g.done) v.done++; }
    for (const r of history) get(key(new Date(r.date))).sec += r.focusSeconds;
    const t = get(today);
    t.sec = Math.max(t.sec, todaySeconds); // live time can be ahead of saved sessions
    return m;
  }, [goals, history, todaySeconds, today]);
  const stat = (k: string) => byDay.get(k) ?? { planned: 0, done: 0, sec: 0 };

  /* ── achievements ── */
  const isActive = (k: string) => stat(k).done > 0 || stat(k).sec >= 600;
  let streak = 0;
  let cursor = today;
  if (!isActive(cursor)) cursor = addDays(cursor, -1);
  while (isActive(cursor) && streak < 3650) { streak++; cursor = addDays(cursor, -1); }
  const totalDone = goals.filter((g) => g.done).length;
  let totalSec = 0;
  byDay.forEach((v) => { totalSec += v.sec; });

  /* ── selected day ── */
  const dayGoals = goals.filter((g) => goalDay(g, today) === sel);
  const s = stat(sel);
  const pct = s.planned ? s.done / s.planned : 0;
  const rel = sel === today ? 'Today' : sel === addDays(today, -1) ? 'Yesterday' : sel === addDays(today, 1) ? 'Tomorrow' : fmt(sel, { weekday: 'long' });
  const left = s.planned - s.done;
  const message =
    s.planned === 0 ? (sel < today ? 'Nothing was planned this day.' : 'Nothing planned yet. Add your first task.')
    : left === 0 ? 'All done. Great work!'
    : sel < today ? `${left} not finished`
    : `${left} left`;

  /* ── selected week ── */
  const wStart = weekStartKey(sel);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(wStart, i));
  const wEnd = weekDays[6];
  let planned = 0, done = 0, sec = 0, missed = 0;
  for (const k of weekDays) {
    const v = stat(k);
    planned += v.planned; done += v.done; sec += v.sec;
    if (k < today) missed += v.planned - v.done;
  }
  const targetSec = Math.max(1, Number(targetHrs) || 20) * 3600;
  const leftSec = Math.max(0, targetSec - sec);
  const daysLeft = today > wEnd ? 0 : today < wStart ? 7 : weekDays.filter((k) => k >= today).length;
  const pace = daysLeft > 0 ? leftSec / daysLeft : 0;
  const paceText =
    leftSec === 0 ? 'Target reached. Everything from here is a bonus.'
    : daysLeft > 0 ? `To hit your target: ${hm(pace)} a day for ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}.`
    : `This week ended ${hm(leftSec)} short of the target.`;

  // cumulative focus vs. an even pace to the target
  let acc = 0;
  const cum = weekDays.map((k) => (k > today ? null : (acc += stat(k).sec)));
  const maxY = Math.max(targetSec, acc, 1);
  const cx = (i: number) => 22 + i * 40;
  const cy = (v: number) => 74 - (v / maxY) * 62;
  const paceLine = weekDays.map((_, i) => `${cx(i)},${cy((targetSec * (i + 1)) / 7)}`).join(' ');
  const cumPts = cum.map((v, i) => (v === null ? null : `${cx(i)},${cy(v)}`)).filter(Boolean) as string[];

  const overdue = goals.filter((g) => !g.done && goalDay(g, today) < today);

  /* ── actions ── */
  const commit = (next: DayGoal[], action: 'add' | 'toggle' | 'delete' | 'copy' | 'move') => {
    setGoals(next);
    onSnapshot?.(next, action);
  };
  const add = () => {
    const t = text.trim();
    if (!t) return;
    commit([...goals, { id: Date.now(), t, done: false, day: sel }], 'add');
    setText('');
  };
  const toggle = (id: number) => commit(goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)), 'toggle');
  const remove = (id: number) => commit(goals.filter((g) => g.id !== id), 'delete');
  const moveOverdue = () =>
    commit(goals.map((g) => (!g.done && goalDay(g, today) < today ? { ...g, day: today, carried: true } : g)), 'move');
  const copyTo = (days: string[]) => {
    if (!copyIds) return;
    const src = goals.filter((g) => copyIds.includes(g.id));
    const next = [...goals];
    let n = 0;
    for (const d of days) {
      for (const g of src) {
        const exists = next.some((x) => goalDay(x, today) === d && x.t.trim().toLowerCase() === g.t.trim().toLowerCase());
        if (!exists) next.push({ id: Date.now() + n++, t: g.t, done: false, day: d });
      }
    }
    commit(next, 'copy');
    setCopyIds(null);
  };

  /* ── history heatmap: last 12 weeks ── */
  const heatStart = addDays(weekStartKey(today), -77);
  const cells = Array.from({ length: 84 }, (_, i) => addDays(heatStart, i));
  const sessions = history
    .filter((r) => key(new Date(r.date)) === sel)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const range = `${fmt(wStart, { month: 'short', day: 'numeric' })} – ${fmt(wEnd, { month: 'short', day: 'numeric' })}`;
  const ringC = 2 * Math.PI * 22;

  if (!open) {
    return (
      <aside className={`db closed ${isDark ? 'dark' : 'light'}`} aria-label={t('plan_and_progress_hidden')}>
        <style>{css}</style>
        <button className="db-fold" onClick={onToggle} aria-label={t('show_side_panels')} title={t('show_notes_and_plan')}>
          <ChevronLeft size={16} />
        </button>
        <Trophy size={18} className="rail-ic" />
        <span className="rail-lb">{t('plan_progress')}</span>
      </aside>
    );
  }

  return (
    <aside className={`db ${isDark ? 'dark' : 'light'}`} aria-label={t('your_plan_and_progress')}>
      <style>{css}</style>

      {/* header */}
      <header className="db-head">
        <div className="db-title"><Trophy size={16} /> {t('my_progress')}</div>
        <button className="db-fold" onClick={onToggle} aria-label={t('hide_side_panels')} title={t('hide_notes_and_plan')}>
          <ChevronRight size={16} />
        </button>
        <div className="db-chips">
          <span className="chip fire" title={t('days_in_a_row_with')}><Flame size={13} /> {streak}d</span>
          <span className="chip" title={t('tasks_you_have_finished_all')}><Check size={13} /> {totalDone}</span>
          <span className="chip" title={t('total_focus_time_all_time')}><Clock size={13} /> {hm(totalSec)}</span>
        </div>
      </header>

      {/* page switch */}
      <div className="db-toggle" data-page={page} role="tablist" aria-label={t('choose_page')}>
        <i className="ind" />
        <button role="tab" aria-selected={page === 'plan'} onClick={() => setPage('plan')}><ListChecks size={16} /> {t('plan')}</button>
        <button role="tab" aria-selected={page === 'progress'} onClick={() => setPage('progress')}><TrendingUp size={16} /> {t('progress')}</button>
      </div>

      {/* week navigation */}
      <div className="db-nav">
        <button aria-label={t('previous_week')} onClick={() => setSel(addDays(sel, -7))}><ChevronLeft size={16} /></button>
        <div className="db-range"><b>{range}</b></div>
        <button aria-label={t('next_week')} onClick={() => setSel(addDays(sel, 7))}><ChevronRight size={16} /></button>
        <button className="today" onClick={() => setSel(today)} disabled={sel === today}>{t('today')}</button>
        <label className="jump" title={t('jump_to_any_date')}>
          <CalendarDays size={15} />
          <input type="date" value={sel} onChange={(e) => e.target.value && setSel(e.target.value)} aria-label={t('jump_to_date')} />
        </label>
      </div>

      {page === 'plan' && (
        <div className="db-page" key="plan">
      {/* week strip */}
      <div className="db-week" role="tablist" aria-label={t('days_of_the_week')}>
        {weekDays.map((k) => {
          const v = stat(k);
          return (
            <button
              key={k}
              role="tab"
              aria-selected={k === sel}
              className={`db-day ${k === sel ? 'sel' : ''} ${k === today ? 'now' : ''} ${k > today ? 'fut' : ''}`}
              onClick={() => { setSel(k); setCopyIds(null); }}
            >
              <small>{fmt(k, { weekday: 'short' })}</small>
              <b>{parse(k).getDate()}</b>
              <i className="bar"><u style={{ width: `${v.planned ? (v.done / v.planned) * 100 : 0}%` }} /></i>
              <span>{v.planned ? `${v.done}/${v.planned}` : '–'}</span>
            </button>
          );
        })}
      </div>

      {/* overdue */}
      {overdue.length > 0 && (
        <div className="db-overdue">
          <span>{overdue.length} unfinished {overdue.length === 1 ? 'task' : 'tasks'} from earlier days</span>
          <button onClick={moveOverdue}>{t('move_to_today')}</button>
        </div>
      )}

      {/* the day */}
      <section className="db-card">
        <div className="db-dayhead">
          <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
            <circle cx="28" cy="28" r="22" className="trk" />
            <circle cx="28" cy="28" r="22" className="val" strokeDasharray={ringC} strokeDashoffset={ringC * (1 - pct)} />
            <text x="28" y="32" textAnchor="middle">{Math.round(pct * 100)}%</text>
          </svg>
          <div className="grow">
            <h3>{rel} <small>{fmt(sel, { month: 'short', day: 'numeric' })}</small></h3>
            <p className={left === 0 && s.planned > 0 ? 'ok' : ''}>{message}</p>
            <p className="sub"><Clock size={12} /> {hm(s.sec)} focused</p>
          </div>
          {dayGoals.length > 0 && (
            <button className="mini" onClick={() => setCopyIds(dayGoals.map((g) => g.id))} title={t('copy_all_of_this_day')}>
              <Copy size={13} /> {t('copy_day')}
                                              </button>
          )}
        </div>

        <div className="db-dtarget">
          <div className="db-dt-top">
            <span>{t('daily_focus_goal')}</span>
            <div>
              <button aria-label={t('lower_daily_goal')} onClick={() => setDailyMin(Math.max(15, dMin - 15))}><Minus size={12} /></button>
              <b>{hm(dMin * 60)}</b>
              <button aria-label={t('raise_daily_goal')} onClick={() => setDailyMin(Math.min(720, dMin + 15))}><Plus size={12} /></button>
            </div>
          </div>
          <div className="db-dt-bar"><u style={{ width: `${Math.min(100, (s.sec / (dMin * 60)) * 100)}%` }} /></div>
          <small>{s.sec >= dMin * 60 ? t('daily_goal_reached') : `${hm(s.sec)} of ${hm(dMin * 60)}`}</small>
        </div>

        <div className="db-add">
          <input
            value={text}
            maxLength={120}
            placeholder={sel < today ? 'Add a task to this day…' : sel === today ? 'What will you finish today?' : 'Plan a task for this day…'}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            aria-label={t('new_task')}
          />
          <button onClick={add} disabled={!text.trim()} aria-label={t('add_task')}><Plus size={16} /></button>
        </div>

        <ul className="db-list">
          {dayGoals.map((g) => (
            <li key={g.id} className={g.done ? 'done' : ''}>
              <button className="ck" aria-pressed={g.done} aria-label={g.done ? 'Mark as not done' : 'Mark as done'} onClick={() => toggle(g.id)}>
                {g.done && <Check size={14} strokeWidth={3} />}
              </button>
              <span className="t">{g.t}{g.carried && <em>{t('carried_over')}</em>}</span>
              <button className="ic" title={t('copy_to_other_days')} aria-label={t('copy_to_other_days')} onClick={() => setCopyIds([g.id])}><Copy size={14} /></button>
              <button className="ic del" title={t('delete')} aria-label={t('delete_task')} onClick={() => remove(g.id)}><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>

        {copyIds && <CopyPanel base={sel} count={copyIds.length} onConfirm={copyTo} onCancel={() => setCopyIds(null)} />}
      </section>

        <section className="db-card db-planner-card">
          <button className="db-rowbtn" aria-expanded={plannerOpen} onClick={togglePlanner}>
            <CalendarDays size={16} />
            <span>{t('exam_date_weekly_subjects')}</span>
            <ChevronDown size={16} className={`chev ${plannerOpen ? 'up' : ''}`} />
          </button>
          {plannerOpen && (
            <div className="db-planner">
              <PlannerPanel userId={userId} />
            </div>
          )}
        </section>

        </div>
      )}

      {page === 'progress' && (
        <div className="db-page" key="progress">
      {/* weekly equation */}
      <section className="db-card">
        <div className="db-cardhead"><h4>{t('week_equation')}</h4><span>{range}</span></div>
        <Eq label={t('tasks')} a={['Planned', planned]} b={['Done', done]} r={['Left', Math.max(0, planned - done)]} />
        <Eq label={t('focus')} a={['Target', `${Number(targetHrs) || 20}h`]} b={['Studied', hm(sec)]} r={['Left', hm(leftSec)]} />

        <div className="db-target">
          <span>{t('weekly_focus_target')}</span>
          <div>
            <button aria-label={t('lower_target')} onClick={() => setTargetHrs(Math.max(1, (Number(targetHrs) || 20) - 1))}><Minus size={13} /></button>
            <b>{Number(targetHrs) || 20}h</b>
            <button aria-label={t('raise_target')} onClick={() => setTargetHrs(Math.min(80, (Number(targetHrs) || 20) + 1))}><Plus size={13} /></button>
          </div>
        </div>

        <p className="db-pace">{paceText}</p>
        {missed > 0 && <p className="db-missed">{missed} planned {missed === 1 ? 'task' : 'tasks'} from earlier days this week are still open.</p>}

        <svg className="db-chart" viewBox="0 0 280 96" role="img" aria-label={t('cumulative_focus_this_week_compared')}>
          <line x1="22" y1="74" x2="262" y2="74" className="axis" />
          <polyline points={paceLine} className="pace" />
          {cumPts.length > 1 && <polyline points={cumPts.join(' ')} className="cum" />}
          {cum.map((v, i) => (v === null ? null : <circle key={i} cx={cx(i)} cy={cy(v)} r="3" className="dot" />))}
          {weekDays.map((k, i) => (
            <text key={k} x={cx(i)} y="90" textAnchor="middle" className={k === today ? 'lbl now' : 'lbl'}>{fmt(k, { weekday: 'narrow' })}</text>
          ))}
        </svg>
        <p className="db-legend"><i className="l-cum" /> {t('your_focus_cumulative')} <i className="l-pace" /> {t('even_pace_to_target')}</p>
      </section>

      {/* history */}
      <section className="db-card">
        <div className="db-cardhead"><h4>{t('history')}</h4><span>{t('last_12_weeks_tap_a')}</span></div>
        <div className="db-heat" role="grid" aria-label={t('study_history')}>
          {cells.map((k) => {
            const v = stat(k);
            const fut = k > today;
            return (
              <button
                key={k}
                role="gridcell"
                className={`c l${fut ? 0 : level(v.sec, v.done)} ${fut ? 'fut' : ''} ${v.planned && fut ? 'plan' : ''} ${k === sel ? 'sel' : ''} ${k === today ? 'now' : ''}`}
                title={`${fmt(k, { weekday: 'short', month: 'short', day: 'numeric' })} · ${hm(v.sec)} · ${v.done}/${v.planned} tasks`}
                aria-label={`${fmt(k, { weekday: 'long', month: 'long', day: 'numeric' })}, ${hm(v.sec)} focused, ${v.done} of ${v.planned} tasks done`}
                onClick={() => { setSel(k); setCopyIds(null); }}
              />
            );
          })}
        </div>
        <p className="db-legend">{t('less')} <i className="c l0" /><i className="c l1" /><i className="c l2" /><i className="c l3" /><i className="c l4" /> {t('more')}</p>

        <div className="db-shrow">
          <h5 className="db-sh">{rel === 'Today' || rel === 'Yesterday' || rel === 'Tomorrow' ? rel : fmt(sel, { weekday: 'long', month: 'short', day: 'numeric' })} · sessions</h5>
          <button className="mini" onClick={() => setPage('plan')}><ListChecks size={13} /> {t('open_this_day_s_plan')}</button>
        </div>
        {sessions.length === 0 ? (
          <p className="db-empty">{t('no_saved_sessions_on_this')}</p>
        ) : (
          <ul className="db-sess">
            {sessions.map((r) => (
              <li key={r.id}>
                <b>{new Date(r.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</b>
                <span>{hm(r.focusSeconds)}{r.configLabel ? ` · ${r.configLabel}` : ''}</span>
                {typeof r.goalsTotal === 'number' && <em>{r.goalsDone?.length ?? 0}/{r.goalsTotal} tasks</em>}
                <button className="ic del" aria-label={t('delete_this_record')} onClick={() => onDeleteRecord(r.id)}><Trash2 size={13} /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
        </div>
      )}
    </aside>
  );
}

/* ═══════════════════════════ Styles (self-contained) ═══════════════════════════ */
const css = `
/* layout: Notes (left) | timer (middle) | DayBoard (right). "closed" collapses both to slim rails. */
.sr-workspace{
  --l:clamp(240px,20vw,340px); --r:clamp(300px,26vw,430px);
  display:grid; grid-template-columns:var(--l) minmax(0,1fr) var(--r); gap:20px; align-items:start; width:100%;
  transition:grid-template-columns .3s ease;
}
.sr-workspace.closed{grid-template-columns:48px minmax(0,1fr) 48px}
.sr-workspace > .sr-stage{min-width:0}
@media (max-width:1100px){
  .sr-workspace, .sr-workspace.closed{grid-template-columns:1fr}
  .sr-workspace > .sr-stage{order:1}
  .sr-workspace > .db{order:2; position:static !important; height:auto !important}
  .sr-workspace > .nd{order:3; position:static !important; height:auto !important}
}

/* top row of the stage: mode pill + the people strip, side by side */
.sr-toprow{display:flex; align-items:center; justify-content:center; gap:12px; flex-wrap:wrap; margin-bottom:14px}
.sr-toprow .sr-mode-indicator{margin:0}
.sr-toprow .sr-strip{position:static !important; inset:auto !important; transform:none !important; margin:0 !important; padding:0 !important;
  width:auto !important; max-width:100%; background:none !important; border:0 !important; box-shadow:none !important;
  display:flex; gap:6px; flex-wrap:wrap; justify-content:center; overflow:visible}

.db-fold{flex:none; width:30px; height:30px; display:grid; place-items:center; border-radius:50%; background:var(--fld); border:1px solid var(--line); transition:border-color .2s, background .2s}
.db-fold:hover{border-color:var(--cy); background:rgba(56,214,245,.14)}
.db.closed{height:auto; padding:10px 0; display:flex; flex-direction:column; align-items:center; gap:12px; overflow:visible}
.db.closed .rail-ic{color:var(--warn)}
.rail-lb{writing-mode:vertical-rl; font-size:12px; font-weight:700; color:var(--mut); letter-spacing:.03em}
@media (max-width:1100px){
  .db.closed{flex-direction:row; justify-content:center; padding:10px 14px}
  .rail-lb{writing-mode:horizontal-tb}
}

.db{
  --card:rgba(15,23,42,.55); --fld:rgba(255,255,255,.06); --line:rgba(255,255,255,.1);
  --ink:#eef2ff; --mut:#9aa7cf; --cy:#38d6f5; --vi:#a78bfa; --ok:#34d399; --warn:#fbbf24; --bad:#fb7185;
  position:sticky; top:12px; height:clamp(520px, calc(100vh - 150px), 760px); overflow-y:auto; overscroll-behavior:contain;
  padding:14px; border-radius:24px; color:var(--ink);
  background:linear-gradient(180deg, rgba(20,28,66,.62), rgba(10,15,40,.68));
  border:1px solid var(--line); backdrop-filter:blur(22px); -webkit-backdrop-filter:blur(22px);
  box-shadow:0 30px 80px -30px rgba(0,0,0,.7), 0 0 60px -30px rgba(56,214,245,.3);
  scrollbar-width:thin; scrollbar-color:rgba(148,163,184,.3) transparent;
}
.db.light{
  --card:rgba(255,255,255,.7); --fld:rgba(15,23,42,.05); --line:rgba(15,23,42,.12);
  --ink:#0f172a; --mut:#475569; --cy:#0284c7; --vi:#7c3aed; --ok:#059669; --warn:#b45309; --bad:#e11d48;
  background:linear-gradient(180deg, rgba(255,255,255,.86), rgba(240,249,255,.8));
  box-shadow:0 24px 60px -24px rgba(14,116,144,.3);
}
.db *{box-sizing:border-box}
:where(.db) button{font:inherit; color:inherit; cursor:pointer; border:0; background:none}
.db :focus-visible{outline:2px solid var(--cy); outline-offset:2px}
.db button:disabled{opacity:.45; cursor:not-allowed}
.db small{font-size:11px; color:var(--mut)}

.db-toggle{position:relative; display:grid; grid-template-columns:1fr 1fr; padding:4px; border-radius:16px; background:var(--fld); border:1px solid var(--line); margin-bottom:12px}
.db-toggle .ind{position:absolute; top:4px; bottom:4px; inset-inline-start:4px; width:calc(50% - 4px); border-radius:12px; background:linear-gradient(135deg,#1d74ee,#5b3fd6); box-shadow:0 8px 20px -8px rgba(37,99,235,.8); transition:inset-inline-start .3s cubic-bezier(.3,.9,.3,1)}
.db-toggle[data-page=progress] .ind{inset-inline-start:50%}
.db-toggle button{position:relative; z-index:1; display:flex; align-items:center; justify-content:center; gap:7px; height:42px; font-size:14px; font-weight:700; color:var(--mut); transition:color .2s}
.db-toggle button[aria-selected=true]{color:#fff}
.db-page{animation:dbfade .28s both}
@keyframes dbfade{from{opacity:0; transform:translateY(6px)} to{opacity:1; transform:none}}
.db-dtarget{margin-bottom:12px; padding:10px 12px; border-radius:12px; background:var(--fld); border:1px solid var(--line)}
.db-dt-top{display:flex; align-items:center; justify-content:space-between; gap:8px; font-size:12.5px; font-weight:700; color:var(--mut); margin-bottom:8px}
.db-dt-top div{display:flex; align-items:center; gap:8px}
.db-dt-top button{width:24px; height:24px; display:grid; place-items:center; border-radius:7px; background:var(--card); border:1px solid var(--line)}
.db-dt-top b{min-width:44px; text-align:center; color:var(--ink)}
.db-dt-bar{height:6px; border-radius:6px; background:var(--line); overflow:hidden; margin-bottom:5px}
.db-dt-bar u{display:block; height:100%; border-radius:6px; background:linear-gradient(90deg,var(--cy),var(--vi)); transition:width .5s}
.db-planner-card{padding:0; overflow:hidden}
.db-rowbtn{width:100%; display:flex; align-items:center; gap:8px; padding:14px; font-size:14px; font-weight:800; text-align:start}
.db-rowbtn svg:first-child{color:var(--cy)}
.db-rowbtn span{flex:1}
.db-rowbtn .chev{color:var(--mut); transition:transform .2s}
.db-rowbtn .chev.up{transform:rotate(180deg)}
.db-planner{padding:0 14px 14px}
.db-planner > *{width:100%; max-width:100%; min-width:0; margin-inline:0}
.db-planner *{max-width:100%; min-width:0}
.db-planner [role="tablist"]{flex-wrap:wrap}
.db-shrow{display:flex; align-items:center; justify-content:space-between; gap:8px; margin:14px 0 8px}
.db-shrow .db-sh{margin:0}
.db-head{display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; margin-bottom:12px}
.db-title{display:flex; align-items:center; gap:7px; font-weight:800; font-size:15px; flex:1}
.db-title svg{color:var(--warn)}
.db-chips{display:flex; gap:6px; flex-wrap:wrap; flex-basis:100%}
.chip{display:inline-flex; align-items:center; gap:5px; padding:4px 9px; border-radius:999px; font-size:12px; font-weight:700; background:var(--fld); border:1px solid var(--line)}
.chip.fire{color:var(--warn)}

.db-nav{display:flex; align-items:center; gap:6px; margin-bottom:10px}
.db-nav > button:not(.today), .jump{width:32px; height:32px; display:grid; place-items:center; border-radius:10px; background:var(--fld); border:1px solid var(--line)}
.db-nav > button:hover, .jump:hover{border-color:var(--cy)}
.db-range{flex:1; text-align:center; font-size:13px}
.db-nav .today{padding:0 12px; height:32px; border-radius:10px; font-size:12px; font-weight:700; background:rgba(56,214,245,.14); border:1px solid var(--cy); color:var(--ink)}
.jump{position:relative; overflow:hidden}
.jump input{position:absolute; inset:0; opacity:0; width:100%; height:100%; cursor:pointer}

.db-week{display:grid; grid-template-columns:repeat(7,1fr); gap:5px; margin-bottom:12px}
.db-day{display:flex; flex-direction:column; align-items:center; gap:2px; padding:7px 2px 6px; border-radius:12px; background:var(--fld); border:1px solid transparent; transition:transform .15s, border-color .2s, background .2s}
.db-day:hover{transform:translateY(-1px); border-color:var(--line)}
.db-day b{font-size:15px; line-height:1}
.db-day span{font-size:10px; color:var(--mut); font-weight:600}
.db-day .bar{display:block; width:70%; height:3px; border-radius:3px; background:var(--line); overflow:hidden; margin:2px 0}
.db-day .bar u{display:block; height:100%; background:var(--ok); transition:width .4s}
.db-day.fut{opacity:.8}
.db-day.now b{color:var(--cy)}
.db-day.sel{background:rgba(56,214,245,.14); border-color:var(--cy)}

.db-overdue{display:flex; align-items:center; justify-content:space-between; gap:8px; padding:9px 12px; margin-bottom:10px; border-radius:12px; font-size:12.5px; font-weight:600;
  background:rgba(251,191,36,.12); border:1px solid rgba(251,191,36,.35); color:var(--warn)}
.db-overdue button{padding:5px 10px; border-radius:8px; font-size:12px; font-weight:700; background:rgba(251,191,36,.2); color:inherit}

.db-card{padding:14px; border-radius:18px; background:var(--card); border:1px solid var(--line); margin-bottom:10px}
.db-cardhead{display:flex; align-items:baseline; justify-content:space-between; gap:8px; margin-bottom:10px}
.db-cardhead h4{margin:0; font-size:14px; font-weight:800}
.db-cardhead span{font-size:11.5px; color:var(--mut)}

.db-dayhead{display:flex; align-items:center; gap:12px; margin-bottom:12px}
.db-dayhead .grow{flex:1; min-width:0}
.db-dayhead h3{margin:0; font-size:17px; font-weight:800; display:flex; align-items:baseline; gap:8px}
.db-dayhead p{margin:2px 0 0; font-size:12.5px; color:var(--mut); font-weight:600}
.db-dayhead p.ok{color:var(--ok)}
.db-dayhead p.sub{display:flex; align-items:center; gap:5px; font-size:12px}
.db-dayhead svg circle{fill:none; stroke-width:5}
.db-dayhead .trk{stroke:var(--line)}
.db-dayhead .val{stroke:var(--ok); stroke-linecap:round; transform:rotate(-90deg); transform-origin:50% 50%; transition:stroke-dashoffset .5s}
.db-dayhead text{fill:var(--ink); font-size:12px; font-weight:800}
.mini{display:inline-flex; align-items:center; gap:5px; padding:6px 10px; border-radius:10px; font-size:12px; font-weight:700; background:var(--fld); border:1px solid var(--line)}
.mini:hover{border-color:var(--cy)}

.db-add{display:flex; gap:6px; margin-bottom:10px}
.db-add input{flex:1; min-width:0; height:42px; padding:0 13px; border-radius:12px; font:inherit; font-size:14px; color:var(--ink); background:var(--fld); border:1px solid var(--line)}
.db-add input::placeholder{color:var(--mut)}
.db-add input:focus{outline:none; border-color:var(--cy); box-shadow:0 0 0 3px rgba(56,214,245,.14)}
.db-add button{width:42px; height:42px; border-radius:12px; display:grid; place-items:center; color:#fff; background:linear-gradient(135deg,#1d74ee,#5b3fd6)}

.db-list{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px}
.db-list li{display:flex; align-items:center; gap:10px; padding:9px 10px; border-radius:12px; background:var(--fld); border:1px solid transparent; transition:border-color .2s, opacity .2s}
.db-list li:hover{border-color:var(--line)}
.db-list .ck{flex:none; width:22px; height:22px; border-radius:7px; display:grid; place-items:center; border:2px solid var(--mut); color:#fff; transition:background .2s, border-color .2s, transform .15s}
.db-list .ck:hover{border-color:var(--ok)}
.db-list li.done .ck{background:var(--ok); border-color:var(--ok); transform:scale(1.05)}
.db-list .t{flex:1; min-width:0; font-size:13.5px; font-weight:600; overflow-wrap:anywhere}
.db-list li.done .t{text-decoration:line-through; color:var(--mut)}
.db-list .t em{display:inline-block; margin-inline-start:8px; padding:1px 7px; border-radius:999px; font-size:10px; font-style:normal; font-weight:700; background:rgba(167,139,250,.18); color:var(--vi)}
.ic{flex:none; width:28px; height:28px; display:grid; place-items:center; border-radius:8px; color:var(--mut); opacity:.55}
.db-list li:hover .ic, .ic:focus-visible{opacity:1}
.ic:hover{background:var(--fld); color:var(--ink)}
.ic.del:hover{color:var(--bad)}

.db-copy{margin-top:12px; padding:12px; border-radius:14px; background:rgba(167,139,250,.1); border:1px solid rgba(167,139,250,.35)}
.db-copy p{margin:0 0 8px; font-size:12.5px; font-weight:700}
.db-presets{display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px}
.db-presets button{padding:5px 10px; border-radius:999px; font-size:12px; font-weight:700; background:var(--fld); border:1px solid var(--line)}
.db-presets button:hover{border-color:var(--vi)}
.db-pick{display:grid; grid-template-columns:repeat(7,1fr); gap:5px; margin-bottom:10px}
.db-pick button{display:flex; flex-direction:column; align-items:center; padding:5px 0; border-radius:10px; background:var(--fld); border:1px solid transparent}
.db-pick button b{font-size:13px}
.db-pick button.on{background:rgba(167,139,250,.3); border-color:var(--vi)}
.db-copy-act{display:flex; justify-content:flex-end; gap:8px}
.db-copy-act button{padding:7px 14px; border-radius:10px; font-size:12.5px; font-weight:700}
.db-copy-act .ghost{background:var(--fld); border:1px solid var(--line)}
.db-copy-act .go{color:#fff; background:linear-gradient(135deg,#7c3aed,#5b3fd6)}

.db-eq{margin-bottom:10px}
.db-eq-l{display:block; font-size:11.5px; font-weight:700; color:var(--mut); margin-bottom:5px}
.db-eq-row{display:flex; align-items:center; gap:6px}
.db-eq-row > div{flex:1; display:flex; flex-direction:column; align-items:center; padding:8px 4px; border-radius:12px; background:var(--fld); border:1px solid var(--line)}
.db-eq-row b{font-size:17px; font-weight:800; line-height:1.2}
.db-eq-row i{font-style:normal; font-weight:800; color:var(--mut)}
.db-eq-row .res{background:rgba(56,214,245,.12); border-color:var(--cy)}
.db-target{display:flex; align-items:center; justify-content:space-between; gap:8px; margin:12px 0 6px; font-size:12.5px; font-weight:600; color:var(--mut)}
.db-target div{display:flex; align-items:center; gap:8px}
.db-target button{width:26px; height:26px; display:grid; place-items:center; border-radius:8px; background:var(--fld); border:1px solid var(--line)}
.db-target b{min-width:36px; text-align:center; color:var(--ink)}
.db-pace{margin:6px 0 0; font-size:13px; font-weight:700; color:var(--cy)}
.db-missed{margin:6px 0 0; font-size:12.5px; font-weight:600; color:var(--warn)}
.db-chart{width:100%; height:auto; margin-top:10px}
.db-chart .axis{stroke:var(--line); stroke-width:1}
.db-chart .pace{fill:none; stroke:var(--vi); stroke-width:2; stroke-dasharray:4 4; opacity:.8}
.db-chart .cum{fill:none; stroke:var(--cy); stroke-width:2.5; stroke-linejoin:round; stroke-linecap:round}
.db-chart .dot{fill:var(--cy)}
.db-chart .lbl{fill:var(--mut); font-size:10px; font-weight:600}
.db-chart .lbl.now{fill:var(--cy); font-weight:800}
.db-legend{display:flex; align-items:center; flex-wrap:wrap; gap:6px; margin:8px 0 0; font-size:11px; color:var(--mut)}
.db-legend i{display:inline-block}
.l-cum,.l-pace{width:16px; height:0; border-top:3px solid var(--cy); border-radius:2px}
.l-pace{border-top:2px dashed var(--vi); margin-inline-start:8px}

.db-heat{display:grid; grid-auto-flow:column; grid-auto-columns:1fr; grid-template-rows:repeat(7,auto); gap:4px}
.c{display:block; aspect-ratio:1; width:100%; min-width:0; border-radius:4px; border:1px solid transparent; background:rgba(148,163,184,.14); padding:0}
.l1{background:color-mix(in srgb, var(--cy) 28%, transparent)}
.l2{background:color-mix(in srgb, var(--cy) 48%, transparent)}
.l3{background:color-mix(in srgb, var(--cy) 72%, transparent)}
.l4{background:var(--cy)}
.db-heat .c:hover{border-color:var(--ink)}
.db-heat .c.plan{border:1px dashed var(--vi)}
.db-heat .c.now{border-color:var(--warn)}
.db-heat .c.sel{outline:2px solid var(--ink); outline-offset:1px}
.db-legend .c{width:12px; height:12px; aspect-ratio:auto}

.db-sh{margin:14px 0 8px; font-size:12.5px; font-weight:800}
.db-empty{margin:0; font-size:12.5px; color:var(--mut); line-height:1.6}
.db-sess{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px}
.db-sess li{display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:10px; background:var(--fld); font-size:12.5px}
.db-sess b{min-width:64px}
.db-sess span{flex:1; color:var(--mut); font-weight:600}
.db-sess em{font-style:normal; font-size:11.5px; font-weight:700; color:var(--ok)}
.db-sess .ic{opacity:.5}

@media (prefers-reduced-motion:reduce){ .db *{transition-duration:.01s !important; animation-duration:.01s !important} }
`;