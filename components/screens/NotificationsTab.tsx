'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Bell, BellOff, BellRing, Brain, Target, AlarmClock, Flame, Heart,
  Moon, Send, Loader2, Check, ShieldAlert, Smartphone, Info,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useUIStore } from '../../stores/uiStore';
import {
  enablePush, disablePush, pushSupport, hasActiveSubscription, getTimezone,
} from '../../lib/push';
import { useTranslations } from "@/stores/languageStore";

type Props = { isDark: boolean; session: any };

type Item = {
  key: string; label: string; desc: string; icon: any;
  timed: boolean; defaultTime?: string;
  tile: string; iconCls: string; on: string;
};

const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: 'Study',
    items: [
      { key: 'daily_reminder', label: 'Daily Study Reminder', desc: 'A nudge to start your daily practice',
        icon: Bell, timed: true, defaultTime: '20:00', tile: 'bg-sky-500/10', iconCls: 'text-sky-500', on: 'bg-sky-500' },
      { key: 'daily_goal', label: 'Daily Goal', desc: "Questions left toward today's target",
        icon: Target, timed: true, defaultTime: '21:00', tile: 'bg-rose-500/10', iconCls: 'text-rose-500', on: 'bg-rose-500' },
      { key: 'smart_review', label: 'Smart Review', desc: 'When spaced-repetition questions are due',
        icon: Brain, timed: true, defaultTime: '19:00', tile: 'bg-purple-500/10', iconCls: 'text-purple-500', on: 'bg-purple-500' },
    ],
  },
  {
    title: 'Motivation',
    items: [
      { key: 'streak_risk', label: 'Streak Protection', desc: 'Save your streak before the day ends',
        icon: Flame, timed: true, defaultTime: '21:00', tile: 'bg-orange-500/10', iconCls: 'text-orange-500', on: 'bg-orange-500' },
      { key: 'exam_countdown', label: 'Exam Countdown', desc: 'Days left and the pace you need',
        icon: AlarmClock, timed: true, defaultTime: '09:00', tile: 'bg-amber-500/10', iconCls: 'text-amber-500', on: 'bg-amber-500' },
      { key: 'absence_reminder', label: 'We Miss You', desc: 'A gentle ping after 3+ days away',
        icon: Heart, timed: false, tile: 'bg-pink-500/10', iconCls: 'text-pink-500', on: 'bg-pink-500' },
    ],
  },
];

const ALL_ITEMS = GROUPS.flatMap(g => g.items);
const MAX_OPTIONS = [1, 2, 3, 5];
const hhmm = (v: any, fb: string) => (typeof v === 'string' && v.length >= 5 ? v.slice(0, 5) : fb);

function withDefaults(s: Record<string, any>) {
  const out: Record<string, any> = { ...s };
  ALL_ITEMS.forEach(i => {
    out[i.key] = { enabled: true, ...(i.defaultTime ? { time: i.defaultTime } : {}), ...(s?.[i.key] || {}) };
  });
  return out;
}

