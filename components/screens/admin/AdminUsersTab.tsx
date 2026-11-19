'use client';
import { useEffect, useMemo, useState } from 'react';
import { useAdminStore } from '../../../stores/adminStore';
import { useAuthStore } from '../../../stores/authStore';
import AdminToolbar from './AdminToolbar';
import RowMenu from './RowMenu';
import { downloadCsv } from '../../../lib/csv';
import { useTranslations } from '@/stores/languageStore';

type Props = {
  isDark: boolean;
  onFetchAdminUsers: () => void;
};

type UserFilter = 'all' | 'active' | 'inactive' | 'never';
const DAY_MS = 86_400_000;

const PANEL_LABELS: Record<string, string> = {
  mrcs: 'MRCS',
  mrcb: 'MRCP',
  undergraduate: 'Undergrad',
  usmle: 'USMLE',
  courses: 'Courses',
  revision: 'Revision',
  study_room: 'Study Room',
  atlas: '3D Atlas',
};

export default function AdminUsersTab({ isDark, onFetchAdminUsers }: Props) {
  const t = useTranslations('components_screens_admin_AdminUsersTab');
  const users = useAdminStore(s => s.adminUsers);
  const loading = useAdminStore(s => s.adminUsersLoading);
  const currentSession = useAuthStore(s => s.session);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<UserFilter>('all');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    onFetchAdminUsers();
  }, [onFetchAdminUsers]);

  // Compute a clock-skew-safe reference timestamp from server_now or the newest timestamp in the dataset
  const referenceNowMs = useMemo(() => {
    let maxTs = 0;
    for (const u of users as any[]) {
      if (u?.server_now) {
        const sMs = new Date(u.server_now).getTime();
        if (Number.isFinite(sMs) && sMs > maxTs) maxTs = sMs;
      }
      for (const field of [u?.last_sign_in_at, u?.updated_at, u?.created_at]) {
        if (!field) continue;
        const ms = new Date(field).getTime();
        if (Number.isFinite(ms) && ms > maxTs) maxTs = ms;
      }
    }
    const localNow = Date.now();
    if (maxTs > 0 && Math.abs(localNow - maxTs) > DAY_MS) {
      return maxTs;
    }
    return localNow;
  }, [users]);

  const statusOf = (u: any): UserFilter => {
    if (u?.status === 'active' || u?.status === 'inactive' || u?.status === 'never') {
      return u.status;
    }
    const currentEmail = currentSession?.user?.email?.toLowerCase();
    if (currentEmail && (u?.email || '').toLowerCase() === currentEmail) {
      return 'active';
    }
    const lastTs = u?.last_sign_in_at || u?.updated_at;
    if (!lastTs) return 'never';
    const lastMs = new Date(lastTs).getTime();
    if (!Number.isFinite(lastMs) || lastMs <= 0) return 'never';
    return Math.max(0, referenceNowMs - lastMs) < 7 * DAY_MS ? 'active' : 'inactive';
  };

  const formatRelativeAgo = (iso?: string | null) => {
    if (!iso) return t('never_signed_in');
    const ms = new Date(iso).getTime();
    if (!Number.isFinite(ms) || ms <= 0) return t('never_signed_in');
    const diffSec = Math.max(0, Math.floor((referenceNowMs - ms) / 1000));
    if (diffSec < 120) return 'الآن (Online)';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `منذ ${diffMin} د`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `منذ ${diffHr} س`;
    const diffDays = Math.floor(diffHr / 24);
    return `منذ ${diffDays} يوم`;
  };

  const counts = useMemo(
    () => ({
      all: users.length,
      active: users.filter(u => statusOf(u) === 'active').length,
      inactive: users.filter(u => statusOf(u) === 'inactive').length,
      never: users.filter(u => statusOf(u) === 'never').length,
    }),
    [users, referenceNowMs, currentSession?.user?.email]
  );

  const shown = users.filter((u: any) => {
    const matchesFilter = filter === 'all' || statusOf(u) === filter;
    const q = query.trim().toLowerCase();
    if (!q) return matchesFilter;
    const emailStr = (u.email ?? '').toLowerCase();
    const nameStr = (
      u.name ??
      u.user_metadata?.full_name ??
      u.user_metadata?.name ??
      ''
    ).toLowerCase();
    const deviceStr = `${u.device_summary ?? ''} ${u.ip_address ?? ''} ${u.provider ?? ''}`.toLowerCase();
    return matchesFilter && (emailStr.includes(q) || nameStr.includes(q) || deviceStr.includes(q));
  });

  const surfaceCard = isDark
    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
    : 'bg-white border-slate-200 shadow-sm hover:border-slate-300';

  const miniBox = isDark
    ? 'bg-slate-800/60 border-slate-700/70 text-slate-200'
    : 'bg-slate-50 border-slate-200/80 text-slate-700';

  const segments: { key: UserFilter; label: string }[] = [
    { key: 'all', label: t('all') },
    { key: 'active', label: t('active') },
    { key: 'inactive', label: t('inactive') },
    { key: 'never', label: t('never') },
  ];

  return (
    <div className="mt-2 space-y-3" dir="rtl">
      {/* Unified Toolbar */}
      <AdminToolbar
        isDark={isDark}
        title={t('users')}
        count={users.length}
        search={{ value: query, onChange: setQuery, placeholder: t('search_by_email') }}
        loading={loading}
        onRefresh={onFetchAdminUsers}
        secondary={[
          {
            icon: '⬇',
            label: t('export_csv'),
            onClick: () =>
              downloadCsv(
                'users_detailed',
                shown.map((u: any) => ({
                  name: u.name || u.user_metadata?.full_name || u.user_metadata?.name || '',
                  email: u.email,
                  status: statusOf(u),
                  provider: (u.providers || [u.provider || 'email']).join('+'),
                  email_verified: u.email_confirmed ? 'Yes' : 'No',
                  total_solved: u.total_solved ?? 0,
                  total_correct: u.total_correct ?? 0,
                  total_wrong: u.total_wrong ?? 0,
                  accuracy_pct: `${u.accuracy_pct ?? 0}%`,
                  xp: u.xp ?? 0,
                  level: u.level ?? 1,
                  max_streak: u.max_streak ?? 0,
                  badges_count: u.badges_count ?? 0,
                  active_days: u.active_days_count ?? 0,
                  solved_7d: u.solved_last_7d ?? 0,
                  notes_count: u.notes_count ?? 0,
                  flagged_count: u.flagged_count ?? 0,
                  panels: (u.panels_used || []).join(' | '),
                  device: u.device_summary || u.device_label || '',
                  ip_address: u.ip_address || '',
                  timezone: u.timezone || '',
                  language: u.preferred_language || '',
                  joined: u.created_at,
                  last_active: u.last_sign_in_at ?? '',
                }))
              ),
          },
        ]}
      />

      {/* Segmented filter control */}
      <div
        className={`inline-flex flex-wrap gap-1 p-1 rounded-xl border ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
        }`}
      >
        {segments.map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filter === s.key
                ? 'bg-amber-500 text-white'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {s.label} <span className="opacity-75">({counts[s.key]})</span>
          </button>
        ))}
      </div>

      {loading && users.length === 0 && (
        <div className={`rounded-2xl border p-8 text-center text-sm text-slate-500 ${surfaceCard}`}>
          {t('loading_users')}
        </div>
      )}

      {!loading && shown.length === 0 && (
        <div className={`rounded-2xl border p-8 text-center text-sm text-slate-500 ${surfaceCard}`}>
          {t('no_users_match_this_filter')}
        </div>
      )}

      {/* Half-Screen 2-Column Grid for User Cards (نص الشاشة لكل مستخدم) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {shown.map((u: any) => {
          const st = statusOf(u);
          const statusBadge =
            st === 'active'
              ? { label: 'نشط', dot: 'bg-emerald-500', pill: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' }
              : st === 'inactive'
              ? { label: 'غير نشط', dot: 'bg-amber-500', pill: 'bg-amber-500/15 text-amber-400 border-amber-500/30' }
              : { label: 'لم يدخل', dot: 'bg-slate-500', pill: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };

          const displayName =
            u.name ||
            u.user_metadata?.full_name ||
            u.user_metadata?.name ||
            (u.email ? u.email.split('@')[0] : 'User');

          const initials = displayName.slice(0, 2).toUpperCase();
          const providerList: string[] = Array.isArray(u.providers) && u.providers.length
            ? u.providers
            : [u.provider || 'email'];
          const panelsUsed: string[] = Array.isArray(u.panels_used) ? u.panels_used : [];

          return (
            <div
              key={u.id || u.email}
              onClick={() => setSelectedUser(u)}
              className={`cursor-pointer rounded-2xl border p-3.5 transition-all space-y-2.5 ${surfaceCard}`}
            >
              {/* Top Row: Avatar + Name/Email + Badges + Actions */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {u.avatar_url ? (
                    <img
                      src={u.avatar_url}
                      alt={displayName}
                      className="w-10 h-10 rounded-xl object-cover border border-amber-500/40 shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-amber-400'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}
                    >
                      {initials}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-xs font-black truncate ${
                          isDark ? 'text-slate-100' : 'text-slate-900'
                        }`}
                      >
                        {displayName}
                      </span>

                      {u.is_admin && (
                        <span className="px-1.5 py-0.5 text-[10px] font-black rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          👑 Admin
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded-md border ${statusBadge.pill}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                        {statusBadge.label}
                      </span>
                    </div>

                    <p
                      className={`text-xs font-mono font-bold truncate mt-0.5 ${
                        isDark ? 'text-sky-400' : 'text-sky-700'
                      }`}
                      dir="ltr"
                    >
                      {u.email}
                    </p>
                  </div>
                </div>

                <div onClick={e => e.stopPropagation()}>
                  <RowMenu
                    isDark={isDark}
                    items={[
                      {
                        icon: '📋',
                        label: t('copy_email'),
                        onClick: () => navigator.clipboard.writeText(u.email || ''),
                      },
                      {
                        icon: '👁',
                        label: t('view_details'),
                        onClick: () => setSelectedUser(u),
                      },
                    ]}
                  />
                </div>
              </div>

              {/* 2x2 Compact Telemetry Grid inside each half-screen card */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {/* Box 1: QBank Solved & Accuracy */}
                <div className={`p-2 rounded-xl border ${miniBox}`}>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                    <span>📊 الأسئلة المحلولة</span>
                    <span className="text-emerald-400 font-black">{u.accuracy_pct ?? 0}% دقة</span>
                  </div>
                  <div className="mt-0.5 font-black text-xs flex items-center gap-1.5" dir="ltr">
                    <span>{u.total_solved ?? 0} Qs</span>
                    <span className="text-[10px] text-emerald-500">({u.total_correct ?? 0}✓</span>
                    <span className="text-[10px] text-rose-400">{u.total_wrong ?? 0}✗)</span>
                  </div>
                </div>

                {/* Box 2: Level, XP, Streak & Badges */}
                <div className={`p-2 rounded-xl border ${miniBox}`}>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                    <span>⚡ المستوى والـ XP</span>
                    <span className="text-amber-400 font-black">🔥 {u.max_streak ?? 0}d</span>
                  </div>
                  <div className="mt-0.5 font-black text-xs flex items-center justify-between" dir="ltr">
                    <span>Lv.{u.level ?? 1} · {u.xp ?? 0} XP</span>
                    <span className="text-[10px] text-violet-400">🎖️ {u.badges_count ?? 0}</span>
                  </div>
                </div>

                {/* Box 3: Device, Browser & Auth Provider */}
                <div className={`p-2 rounded-xl border ${miniBox}`}>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                    <span>{u.is_mobile_device ? '📱 الجهاز' : '💻 الجهاز'}</span>
                    <span className="uppercase text-[9.5px] font-black text-sky-400" dir="ltr">
                      {providerList.join('+')}{u.email_confirmed ? ' ✓' : ''}
                    </span>
                  </div>
                  <div className="mt-0.5 font-bold text-[11px] truncate" dir="ltr">
                    {u.device_summary && u.device_summary !== '—'
                      ? u.device_summary
                      : u.device_label || 'Web Session'}
                  </div>
                </div>

                {/* Box 4: Activity Days, Notes, Flagged & IP/Location */}
                <div className={`p-2 rounded-xl border ${miniBox}`}>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                    <span>📅 أيام النشاط: {u.active_days_count ?? 0}</span>
                    <span>📓 {u.notes_count ?? 0} · 🚩 {u.flagged_count ?? 0}</span>
                  </div>
                  <div className="mt-0.5 font-bold text-[10.5px] truncate text-slate-400" dir="ltr">
                    {u.ip_address ? `IP: ${u.ip_address}` : u.timezone || (u.preferred_language ? `Lang: ${u.preferred_language.toUpperCase()}` : 'Standard Profile')}
                  </div>
                </div>
              </div>

              {/* Active Panels & Metadata Tags */}
              {panelsUsed.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400">الأقسام:</span>
                  {panelsUsed.map((pid: string) => (
                    <span
                      key={pid}
                      className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-sky-500/15 text-sky-400 border border-sky-500/30"
                    >
                      {PANEL_LABELS[pid] || pid}
                    </span>
                  ))}
                  {u.exam_date && (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-violet-500/15 text-violet-300 border border-violet-500/30">
                      🎯 امتحان: {u.exam_date}
                    </span>
                  )}
                </div>
              )}

              {/* Footer Timestamps */}
              <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between gap-2 text-[10.5px] text-slate-400">
                <span>
                  {t('joined')}:{' '}
                  <strong className="text-slate-300" dir="ltr">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB') : '—'}
                  </strong>
                </span>
                <span>
                  {t('last_sign_in')}:{' '}
                  <strong className="text-amber-400">
                    {formatRelativeAgo(u.last_sign_in_at)}
                  </strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comprehensive User Dossier Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-xs"
          onClick={() => setSelectedUser(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className={`w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl border p-5 space-y-4 shadow-2xl ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-sm font-black text-amber-400 shrink-0">
                  {(selectedUser.name || selectedUser.email || 'U').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-black text-amber-400 truncate">
                    {selectedUser.name ||
                      selectedUser.user_metadata?.full_name ||
                      selectedUser.user_metadata?.name ||
                      selectedUser.email}
                  </h4>
                  <p className="text-xs font-mono text-sky-400 truncate" dir="ltr">
                    {selectedUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-black bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
              >
                ✕ {t('close')}
              </button>
            </div>

            {/* Section 1: Identity & Authentication */}
            <div className={`p-3.5 rounded-2xl border space-y-2 ${miniBox}`}>
              <h5 className="text-xs font-black text-amber-400">🔐 بيانات الحساب وتوثيق الدخول</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">معرّف المستخدم (UUID):</span>
                  <span className="font-mono text-[11px] truncate max-w-[190px]" dir="ltr">
                    {selectedUser.id}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">طريقة التسجيل:</span>
                  <span className="font-bold uppercase" dir="ltr">
                    {(selectedUser.providers || [selectedUser.provider || 'email']).join(' + ')}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">تأكيد البريد الإلكتروني:</span>
                  <span className="font-bold">
                    {selectedUser.email_confirmed
                      ? `✅ مؤكد (${new Date(selectedUser.email_confirmed_at).toLocaleDateString('en-GB')})`
                      : '⏳ غير مؤكد'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">رقم الهاتف:</span>
                  <span className="font-mono font-bold" dir="ltr">
                    {selectedUser.phone || '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">تاريخ إنشاء الحساب:</span>
                  <span className="font-mono" dir="ltr">
                    {selectedUser.created_at
                      ? new Date(selectedUser.created_at).toLocaleString('en-GB')
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">آخر نشاط فعلي بالموقع:</span>
                  <span className="font-mono text-emerald-400 font-bold" dir="ltr">
                    {selectedUser.last_sign_in_at
                      ? new Date(selectedUser.last_sign_in_at).toLocaleString('en-GB')
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Device, Browser, IP & Preferences */}
            <div className={`p-3.5 rounded-2xl border space-y-2 ${miniBox}`}>
              <h5 className="text-xs font-black text-sky-400">💻 الجهاز، المتصفح، والشبكة</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">النظام والمتصفح:</span>
                  <span className="font-bold" dir="ltr">
                    {selectedUser.device_summary || '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">عنوان الـ IP:</span>
                  <span className="font-mono font-bold" dir="ltr">
                    {selectedUser.ip_address || '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">المنطقة الزمنية:</span>
                  <span className="font-mono" dir="ltr">
                    {selectedUser.timezone || 'Africa/Cairo'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">لغة الواجهة المفضلة:</span>
                  <span className="font-bold">
                    {selectedUser.preferred_language === 'ar'
                      ? 'العربية (AR)'
                      : selectedUser.preferred_language === 'en'
                      ? 'English (EN)'
                      : 'الافتراضية'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">إشعارات Push المفعلة:</span>
                  <span className="font-bold">
                    {selectedUser.push_devices_count > 0
                      ? `🔔 ${selectedUser.push_devices_count} جهاز متصل`
                      : 'غير مفعّل'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">معرّف الجلسة النشطة:</span>
                  <span className="font-mono text-[10px] truncate max-w-[160px]" dir="ltr">
                    {selectedUser.active_device_id || selectedUser.device_label || '—'}
                  </span>
                </div>
              </div>
              {selectedUser.user_agent && (
                <div className="pt-1.5 border-t border-slate-700/40">
                  <p className="text-[10px] text-slate-400 mb-0.5">بصمة المتصفح الكاملة (User-Agent):</p>
                  <p className="text-[10px] font-mono text-slate-300 break-all" dir="ltr">
                    {selectedUser.user_agent}
                  </p>
                </div>
              )}
            </div>

            {/* Section 3: Academic & QBank Telemetry */}
            <div className={`p-3.5 rounded-2xl border space-y-2.5 ${miniBox}`}>
              <h5 className="text-xs font-black text-emerald-400">📈 إحصائيات المذاكرة وحل الأسئلة</h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <p className="text-[10px] text-slate-400">إجمالي المحلول</p>
                  <p className="text-base font-black text-sky-400">{selectedUser.total_solved ?? 0}</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <p className="text-[10px] text-slate-400">نسبة الدقة</p>
                  <p className="text-base font-black text-emerald-400">{selectedUser.accuracy_pct ?? 0}%</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <p className="text-[10px] text-slate-400">المستوى والـ XP</p>
                  <p className="text-base font-black text-amber-400" dir="ltr">
                    Lv.{selectedUser.level ?? 1} ({selectedUser.xp ?? 0})
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <p className="text-[10px] text-slate-400">الستريك وأيام النشاط</p>
                  <p className="text-base font-black text-rose-400">
                    🔥 {selectedUser.max_streak ?? 0}d · 📅 {selectedUser.active_days_count ?? 0}d
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">إجابات صحيحة / خاطئة:</span>
                  <span className="font-bold" dir="ltr">
                    {selectedUser.total_correct ?? 0}✓ / {selectedUser.total_wrong ?? 0}✗
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">محلول آخر 7 أيام:</span>
                  <span className="font-bold">{selectedUser.solved_last_7d ?? 0} سؤال</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الملاحظات المدونة:</span>
                  <span className="font-bold">📓 {selectedUser.notes_count ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الأسئلة المميزة (Flagged):</span>
                  <span className="font-bold">🚩 {selectedUser.flagged_count ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">بطاقات المراجعة الذكية:</span>
                  <span className="font-bold">🧠 {selectedUser.sr_cards_count ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">غرف المذاكرة والبلاغات:</span>
                  <span className="font-bold">
                    👥 {selectedUser.study_rooms_joined ?? 0} · 🚩 {selectedUser.reports_submitted ?? 0}
                  </span>
                </div>
              </div>

              {/* Per-Panel Breakdown */}
              {Array.isArray(selectedUser.panel_stats) && selectedUser.panel_stats.length > 0 && (
                <div className="pt-2 border-t border-slate-700/40 space-y-1.5">
                  <p className="text-[11px] font-black text-slate-300">تفصيل الأداء حسب القسم (Panels):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {selectedUser.panel_stats.map((ps: any, idx: number) => (
                      <div
                        key={`${ps.panel_id}-${idx}`}
                        className="p-2 rounded-xl bg-slate-900/50 border border-slate-700/40 flex items-center justify-between text-[11px]"
                      >
                        <span className="font-black text-sky-400">
                          {PANEL_LABELS[ps.panel_id] || ps.panel_id}
                        </span>
                        <span className="font-bold" dir="ltr">
                          {ps.solved} Qs · {ps.accuracy}% · 🔥{ps.streak}d
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
