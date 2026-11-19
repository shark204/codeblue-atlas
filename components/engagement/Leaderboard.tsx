'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Crown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AvatarFrame from '../ui/AvatarFrame';
import { useTranslations } from "@/stores/languageStore";

type Props = { isDark: boolean; session: any; panelId: string };

/* ───────────────────────── Cycle definitions ─────────────────────────
 * Data-driven: each panel lists the day a new cycle STARTS. A cycle ends
 * the second before the next one starts. Edit dates here only.
 */
type Start = { m: number; d: number; name: (y: number) => string };
type Def = { title: string; fellowship: boolean; starts: Start[] };

// One word for an official exam sitting (shown in titles, tabs and help). Change here only.
const ROUND = 'Round';
const round = ROUND.toLowerCase();

const TERM: Def = {
  title: 'Semester Leaderboard',
  fellowship: false,
  starts: [
    { m: 10, d: 1, name: (y) => `Term 1 (${y}/${y + 1})` },
    { m: 4, d: 1, name: (y) => `Term 2 (${y})` },
  ],
};

const DEFS: Record<string, Def> = {
  mrcs: {
    title: `MRCS ${ROUND} Leaderboard`,
    fellowship: true,
    starts: [
      { m: 1, d: 14, name: (y) => `April ${y} ${ROUND}` },
      { m: 4, d: 30, name: (y) => `September ${y} ${ROUND}` },
      { m: 9, d: 16, name: (y) => `January ${y + 1} ${ROUND}` },
    ],
  },
  mrcb: {
    title: `MRCP ${ROUND} Leaderboard`,
    fellowship: true,
    starts: [
      { m: 1, d: 21, name: (y) => `MRCP May ${y} ${ROUND}` },
      { m: 5, d: 27, name: (y) => `MRCP Sep ${y} ${ROUND}` },
      { m: 9, d: 30, name: (y) => `MRCP Jan ${y + 1} ${ROUND}` },
    ],
  },
  // ⚠️ Assumed dates (from your code comments) — adjust to the official calendar
  usmle: {
    title: 'USMLE Cycle Leaderboard',
    fellowship: true,
    starts: [
      { m: 2, d: 1, name: (y) => `Feb–May ${y}` },
      { m: 6, d: 1, name: (y) => `Jun–Sep ${y}` },
      { m: 10, d: 1, name: (y) => `Oct ${y}–Jan ${y + 1}` },
    ],
  },
  plab: {
    title: `PLAB ${ROUND} Leaderboard`,
    fellowship: true,
    starts: [
      { m: 2, d: 1, name: (y) => `PLAB Feb ${y}` },
      { m: 5, d: 1, name: (y) => `PLAB May ${y}` },
      { m: 8, d: 1, name: (y) => `PLAB Aug ${y}` },
      { m: 11, d: 1, name: (y) => `PLAB Nov ${y}` },
    ],
  },
};

