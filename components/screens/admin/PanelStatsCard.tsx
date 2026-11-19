'use client';
import { useAdminStore } from '../../../stores/adminStore';
import { getPanelDef, getPanelKind } from '../../../lib/panels';
import type { LucideIcon } from 'lucide-react';
import {
  HelpCircle, AlertTriangle, Copy, TrendingUp,
  GraduationCap, Users, Award, BookOpen,
  Layers, Clock, Bookmark, Star,
  DoorOpen, MessagesSquare, Timer,
} from 'lucide-react';
import { useTranslations } from "@/stores/languageStore";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type PanelStats = {
  // qbank
  totalQuestions?: number;
  newThisWeek?: number;
  byDifficulty?: { easy: number; medium: number; hard: number };
  topCategories?: { name: string; count: number }[];
  missingExplanation?: number;
  // shared
  totalUsers: number;
  activeUsers7d: number;
  // courses
  totalCourses?: number;
  activeEnrollments?: number;
  completionsThisMonth?: number;
  avgRating?: number;
  // revision
  totalCards?: number;
  cardsDueToday?: number;
  reviewedThisWeek?: number;
  retentionRate?: number;
  // study room
  activeRooms?: number;
  sessionsThisWeek?: number;
  avgSessionMinutes?: number;
  peakUsersToday?: number;
};

type Kpi = {
  label: string;
  value: number | undefined;
  sub: string;
  color: string;
  Icon: LucideIcon;
};