function Switch({ checked, onChange, disabled, color, label, isDark }: {
  checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
  color: string; label: string; isDark: boolean;
}) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} aria-label={label} dir="ltr"
      disabled={disabled} onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
        isDark ? 'focus-visible:ring-offset-slate-900' : 'focus-visible:ring-offset-white'
      } ${checked ? color : isDark ? 'bg-slate-700' : 'bg-slate-300'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`absolute start-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  );
}

function TimeChip({ value, onChange, disabled, isDark, label }: {
  value: string; onChange: (v: string) => void; disabled?: boolean; isDark: boolean; label: string;
}) {
  return (
    <input
      type="time" value={value} disabled={disabled} aria-label={label}
      onChange={(e) => e.target.value && onChange(e.target.value)}
      style={{ colorScheme: isDark ? 'dark' : 'light', fontSize: '13px' }}
      className={`h-9 rounded-lg border px-2.5 font-bold tabular-nums outline-none transition-colors focus:ring-2 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 ${
        isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-800'
      }`}
    />
  );
}

export default function NotificationsTab({ isDark, session }: Props) {
  const t = useTranslations('components_screens_NotificationsTab');
  const showToast = useUIStore(s => s.showToast);
  const userId: string | undefined = session?.user?.id;

  const [loading, setLoading] = useState(true);
  const [support, setSupport] = useState<'ok' | 'needs-install' | 'unsupported'>('ok');
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [enabled, setEnabled] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>(withDefaults({}));
  const [quietStart, setQuietStart] = useState('23:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  const [maxPerDay, setMaxPerDay] = useState(3);

  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const pending = useRef<Record<string, any>>({});
  const timer = useRef<any>(null);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    (async () => {
      const sup = pushSupport();
      setSupport(sup);
      if (sup === 'ok') setPermission(Notification.permission);
      try {
        const { data } = await supabase.rpc('get_notif_settings');
        const sub = await hasActiveSubscription();
        if (!alive) return;

        setEnabled(!!data?.enabled);
        setSubscribed(sub);
        setSettings(withDefaults(data?.settings || {}));
        setQuietStart(hhmm(data?.quiet_hours_start, '23:00'));
        setQuietEnd(hhmm(data?.quiet_hours_end, '07:00'));
        setMaxPerDay(data?.max_per_day ?? 3);

        if (data && ALL_ITEMS.some(i => !data.settings?.[i.key])) {
          supabase.from('user_notification_settings')
            .update({ settings: withDefaults(data.settings || {}) })
            .eq('user_id', userId).then(() => {});
        }
      } catch (e) { console.warn(e); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [userId]);

  const queueSave = (cols: Record<string, any>) => {
    if (!userId) return;
    pending.current = { ...pending.current, ...cols };
    setSaveState('saving');
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const payload = pending.current;
      pending.current = {};
      const { error } = await supabase.from('user_notification_settings')
        .update(payload).eq('user_id', userId);
      if (error) { setSaveState('idle'); showToast('فشل حفظ الإعدادات', 'error'); return; }
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1600);
    }, 600);
  };

  const patchItem = (key: string, patch: Record<string, any>) => {
    const next = { ...settings, [key]: { ...(settings[key] || {}), ...patch } };
    setSettings(next);
    queueSave({ settings: next });
  };

  const handleEnable = async () => {
    if (!userId) return;
    setBusy(true);
    try {
      const res = await enablePush(userId);
      if (pushSupport() === 'ok') setPermission(Notification.permission);
      setEnabled(res.ok);
      setSubscribed(res.ok);
      showToast(res.message, res.ok ? 'success' : 'error');
    } catch (e: any) {
      console.error('enablePush failed', e);
      setEnabled(false); setSubscribed(false);
      showToast('فشل التفعيل: ' + (e?.message || e?.details || 'unknown'), 'error');
    }
    setBusy(false);
  };

  const handleDisable = async () => {
    if (!userId) return;
    setBusy(true);
    try {
      await disablePush(userId);
      setEnabled(false); setSubscribed(false);
      showToast('🔕 الإشعارات اتقفلت', 'info');
    } catch (e: any) { showToast('فشل: ' + (e?.message || ''), 'error'); }
    setBusy(false);
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const r = await fetch('/api/push/test', {
        method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.sent > 0) showToast('اتبعتت ✅ شوف إشعاراتك', 'success');
      else showToast('مفيش جهاز متسجل. فعّل الإشعارات الأول', 'error');
    } catch { showToast('فشل الإرسال', 'error'); }
    setTesting(false);
  };

  const isOn = enabled && subscribed && permission === 'granted';
  const blocked = support === 'ok' && permission === 'denied';
  const locked = !isOn;

  // تم تغيير اسم المتغير من t إلى themeClasses لتجنب التعارض مع دالة الترجمة t
  const themeClasses = {
    card: isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm',
    title: isDark ? 'text-slate-100' : 'text-slate-900',
    sub: isDark ? 'text-slate-400' : 'text-slate-500',
    divide: isDark ? 'divide-slate-800' : 'divide-slate-100',
    eyebrow: isDark ? 'text-slate-500' : 'text-slate-400',
  };

  const status = loading
    ? { text: t('checking'), pill: 'bg-slate-500/15 text-slate-400', dot: 'bg-slate-400' }
    : isOn
      ? { text: t('active'), pill: 'bg-emerald-500/15 text-emerald-500', dot: 'bg-emerald-500' }
      : blocked
        ? { text: t('blocked'), pill: 'bg-rose-500/15 text-rose-500', dot: 'bg-rose-500' }
        : { text: t('off'), pill: 'bg-slate-500/15 text-slate-400', dot: 'bg-slate-400' };

  const heroSub = isOn
    ? 'You will receive reminders even when the site is closed.'
    : support === 'needs-install'
      ? 'Add the site to your Home Screen to receive notifications on iPhone.'
      : support === 'unsupported'
        ? 'This browser does not support push notifications.'
        : blocked
          ? 'Notifications are blocked in your browser settings.'
          : 'Turn on to get study reminders even when the site is closed.';

  return (
    <div className="space-y-4">
      {/* HERO */}
      <div className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 ${
        isDark
          ? 'border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60'
          : 'border-slate-200 bg-gradient-to-br from-white via-white to-indigo-50 shadow-sm'
      }`}>
        <div className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex items-start gap-4">
          <div className="relative shrink-0">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              isOn ? 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                   : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
            }`}>
              {isOn ? <BellRing size={22} /> : <Bell size={22} />}
            </div>
            <span className={`absolute -bottom-0.5 -end-0.5 h-3.5 w-3.5 rounded-full border-2 ${status.dot} ${
              isDark ? 'border-slate-900' : 'border-white'
            }`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={`text-lg font-black tracking-tight ${themeClasses.title}`}>{t('push_notifications')}</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${status.pill}`}>
                {status.text}
              </span>
            </div>
            <p className={`mt-1 text-xs leading-relaxed ${themeClasses.sub}`}>{heroSub}</p>
          </div>
        </div>

        {(support === 'needs-install' || support === 'unsupported' || blocked) && (
          <div className={`relative mt-4 flex items-start gap-2.5 rounded-xl border p-3 text-xs leading-relaxed ${
            blocked
              ? isDark ? 'border-rose-900/50 bg-rose-950/30 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700'
              : isDark ? 'border-amber-900/50 bg-amber-950/30 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}>
            {blocked ? <ShieldAlert size={15} className="mt-0.5 shrink-0" /> : <Smartphone size={15} className="mt-0.5 shrink-0" />}
            <span>
              {blocked && 'Allow notifications for this site from the lock icon next to the address bar, then reload the page.'}
              {support === 'needs-install' && 'On iPhone (iOS 16.4+): open the site in Safari → Share → Add to Home Screen, then open it from there and enable notifications.'}
              {support === 'unsupported' && 'Try a recent version of Chrome, Edge, Firefox, or Safari.'}
            </span>
          </div>
        )}

        {support === 'ok' && !blocked && (
          <div className="relative mt-5 flex flex-col gap-2 sm:flex-row">
            {isOn ? (
              <>
                <button
                  onClick={handleTest} disabled={testing}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 text-xs font-bold text-white shadow-md shadow-sky-600/20 transition-all hover:bg-sky-500 active:scale-[0.98] disabled:opacity-60"
                >
                  {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Send test notification
                </button>
                <button
                  onClick={handleDisable} disabled={busy}
                  className={`flex h-10 items-center justify-center gap-2 rounded-xl border px-5 text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-60 ${
                    isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {busy ? <Loader2 size={14} className="animate-spin" /> : <BellOff size={14} />}
                  Turn off
                </button>
              </>
            ) : (
              <button
                onClick={handleEnable} disabled={busy || loading}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-sm font-black text-white shadow-lg shadow-indigo-600/25 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <BellRing size={16} />}
                {busy ? t('enabling') : t('enable_notifications')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Header + save indicator */}
      <div className="flex items-center justify-between px-1 pt-1">
        <h4 className={`text-sm font-black ${themeClasses.title}`}>{t('reminders')}</h4>
        <span className={`flex h-5 items-center gap-1 text-[11px] font-bold transition-opacity ${
          saveState === 'idle' ? 'opacity-0' : 'opacity-100'
        } ${saveState === 'saved' ? 'text-emerald-500' : themeClasses.sub}`}>
          {saveState === 'saving' ? <Loader2 size={11} className="animate-spin" /> : <Check size={12} />}
          {saveState === 'saving' ? t('saving') : t('saved')}
        </span>
      </div>

      {/* GROUPS */}
      {GROUPS.map(group => (
        <section key={group.title} className="space-y-2">
          <p className={`px-1 text-[10px] font-black uppercase tracking-[0.14em] ${themeClasses.eyebrow}`}>{group.title}</p>
          <div className={`overflow-hidden rounded-2xl border ${themeClasses.card} ${locked ? 'opacity-60' : ''}`}>
            <ul className={`divide-y ${themeClasses.divide}`}>
              {group.items.map(item => {
                const Icon = item.icon;
                const cfg = settings[item.key] || {};
                const on = cfg.enabled !== false;
                const time = hhmm(cfg.time, item.defaultTime || '20:00');
                return (
                  <li key={item.key} className="flex items-center gap-3 px-4 py-3.5">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.tile}`}>
                      <Icon size={18} className={item.iconCls} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-bold ${themeClasses.title}`}>{item.label}</p>
                      <p className={`truncate text-[11px] ${themeClasses.sub}`}>{item.desc}</p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      {item.timed && (
                        <TimeChip
                          value={time} isDark={isDark} label={`${item.label} time`}
                          disabled={locked || !on}
                          onChange={(v) => patchItem(item.key, { time: v })}
                        />
                      )}
                      <Switch
                        checked={on} color={item.on} isDark={isDark} disabled={locked}
                        label={`Toggle ${item.label}`}
                        onChange={(v) => patchItem(item.key, { enabled: v })}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ))}

      {/* PREFERENCES */}
      <section className="space-y-2">
        <p className={`px-1 text-[10px] font-black uppercase tracking-[0.14em] ${themeClasses.eyebrow}`}>{t('preferences')}</p>
        <div className={`overflow-hidden rounded-2xl border ${themeClasses.card} ${locked ? 'opacity-60' : ''}`}>
          <div className={`divide-y ${themeClasses.divide}`}>

            <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
                  <Moon size={18} className="text-indigo-500" />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-bold ${themeClasses.title}`}>{t('quiet_hours')}</p>
                  <p className={`text-[11px] ${themeClasses.sub}`}>{t('no_notifications_during_this_window')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ps-[52px] sm:ps-0">
                <TimeChip value={quietStart} isDark={isDark} label={t('quiet_hours_start')} disabled={locked}
                  onChange={(v) => { setQuietStart(v); queueSave({ quiet_hours_start: v }); }} />
                <span className={`text-xs font-bold ${themeClasses.sub}`}>→</span>
                <TimeChip value={quietEnd} isDark={isDark} label={t('quiet_hours_end')} disabled={locked}
                  onChange={(v) => { setQuietEnd(v); queueSave({ quiet_hours_end: v }); }} />
              </div>
            </div>

            <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10">
                  <Bell size={18} className="text-teal-500" />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-bold ${themeClasses.title}`}>{t('daily_limit')}</p>
                  <p className={`text-[11px] ${themeClasses.sub}`}>{t('maximum_notifications_per_day')}</p>
                </div>
              </div>
              <div className={`ms-[52px] inline-flex rounded-xl p-1 sm:ms-0 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                {MAX_OPTIONS.map(n => (
                  <button
                    key={n} type="button" disabled={locked}
                    onClick={() => { setMaxPerDay(n); queueSave({ max_per_day: n }); }}
                    className={`h-8 min-w-[36px] rounded-lg px-3 text-xs font-black transition-all disabled:cursor-not-allowed ${
                      maxPerDay === n
                        ? 'bg-indigo-600 text-white shadow'
                        : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={`flex items-start gap-2 px-1 text-[11px] leading-relaxed ${themeClasses.sub}`}>
        <Info size={13} className="mt-0.5 shrink-0" />
        <p>
          Times follow your timezone ({getTimezone()}). We skip a reminder when it is not needed,
          for example when you already hit your daily goal.
        </p>
      </div>
    </div>
  );
}