export interface LeaderboardCycle {
  id: string;
  isFellowship: boolean;
  headerTitle: string;
  cycleName: string;
  subtitle: string;
  startDate: Date;
  endDate: Date;
  startLabel: string;
  endLabel: string;
  startKey: string; // YYYY-MM-DD (sent to DB, interpreted in Africa/Cairo)
  endKey: string;
  daysLeft: number;
  totalDays: number;
  progressPct: number;
  isEndingSoon: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');
// Local date parts — toISOString() shifts the day in UTC+2/+3 and broke the old cycle id.
const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function getLeaderboardCycle(
  panelId: string,
  target: 'current' | 'previous' = 'current',
  now: Date = new Date()
): LeaderboardCycle {
  const def = DEFS[panelId] ?? TERM;

  const raw: { start: Date; name: string }[] = [];
  for (let yr = now.getFullYear() - 2; yr <= now.getFullYear() + 1; yr++) {
    for (const s of def.starts) raw.push({ start: new Date(yr, s.m - 1, s.d, 0, 0, 0), name: s.name(yr) });
  }
  raw.sort((a, b) => a.start.getTime() - b.start.getTime());
  const cycles = raw.slice(0, -1).map((c, i) => ({
    ...c,
    end: new Date(raw[i + 1].start.getTime() - 1000),
  }));

  const i = Math.max(0, cycles.findIndex((c) => now >= c.start && now <= c.end));
  const pick = target === 'current' ? cycles[i] : cycles[Math.max(0, i - 1)];
  const { start: startDate, end: endDate, name: cycleName } = pick;

  const totalMs = Math.max(1, endDate.getTime() - startDate.getTime());
  const elapsedMs = Math.max(0, Math.min(totalMs, now.getTime() - startDate.getTime()));
  const examTargetUtcMs = new Date(toKey(endDate)).getTime();
  const remainingMs = Math.max(0, examTargetUtcMs - now.getTime());
  const daysLeft = target === 'previous' ? 0 : Math.ceil(remainingMs / 86400000);

  return {
    id: `${panelId}_${toKey(startDate)}`,
    isFellowship: def.fellowship,
    headerTitle: def.title,
    cycleName,
    subtitle: `Top 10 · ${cycleName}`,
    startDate,
    endDate,
    startLabel: fmtDate(startDate),
    endLabel: fmtDate(endDate),
    startKey: toKey(startDate),
    endKey: toKey(endDate),
    daysLeft,
    totalDays: Math.max(1, Math.ceil(totalMs / 86400000)),
    progressPct: target === 'previous' ? 100 : Math.min(100, Math.max(2, Math.round((elapsedMs / totalMs) * 100))),
    isEndingSoon: target === 'current' && daysLeft <= 7,
  };
}

/* ───────────────────────── Data layer ───────────────────────── */
type Row = { user_id: string; full_name: string; avatar_url: string | null; score: number; rank: number };

// Safety net: even if the DB returns a user twice, show them once (highest score).
function normalize(rows: any[]): Row[] {
  const best = new Map<string, Row>();
  for (const r of rows) {
    const score = Number(r.score ?? r.weekly_score ?? 0);
    const prev = best.get(r.user_id);
    if (!prev || score > prev.score) {
      best.set(r.user_id, {
        user_id: r.user_id,
        full_name: r.full_name || 'Anonymous',
        avatar_url: r.avatar_url ?? null,
        score,
        rank: 0,
      });
    }
  }
  return [...best.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

// Finished cycles never change → cache them for the whole session.
const cycleCache = new Map<string, Row[]>();

// Returns null on a network/DB failure so callers keep showing the last good data.
async function loadCycle(panelId: string, c: LeaderboardCycle, cacheable: boolean): Promise<Row[] | null> {
  if (cacheable && cycleCache.has(c.id)) return cycleCache.get(c.id)!;
  try {
    const { data, error } = await supabase.rpc('get_cycle_leaderboard', {
      p_panel_id: panelId,
      p_start: c.startKey,
      p_end: c.endKey,
      p_limit: 10,
      p_cycle_name: c.cycleName,
    });
    if (error) throw new Error(error.message);
    const rows = normalize(data ?? []);
    if (cacheable && rows.length > 0) cycleCache.set(c.id, rows);
    return rows;
  } catch (e: any) {
    // warn (not error) so a flaky connection doesn't trigger the red Next.js overlay
    console.warn('[leaderboard] could not load', c.id, '-', e?.message ?? e);
    return null;
  }
}

/* ───────────────────────── Medical tiers ───────────────────────── */
const TIERS = [
  { min: 4000, label: 'Consultant' },
  { min: 1500, label: 'Registrar' },
  { min: 500, label: 'Resident' },
  { min: 0, label: 'Intern' },
];
const tierOf = (xp: number) => TIERS.find((t) => xp >= t.min)!;
const fmt = (n: number) => n.toLocaleString('en-US');

/* ───────────────────────── Study milestones ─────────────────────────
 * Every peak on the heartbeat line is a milestone. `at` = how far into the
 * cycle (0–1) the checkpoint sits. Keep peaks ≥ 0.08 apart.
 * ⚠️ Suggested checkpoints — edit labels/positions to match your syllabus.
 */
type Milestone = { at: number; label: string; hint: string };

const TERM_MILESTONES: Milestone[] = [
  { at: 0.2, label: 'Foundations', hint: 'First lectures reviewed and notes organised' },
  { at: 0.5, label: 'Midterm checkpoint', hint: 'Half the syllabus covered, weak topics listed' },
  { at: 0.75, label: 'Revision begins', hint: 'All lectures done, start question practice' },
  { at: 0.92, label: 'Finals sprint', hint: 'Timed papers and last-minute weak spots' },
];

const MILESTONES: Record<string, Milestone[]> = {
  mrcs: [
    { at: 0.15, label: 'Basic sciences pass', hint: 'Applied anatomy, physiology and pathology first pass' },
    { at: 0.4, label: 'Clinical topics pass', hint: 'Trauma, vascular, upper and lower GI, urology' },
    { at: 0.65, label: 'Question-bank push', hint: 'Finish the bank once, review every wrong answer' },
    { at: 0.88, label: 'Mock exams', hint: 'Full timed papers and weak-area revision' },
  ],
  mrcb: [
    { at: 0.15, label: 'Core systems pass', hint: 'Cardiology, respiratory, endocrine first pass' },
    { at: 0.4, label: 'All specialties pass', hint: 'Remaining specialties covered once' },
    { at: 0.65, label: 'Question-bank push', hint: 'High-volume practice, track weak topics' },
    { at: 0.88, label: 'Mock papers', hint: 'Timed Best-of-Five papers and final revision' },
  ],
  usmle: [
    { at: 0.2, label: 'First pass done', hint: 'Content review complete' },
    { at: 0.45, label: 'Q-bank halfway', hint: '50% of the bank completed' },
    { at: 0.7, label: 'Full-length practice test', hint: 'One timed full-length assessment' },
    { at: 0.9, label: 'Final review', hint: 'Weak areas only, light revision' },
  ],
  plab: [
    { at: 0.25, label: 'Core topics', hint: 'Guideline-based topics first pass' },
    { at: 0.5, label: 'Q-bank halfway', hint: '50% of the bank completed' },
    { at: 0.75, label: 'Mock tests', hint: 'Timed mocks and review of errors' },
    { at: 0.92, label: 'Final week', hint: 'Quick revision and exam logistics' },
  ],
  undergraduate: [
    { at: 0.2, label: 'Foundations', hint: 'First lectures reviewed and notes organised' },
    { at: 0.5, label: 'Midterm checkpoint', hint: 'Half the syllabus covered, weak topics listed' },
    { at: 0.75, label: 'Revision begins', hint: 'All lectures done, start MCQ practice' },
    { at: 0.92, label: 'Finals sprint', hint: 'Timed papers and last-minute weak spots' },
  ],
  courses: [
    { at: 0.25, label: 'First half of course', hint: 'Complete the first half of the lectures' },
    { at: 0.5, label: 'Midpoint test', hint: 'Self-test on everything covered so far' },
    { at: 0.75, label: 'All lectures done', hint: 'Finish remaining content and summaries' },
    { at: 0.92, label: 'Exam prep', hint: 'Question practice and weak-topic review' },
  ],
  revision: [
    { at: 0.2, label: 'Weak-topic list', hint: 'Know exactly what needs revision' },
    { at: 0.45, label: 'First revision cycle', hint: 'Every weak topic revised once' },
    { at: 0.7, label: 'Second revision cycle', hint: 'Revise again with questions' },
    { at: 0.9, label: 'Rapid revision', hint: 'High-yield summaries only' },
  ],
  study_room: [
    { at: 0.25, label: 'Consistent sessions', hint: 'Study with the room every week' },
    { at: 0.5, label: 'Midpoint check', hint: 'Review your streak and room goals' },
    { at: 0.75, label: 'Group quiz night', hint: 'Test each other on covered topics' },
    { at: 0.92, label: 'Final push', hint: 'Keep the streak alive to the end' },
  ],
};

const msFor = (panelId: string) => MILESTONES[panelId] ?? TERM_MILESTONES;

// A QRS-style spike is drawn at every milestone, so the peaks ARE the milestones.
function buildEcgPath(ms: Milestone[]) {
  let d = 'M0 20';
  for (const m of ms) {
    const cx = Math.round(m.at * 300);
    d += ` H${cx - 10} l3 3 l7 -19 l6 30 l5 -14`;
  }
  return `${d} H300`;
}

const fmtShort = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/* ───────────────────────── ECG progress strip ─────────────────────────
 * Cycle progress drawn as a heartbeat trace. Lit = elapsed, dim = upcoming.
 */
function EcgProgress({
  pct, isDark, urgent, id, milestones, startDate, totalDays,
}: {
  pct: number; isDark: boolean; urgent: boolean; id: string;
  milestones: Milestone[]; startDate: Date; totalDays: number;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const path = useMemo(() => buildEcgPath(milestones), [milestones]);
  const lit = urgent ? '#f43f5e' : '#10b981';
  const surface = isDark ? '#020617' : '#ffffff';
  const o = open !== null ? milestones[open] : null;

  return (
    <div className="relative mt-4 h-9">
      <svg
        viewBox="0 0 300 40"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <defs>
          <clipPath id={`ecg-${id}`}>
            <rect x="0" y="-10" width={(pct / 100) * 300} height="60" />
          </clipPath>
        </defs>
        <path d={path} fill="none" stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <path
          d={path}
          fill="none"
          stroke={lit}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          clipPath={`url(#ecg-${id})`}
        />
      </svg>

      {/* "Now" marker */}
      <span
        className="pointer-events-none absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full motion-safe:animate-pulse"
        style={{ left: `${pct}%`, background: lit, boxShadow: `0 0 10px ${lit}` }}
      />

      {/* Milestone dots sit exactly on the peaks */}
      {milestones.map((m, i) => {
        const passed = pct >= m.at * 100;
        const date = new Date(startDate.getTime() + m.at * totalDays * 86400000);
        return (
          <button
            key={m.label}
            type="button"
            aria-label={`${m.label}, ${fmtShort(date)}`}
            onMouseEnter={() => setOpen(i)}
            onMouseLeave={() => setOpen(null)}
            onFocus={() => setOpen(i)}
            onBlur={() => setOpen(null)}
            onClick={() => setOpen((c) => (c === i ? null : i))}
            className="absolute grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
            style={{ left: `${m.at * 100}%`, top: '10%' }}
          >
            <span
              className="h-2.5 w-2.5 rounded-full border-2"
              style={{ borderColor: passed ? lit : isDark ? '#475569' : '#94a3b8', background: passed ? lit : surface }}
            />
          </button>
        );
      })}

      {o && open !== null && (
        <div
          role="tooltip"
          className={`pointer-events-none absolute bottom-full z-[60] mb-2 w-52 rounded-xl p-2.5 text-start shadow-lg ${
            o.at < 0.25 ? 'start-0' : o.at > 0.75 ? 'end-0' : '-translate-x-1/2'
          }`}
          style={{
            background: isDark ? '#0f172a' : '#ffffff',
            border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
            color: isDark ? '#f1f5f9' : '#0f172a',
            ...(o.at >= 0.25 && o.at <= 0.75 ? { left: `${o.at * 100}%` } : {}),
          }}
        >
          <p className="text-xs font-bold">{o.label}</p>
          <p className="mt-0.5 text-[11px]" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>{o.hint}</p>
          <p className="mt-1 text-[10px] font-bold text-emerald-500">
            {fmtShort(new Date(startDate.getTime() + o.at * totalDays * 86400000))}
            {pct >= o.at * 100 ? ' · reached' : ' · upcoming'}
          </p>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── "How it works" popover ─────────────────────────
 * Hover / focus / tap on the word "Leaderboard". Esc or outside tap closes.
 */
function LeaderboardInfo({ cycle, isDark, panelId }: { cycle: LeaderboardCycle; isDark: boolean; panelId: string }) {
    const t = useTranslations('components_engagement_Leaderboard');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const unit = cycle.isFellowship ? `exam ${round}` : 'term';
  // Solid inline colors so the help card is always readable, whatever the page theme does.
  const solid = {
    background: isDark ? '#0f172a' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
    opacity: 1,
  };
  const leadStyle = { color: isDark ? '#f1f5f9' : '#0f172a' };
  const bodyStyle = { color: isDark ? '#cbd5e1' : '#334155' };

  const isAr = panelId === 'undergraduate';

  const itemsEn: { title: string; text: string }[] = [
    {
      title: t('cycles'),
      text: `This board runs on a fixed calendar, one ${unit} at a time. Right now: ${cycle.cycleName}, ${cycle.startLabel} to ${cycle.endLabel}. Dates follow Cairo time for everyone.`,
    },
    {
      title: t('scoring'),
      text: t('every_xp_you_earn_in'),
    },
    {
      title: t('heartbeat_line'),
      text: `The line is the ${unit} calendar. It lights up as days pass and turns red in the last 7 days. Each peak is a study milestone for this track. Hover or tap a peak to see it.`,
    },
    {
      title: t('ranks'),
      text: `Your title comes from your XP in this cycle: ${[...TIERS].reverse().map((t) => `${t.label} (${fmt(t.min)}+)`).join(', ')}.`,
    },
    {
      title: t('your_position'),
      text: t('if_you_are_outside_the'),
    },
    {
      title: t('when_the_cycle_ends'),
      text: `The top 10 are saved permanently in the Hall of Fame and the board restarts from zero. Your XP history is not deleted. Find past results under "Last ${cycle.isFellowship ? round : 'term'}".`,
    },
    { title: t('updates'), text: t('standings_refresh_automatically_every_mi') },
  ];

  // Undergraduate: Arabic, ordered from the big picture to the details.
  const itemsAr: { title: string; text: string }[] = [
    {
      title: '١. إيه هي اللوحة دي؟',
      text: 'منافسة ودّية بين طلبة الطب في نفس المسار. كل ما تذاكر وتحل أكتر، نقاطك بتزيد وترتيبك بيعلى.',
    },
    {
      title: '٢. مدة المنافسة',
      text: `اللوحة بتشتغل بنظام الترم (٦ شهور). الترم الحالي: ${cycle.cycleName}، من ${cycle.startLabel} لحد ${cycle.endLabel}. المواعيد بتوقيت القاهرة لكل الطلبة.`,
    },
    {
      title: '٣. إزاي النقاط بتتحسب؟',
      text: t('xp'),
    },
    {
      title: '٤. الألقاب',
      text: `لقبك بيتحدد من نقاطك في الترم: ${[...TIERS].reverse().map((t) => `${t.label} (${fmt(t.min)}+)`).join('، ')}. بالترتيب: امتياز، نائب، أخصائي، استشاري.`,
    },
    {
      title: '٥. خط النبض والمحطات',
      text: 'الخط ده هو تقويم الترم: بينوّر مع مرور الأيام وبيحمرّ في آخر ٧ أيام. كل قمة هي محطة مذاكرة: الأساسيات، منتصف الترم، بداية المراجعة، سباق النهائي. حرّك الماوس أو اضغط على القمة عشان تشوف تفاصيلها.',
    },
    {
      title: '٦. مركزك',
      text: 'لو إنت برّه أفضل ١٠، هتشوف ترتيبك الحقيقي وكام نقطة ناقصة عشان تدخل القائمة.',
    },
    {
      title: '٧. لما الترم يخلص',
      text: t('last_term'),
    },
    { title: '٨. التحديث', text: 'الترتيب بيتحدّث تلقائياً كل دقيقة.' },
  ];

  const items = isAr ? itemsAr : itemsEn;
  const heading = isAr ? 'إزاي اللوحة دي شغالة' : 'How this leaderboard works';

  return (
    <span
      ref={ref}
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        className="cursor-help underline decoration-dotted underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
      >
        {t('leaderboard')}
                    </button>
      {open && (
        <div role="tooltip" className="absolute start-0 top-full z-[60] w-[min(330px,calc(100vw-3rem))] pt-2 lg:start-auto lg:end-0">
          <div
            dir={isAr ? 'rtl' : 'ltr'}
            style={solid}
            className={`max-h-[70vh] space-y-3 overflow-y-auto rounded-2xl p-4 shadow-2xl ${isAr ? 'text-end' : 'text-start'}`}
          >
            <p className="text-sm font-black" style={leadStyle}>{heading}</p>
            {items.map((it) => (
              <div key={it.title}>
                <p className="text-xs font-bold" style={leadStyle}>{it.title}</p>
                <p className="mt-0.5 text-[12px] font-normal leading-relaxed" style={bodyStyle}>{it.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </span>
  );
}

/* ───────────────────────── Component ───────────────────────── */
export default function Leaderboard({ isDark, session, panelId }: Props) {
    const t = useTranslations('components_engagement_Leaderboard');
  const uid: string | undefined = session?.user?.id;

  const current = useMemo(() => getLeaderboardCycle(panelId, 'current'), [panelId]);
  const previous = useMemo(() => getLeaderboardCycle(panelId, 'previous'), [panelId]);

  const [tab, setTab] = useState<'live' | 'last'>('live');
  const [live, setLive] = useState<Row[]>([]);
  const [last, setLast] = useState<Row[]>([]);
  const [me, setMe] = useState<Row | null>(null); // my row when I'm outside the top 10
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false); // last refresh failed

  useEffect(() => {
    if (!uid) return;
    let alive = true;

    const run = async (first: boolean) => {
      if (first) setLoading(true);
      const [l, p] = await Promise.all([
        loadCycle(panelId, current, false),
        loadCycle(panelId, previous, true),
      ]);
      if (!alive) return;

      if (l === null && p === null) {
        setStale(true); // keep whatever we already show
        if (first) setLoading(false);
        return;
      }
      setStale(l === null || p === null);
      if (l) setLive(l);
      if (p) setLast(p);

      if (l) {
        if (l.some((r) => r.user_id === uid)) {
          setMe(null);
        } else {
          try {
            const { data } = await supabase.rpc('get_my_cycle_rank', {
              p_panel_id: panelId,
              p_start: current.startKey,
              p_end: current.endKey,
            });
            const r = data?.[0];
            if (alive) {
              setMe(
                r
                  ? { user_id: r.user_id, full_name: r.full_name || 'You', avatar_url: r.avatar_url ?? null, score: Number(r.score), rank: r.rank }
                  : null
              );
            }
          } catch {
            /* keep previous "me" */
          }
        }
      }
      if (alive && first) setLoading(false);
    };

    run(true);
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') run(false);
    }, 60000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [uid, panelId, current, previous]);

  const active = tab === 'live' ? current : previous;
  const milestones = useMemo(() => msFor(panelId), [panelId]);
  const nextMs = milestones.find((m) => m.at * 100 > current.progressPct) ?? null;
  const nextDays = nextMs
    ? Math.max(0, Math.ceil((current.startDate.getTime() + nextMs.at * current.totalDays * 86400000 - Date.now()) / 86400000))
    : 0;
  const rows = tab === 'live' ? live : last;
  const myIdx = rows.findIndex((r) => r.user_id === uid);
  const myRow = myIdx >= 0 ? rows[myIdx] : tab === 'live' ? me : null;
  const leaderScore = rows[0]?.score || 1;

  let gapText: string | null = null;
  if (tab === 'live' && myRow) {
    if (myIdx === 0 && rows[1]) gapText = `You lead by ${fmt(rows[0].score - rows[1].score)} XP`;
    else if (myIdx > 0) gapText = `${fmt(rows[myIdx - 1].score - myRow.score)} XP to pass #${myIdx}`;
    else if (myIdx === -1 && rows.length >= 10) gapText = `${fmt(rows[9].score - myRow.score + 1)} XP to enter the top 10`;
  } else if (tab === 'last' && myRow) {
    gapText = 'Final result';
  }

  const ink = isDark ? 'text-slate-100' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const line = isDark ? 'border-slate-800' : 'border-slate-200';

  const podium = [rows[1], rows[0], rows[2]]; // 2nd · 1st · 3rd
  const placeOf = [2, 1, 3];
  const rest = rows.slice(3);

  return (
    <section
      className={`relative rounded-3xl border p-4 sm:p-5 ${line} ${
        isDark ? 'bg-slate-950' : 'bg-white'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-bold text-emerald-500">
            {current.headerTitle.replace(/\s*Leaderboard$/, '')}{' '}
            <LeaderboardInfo cycle={current} isDark={isDark} panelId={panelId} />
          </div>
          <h3 className={`mt-0.5 text-lg font-black leading-tight ${ink}`}>{active.cycleName}</h3>
          <p className={`mt-0.5 text-[11px] ${muted}`}>
            {active.startLabel} – {active.endLabel}
          </p>
        </div>
        <div className="shrink-0 text-end">
          {tab === 'live' ? (
            <>
              <p className={`text-2xl font-black tabular-nums leading-none ${current.isEndingSoon ? 'text-rose-500' : ink}`}>
                {current.daysLeft}
              </p>
              <p className={`mt-1 text-[10px] ${muted}`}>{t('days_left')}</p>
            </>
          ) : (
            <p className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-500">{t('finished')}</p>
          )}
        </div>
      </div>

      <EcgProgress
        pct={active.progressPct}
        isDark={isDark}
        urgent={tab === 'live' && current.isEndingSoon}
        id={panelId}
        milestones={milestones}
        startDate={active.startDate}
        totalDays={active.totalDays}
      />
      <p className={`mt-1.5 text-[11px] ${muted}`}>
        {tab === 'last'
          ? t('all_milestones_completed')
          : nextMs
            ? `Next: ${nextMs.label} · ${nextDays === 0 ? 'today' : `in ${nextDays} day${nextDays === 1 ? '' : 's'}`}`
            : 'All milestones passed. Final stretch.'}
      </p>

      {/* Tabs */}
      <div role="tablist" className={`mt-3 grid grid-cols-2 gap-1 rounded-xl p-1 text-xs font-bold ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
        {(['live', 'last'] as const).map((tabKey) => (
          <button
            key={tabKey}
            role="tab"
            aria-selected={tab === tabKey}
            onClick={() => setTab(tabKey)}
            className={`rounded-lg py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 ${
              tab === tabKey
                ? isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900 shadow-sm'
                : muted
            }`}
          >
            {tabKey === 'live' ? t('live_standings') : current.isFellowship ? `Last ${round}` : 'Last term'}
          </button>
        ))}
      </div>

      {stale && (
        <p className={`mt-3 rounded-lg px-3 py-2 text-[11px] ${isDark ? 'bg-amber-500/10 text-amber-300' : 'bg-amber-50 text-amber-800'}`}>
          {panelId === 'undergraduate'
            ? 'تعذّر تحديث الترتيب، بنعرض آخر بيانات محفوظة وهنحاول تاني تلقائياً.'
            : t('could_not_refresh_showing_the')}
        </p>
      )}

      {loading ? (
        <div className="mt-4 space-y-2" aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`h-12 rounded-xl motion-safe:animate-pulse ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`} />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className={`mt-4 rounded-2xl border border-dashed p-6 text-center ${line}`}>
          <p className={`text-sm font-bold ${ink}`}>
            {tab === 'live' ? t('nobody_has_scored_yet') : `No saved results for ${previous.cycleName}`}
          </p>
          {tab === 'live' && <p className={`mt-1 text-xs ${muted}`}>{t('solve_a_question_to_take')}</p>}
        </div>
      ) : (
        <>
          {/* My position */}
          {myRow && (
            <div
              className={`mt-4 flex items-center gap-3 rounded-2xl border p-3 ${
                isDark ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-emerald-300 bg-emerald-50'
              }`}
            >
              <p className={`w-12 text-center text-xl font-black tabular-nums ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                #{myRow.rank}
              </p>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-xs font-bold ${ink}`}>
                  {tierOf(myRow.score).label} · {fmt(myRow.score)} XP
                </p>
                {gapText && <p className={`text-[11px] ${muted}`}>{gapText}</p>}
              </div>
            </div>
          )}

          {/* Podium */}
          <div className="mt-5 grid grid-cols-3 items-end gap-2">
            {podium.map((r, col) => {
              const place = placeOf[col];
              if (!r) return <div key={col} />;
              const first = place === 1;
              const height = first ? 'h-20' : place === 2 ? 'h-14' : 'h-11';
              const mine = r.user_id === uid;
              return (
                <div key={r.user_id} className="flex min-w-0 flex-col items-center">
                  {first && <Crown size={18} className="mb-1 fill-amber-400 text-amber-400" aria-label={t('champion')} />}
                  <AvatarFrame
                    src={r.avatar_url}
                    name={r.full_name}
                    userId={r.user_id}
                    panelId={panelId}
                    size={first ? 'sm' : 'xs'}
                    isDark={isDark}
                    xp={r.score}
                  />
                  <p className={`mt-1.5 w-full truncate px-1 text-center text-[11px] font-bold ${mine ? 'text-emerald-500' : ink}`}>
                    {mine ? t('you') : r.full_name}
                  </p>
                  <p className={`text-[10px] tabular-nums ${muted}`}>{fmt(r.score)} XP</p>
                  <div
                    className={`mt-2 flex w-full items-center justify-center rounded-t-xl border-x border-t text-sm font-black ${height} ${
                      first
                        ? isDark ? 'border-amber-500/60 bg-amber-500/15 text-amber-300' : 'border-amber-400 bg-amber-100 text-amber-800'
                        : isDark ? `${line} bg-slate-900 text-slate-300` : `${line} bg-slate-100 text-slate-600`
                    }`}
                  >
                    {place}
                  </div>
                </div>
              );
            })}
          </div>

          {/* #4 – #10 */}
          {rest.length > 0 && (
            <ol className="mt-3 space-y-1.5">
              {rest.map((r) => {
                const mine = r.user_id === uid;
                return (
                  <li
                    key={r.user_id}
                    className={`flex items-center gap-2.5 rounded-xl border p-2 ${
                      mine
                        ? isDark ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-emerald-300 bg-emerald-50'
                        : `${line} ${isDark ? 'bg-slate-900/50' : 'bg-white'}`
                    }`}
                  >
                    <span className={`w-6 text-center text-xs font-black tabular-nums ${muted}`}>{r.rank}</span>
                    <AvatarFrame
                      src={r.avatar_url}
                      name={r.full_name}
                      userId={r.user_id}
                      panelId={panelId}
                      size="xs"
                      isDark={isDark}
                      xp={r.score}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-xs font-bold ${ink}`}>
                        {r.full_name}
                        {mine && ' (You)'}
                      </p>
                      <div className={`mt-1 h-1 overflow-hidden rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${Math.max(4, (r.score / leaderScore) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="shrink-0 text-end">
                      <p className={`text-sm font-black tabular-nums ${ink}`}>{fmt(r.score)}</p>
                      <p className={`text-[10px] ${muted}`}>{tierOf(r.score).label}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          <p className={`mt-4 text-center text-[11px] ${muted}`}>
            {tab === 'live'
              ? `Top 10 are saved to the Hall of Fame on ${current.endLabel}.`
              : t('saved_permanently_in_the_hall')}
          </p>
        </>
      )}
    </section>
  );
}