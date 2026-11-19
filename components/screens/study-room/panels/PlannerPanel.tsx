'use client';
import { useEffect, useMemo, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { useCloudState } from '@/lib/useCloudState';
import SaveBadge from '../ui/SaveBadge';
import Tip from '../ui/Tip';
import { useTranslations } from "@/stores/languageStore";

type Item = { id: number; name: string; done: boolean };
type Planner = {
  exam: { name: string; date: string; hoursLeft: number };
  subjects: string[];
  week: Record<string, Item[]>;
  weekKey: string;
};

const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];          // الأسبوع بيبدأ سبت
const DEFAULT_SUBJECTS = ['Anatomy', 'Physiology', 'Pathology', 'Surgery', 'Trauma', 'Critical Care'];

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayIdx = () => (new Date().getDay() + 1) % 7;                     // Sat=0 … Fri=6
const currentWeekKey = () => { const d = new Date(); d.setDate(d.getDate() - todayIdx()); return ymd(d); };

const EMPTY: Planner = {
  exam: { name: '', date: '', hoursLeft: 0 },
  subjects: DEFAULT_SUBJECTS,
  week: {},
  weekKey: '',
};

export default function PlannerPanel({ userId }: { userId?: string }) {
    const t = useTranslations('components_screens_study_room_panels_PlannerPanel');
  const [p, setP, { ready, status }] = useCloudState<Planner>(userId, 'planner', EMPTY);
  const [sel, setSel] = useState(todayIdx());
  const [custom, setCustom] = useState('');

  // أسبوع جديد → الخطة تفضل، والـ "done" بس بيتصفّر
  useEffect(() => {
    if (!ready) return;
    const wk = currentWeekKey();
    if (p.weekKey === wk) return;
    setP((x) => ({
      ...x, weekKey: wk,
      week: Object.fromEntries(Object.entries(x.week).map(([k, v]) => [k, v.map((i) => ({ ...i, done: false }))])),
    }));
  }, [ready]); // eslint-disable-line

  const daysLeft = useMemo(() => {
    if (!p.exam.date) return null;
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return Math.round((new Date(p.exam.date + 'T00:00:00').getTime() - t.getTime()) / 86400000);
  }, [p.exam.date]);

  const perDay = daysLeft && daysLeft > 0 && p.exam.hoursLeft > 0 ? p.exam.hoursLeft / daysLeft : null;
  const items = p.week[sel] || [];
  const setItems = (fn: (i: Item[]) => Item[]) => setP((x) => ({ ...x, week: { ...x.week, [sel]: fn(x.week[sel] || []) } }));
  const addItem = (name: string) => setItems((i) => [...i, { id: Date.now() + i.length, name, done: false }]);

  const addCustom = () => {
    const n = custom.trim();
    if (!n) return;
    if (!p.subjects.includes(n)) setP((x) => ({ ...x, subjects: [...x.subjects, n] }));
    addItem(n);
    setCustom('');
  };

  if (!ready) return <div className="sr-skel tall" />;

  return (
    <div className="sr-planner">
      {/* ═══ Exam countdown ═══ */}
      <section className="sr-card sr-exam">
        <div className="sr-row-between">
          <h3>{t('exam_countdown')}</h3>
          <SaveBadge status={status} />
        </div>

        <div className="sr-exam-main">
          <Tip text="Days left until your exam. The number turns amber in the last 14 days." side="bottom"><div className={`sr-days ${daysLeft !== null && daysLeft <= 14 && daysLeft >= 0 ? 'near' : ''}`}>
            <b>{daysLeft === null ? '–' : daysLeft < 0 ? '0' : daysLeft}</b>
            <small>{daysLeft === null ? 'set a date' : daysLeft === 1 ? 'day left' : daysLeft < 0 ? 'exam passed' : 'days left'}</small>
          </div></Tip>
          <div className="sr-exam-fields">
            <input value={p.exam.name} placeholder={t('exam_name_e_g_mrcs')} aria-label={t('exam_name')}
              onChange={(e) => setP((x) => ({ ...x, exam: { ...x.exam, name: e.target.value } }))} />
            <div className="sr-exam-row">
              <input type="date" value={p.exam.date} aria-label={t('exam_date')}
                onChange={(e) => setP((x) => ({ ...x, exam: { ...x.exam, date: e.target.value } }))} />
              <Tip text="Total study hours you still plan to cover. It is used to calculate how many hours a day you need." side="bottom"><input type="number" min={0} value={p.exam.hoursLeft || ''} placeholder={t('hours_left')} aria-label={t('study_hours_left')}
                onChange={(e) => setP((x) => ({ ...x, exam: { ...x.exam, hoursLeft: Math.max(0, +e.target.value || 0) } }))} /></Tip>
            </div>
          </div>
        </div>

        {perDay !== null && (
          <p className="sr-need">
            {t('to_finish')} <b>{p.exam.hoursLeft}h</b> {t('in_time_study_about')} <b>{perDay.toFixed(1)}h</b> {t('a_day')}
                                </p>
        )}
      </section>

      {/* ═══ Weekly schedule ═══ */}
      <section>
        <h3 className="sr-h3" style={{ marginBottom: 8 }}>{t('weekly_plan')}</h3>
        <Tip text="Your plan for each day. Today is outlined, and 2/3 means two of three subjects are done. Done marks reset every Saturday." side="top"><div className="sr-week" role="tablist">
          {DAYS.map((d, i) => {
            const list = p.week[i] || [];
            const done = list.filter((x) => x.done).length;
            return (
              <button key={d} role="tab" aria-selected={sel === i}
                className={`${sel === i ? 'on' : ''} ${todayIdx() === i ? 'today' : ''}`} onClick={() => setSel(i)}>
                <span>{d}</span>
                <i className={list.length && done === list.length ? 'full' : ''}>{list.length ? `${done}/${list.length}` : '·'}</i>
              </button>
            );
          })}
        </div></Tip>

        <ul className="sr-plan-list">
          {items.map((it) => (
            <li key={it.id} className={it.done ? 'done' : ''}>
              <button className="chk" aria-label={it.done ? 'Mark as not done' : 'Mark as done'}
                onClick={() => setItems((l) => l.map((x) => x.id === it.id ? { ...x, done: !x.done } : x))}>
                {it.done && <Check size={12} strokeWidth={3} />}
              </button>
              <span>{it.name}</span>
              <button className="del" aria-label={t('remove')} onClick={() => setItems((l) => l.filter((x) => x.id !== it.id))}><X size={13} /></button>
            </li>
          ))}
          {!items.length && <li className="empty">Nothing planned for {DAYS[sel]}. Pick a subject below.</li>}
        </ul>

        <Tip text="Tap a subject to add it to the selected day." side="top"><div className="sr-chips sr-subj">
          {p.subjects.map((s) => (
            <button key={s} onClick={() => addItem(s)}><Plus size={11} /> {s}</button>
          ))}
        </div></Tip>
        <div className="sr-add">
          <input value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustom()}
            placeholder={t('add_your_own_subject')} aria-label={t('custom_subject')} />
          <button onClick={addCustom}>{t('add')}</button>
        </div>
      </section>
    </div>
  );
}