type Props = {
  isDark: boolean;
  stats: PanelStats | null;
  loading: boolean;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PanelStatsCard({ isDark, stats, loading }: Props) {
    const t = useTranslations('components_screens_admin_PanelStatsCard');
  const panelId = useAdminStore(s => s.adminSelectedPanel);
  const panel = getPanelDef(panelId);
  const duplicatesCount = useAdminStore(s => s.duplicatesCount);

  const kind = getPanelKind(panelId);

  const card   = `rounded-3xl border p-5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`;
  const muted  = isDark ? 'text-slate-400' : 'text-slate-500';
  const strong = isDark ? 'text-slate-100' : 'text-slate-900';

  /* ─── KPIs per panel kind ──────────────────────────────────────── */
  const kpis: Kpi[] = (() => {
    switch (kind) {
      case 'qbank':
        return [
          { label: t('total_questions'),     value: stats?.totalQuestions,     sub: `+${stats?.newThisWeek ?? 0} this week`, color: 'text-sky-500',     Icon: HelpCircle },
          { label: t('missing_explanation'), value: stats?.missingExplanation, sub: stats?.missingExplanation ? 'needs review' : 'all good', color: stats?.missingExplanation ? 'text-rose-500' : 'text-emerald-500', Icon: AlertTriangle },
          { label: t('duplicates'),          value: duplicatesCount,           sub: duplicatesCount ? 'found' : 'none',      color: duplicatesCount ? 'text-amber-500' : 'text-emerald-500', Icon: Copy },
          { label: t('active_users_7d'),   value: stats?.activeUsers7d,      sub: `${stats?.totalUsers ?? 0} total`,       color: 'text-emerald-500', Icon: TrendingUp },
        ];

      case 'courses':
        return [
          { label: t('total_courses'),      value: stats?.totalCourses,          sub: 'published',      color: 'text-sky-500',     Icon: BookOpen },
          { label: t('active_enrollments'), value: stats?.activeEnrollments,     sub: 'in progress',    color: 'text-violet-500',  Icon: GraduationCap },
          { label: t('completed_month'),  value: stats?.completionsThisMonth,  sub: 'this month',     color: 'text-emerald-500', Icon: Award },
          { label: t('average_rating'),     value: stats?.avgRating,             sub: 'out of 5',       color: 'text-amber-500',   Icon: Star },
        ];

      case 'revision':
        return [
          { label: t('total_cards'),     value: stats?.totalCards,        sub: 'available',           color: 'text-sky-500',     Icon: Layers },
          { label: t('due_today'),       value: stats?.cardsDueToday,     sub: 'in review queue',     color: 'text-amber-500',   Icon: Clock },
          { label: t('reviewed_week'), value: stats?.reviewedThisWeek,  sub: 'last 7 days',         color: 'text-violet-500',  Icon: Bookmark },
          { label: t('retention_rate'),  value: stats?.retentionRate,     sub: '% correct first try', color: 'text-emerald-500', Icon: TrendingUp },
        ];

      case 'study_room':
        return [
          { label: t('active_rooms'),     value: stats?.activeRooms,        sub: 'open now',           color: 'text-sky-500',     Icon: DoorOpen },
          { label: t('sessions_week'),  value: stats?.sessionsThisWeek,   sub: 'last 7 days',        color: 'text-violet-500',  Icon: MessagesSquare },
          { label: t('avg_duration'),     value: stats?.avgSessionMinutes,  sub: 'min / session',      color: 'text-amber-500',   Icon: Timer },
          { label: t('peak_users_today'), value: stats?.peakUsersToday,     sub: 'highest concurrent', color: 'text-emerald-500', Icon: Users },
        ];

      default:
        return [];
    }
  })() ?? [];

  /* ─── Secondary sections (only for qbank) ──────────────────────── */
  const diff = stats?.byDifficulty;
  const diffTotal = diff ? (diff.easy + diff.medium + diff.hard) || 1 : 1;
  const showDifficulty = kind === 'qbank' && !!diff;
  const showCategories = kind === 'qbank' && !!stats?.topCategories?.length;
  const hasSecondary = showDifficulty || showCategories;
  const maxCat = Math.max(1, ...(stats?.topCategories?.map(c => c.count) ?? [1]));

  return (
    <div className={card}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {panel && (
            <panel.icon
              size={16}
              strokeWidth={2.5}
              className={isDark ? 'text-slate-200' : 'text-slate-700'}
            />
          )}
          <h3 className={`text-sm font-black ${strong}`}>
            {panel?.label} Performance
          </h3>
        </div>
      </div>

      {/* KPI grid */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-2 ${hasSecondary ? 'mb-4' : ''}`}>
        {kpis.map(k => {
          const Icon = k.Icon;
          const display =
            loading || k.value == null
              ? '—'
              : typeof k.value === 'number'
              ? k.value.toLocaleString()
              : String(k.value);

          return (
            <div
              key={k.label}
              className={`p-3 rounded-2xl border ${
                isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Icon size={11} strokeWidth={2.5} className={k.color} />
                <p className={`text-[10px] font-bold uppercase tracking-wide ${muted}`}>
                  {k.label}
                </p>
              </div>
              <p className={`text-2xl font-black ${k.color}`}>{display}</p>
              <p className={`text-[10px] mt-0.5 ${muted}`}>{k.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Difficulty + Categories (qbank only) */}
      {hasSecondary && (
        <div className="grid lg:grid-cols-2 gap-4">
          {showDifficulty && diff && (
            <div>
              <p className={`text-xs font-black mb-2.5 ${strong}`}>{t('difficulty_distribution')}</p>
              <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-700/30 mb-2">
                <div className="bg-emerald-500" style={{ width: `${(diff.easy / diffTotal) * 100}%` }} />
                <div className="bg-amber-500"   style={{ width: `${(diff.medium / diffTotal) * 100}%` }} />
                <div className="bg-rose-500"    style={{ width: `${(diff.hard / diffTotal) * 100}%` }} />
              </div>
              <div className={`flex justify-between text-[11px] font-bold ${muted}`}>
                <span>🟢 Easy {diff.easy}</span>
                <span>🟡 Medium {diff.medium}</span>
                <span>🔴 Hard {diff.hard}</span>
              </div>
            </div>
          )}

          {showCategories && stats?.topCategories && (
            <div>
              <p className={`text-xs font-black mb-2.5 ${strong}`}>{t('top_categories')}</p>
              <div className="space-y-1.5">
                {stats.topCategories.slice(0, 4).map(c => (
                  <div key={c.name}>
                    <div className={`flex justify-between text-[11px] font-bold mb-0.5 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      <span className="truncate">{c.name}</span>
                      <span>{c.count}</span>
                    </div>
                    <div className="h-1 rounded-full bg-slate-700/30">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{ width: `${(c.count / maxCat) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}