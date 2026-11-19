// @ts-nocheck
'use client';

import { useState, useEffect, useRef } from 'react';
import SettingsFuture, { DEFAULT_NOTIF } from './SettingsFuture';
import AvatarFrame from '../ui/AvatarFrame';
import { supabase } from '../../lib/supabase';
import { useUIStore, type PanelId } from '../../stores/uiStore';
import { useTranslations } from "@/stores/languageStore";
import { Trash2, UserCog } from 'lucide-react';

type Props = {
  isDark: boolean;
  isAdmin: boolean;
  session: any;
  savedAccounts: { email: string; name: string }[];
  daysLeft: number | null;
  dailyGoal: number;
  duplicatesCount: number;
  duplicatesScanning: boolean;
  currentPanel: PanelId;
  questionsCount?: number;
  undergradQuestionsCount?: number;
  onBack: () => void;
  onGoToAdmin: () => void;
  onSaveExamDate: (date: string) => void;
  onScanDuplicates: () => void;
  onRemoveDuplicates: () => void;
  onSwitchAccount: (email: string) => void;
  onRemoveAccount: (email: string) => void;
  onLogout: () => void;
  onResetProgress: () => void;
};

export default function SettingsScreen({
  isDark, isAdmin, session, savedAccounts, daysLeft, dailyGoal,
  duplicatesCount, duplicatesScanning, currentPanel, onBack, onGoToAdmin,
  onSaveExamDate, onScanDuplicates, onRemoveDuplicates, onSwitchAccount,
  onRemoveAccount, onLogout, onResetProgress,
  questionsCount = 0,
  undergradQuestionsCount = 0,
}: Props) {
    const t = useTranslations('components_screens_SettingsScreen');
  const showToast = useUIStore(s => s.showToast);
  const activePanel: PanelId = currentPanel || 'mrcs';
 // ✅ اقرا حالة السما واتابعها
  const [skyMode, setSkyMode] = useState<'day' | 'night'>('night');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sky:manual-mode');
      if (saved === 'day' || saved === 'night') setSkyMode(saved);
    } catch {}
    const onMode = (e: any) => setSkyMode(e.detail);
    window.addEventListener('sky:mode', onMode);
    return () => window.removeEventListener('sky:mode', onMode);
  }, []);

  // ═══════════════════════════════════════════════════════
  // 📅 Bank dates
  // ═══════════════════════════════════════════════════════
  const [panelExamDates, setPanelExamDates] = useState<Record<string, string>>({
  mrcs: '', mrcb: '', undergraduate: '', usmle: '',
});

  useEffect(() => {
    if (!session?.user?.id) return;
    (async () => {
      const { data } = await supabase
  .from('user_progress')
  .select('panel_id, exam_date')
  .eq('user_id', session.user.id)
  .in('panel_id', ['mrcs', 'mrcb', 'undergraduate', 'usmle']);
if (data) {
  const map: Record<string, string> = { mrcs: '', mrcb: '', undergraduate: '', usmle: '' };
  data.forEach((row: any) => {
    if (row.panel_id in map) map[row.panel_id] = row.exam_date || '';
  });
  setPanelExamDates(map);
}
    })();
  }, [session?.user?.id]);

  const handleSavePanelDate = async (panelId: string, date: string) => {
    if (!session?.user?.id) throw new Error('مفيش جلسة');
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: session.user.id,
        panel_id: panelId,
        exam_date: date,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,panel_id' });
    if (error) throw error;

    setPanelExamDates(prev => ({ ...prev, [panelId]: date }));
    if (panelId === activePanel && onSaveExamDate) onSaveExamDate(date);
    showToast('✅ تم حفظ التاريخ', 'success');
  };

  // ═══════════════════════════════════════════════════════
  // 🔔 Notifications — debounced save to BOTH tables
  // ═══════════════════════════════════════════════════════
  const [notif, setNotif] = useState<any>(DEFAULT_NOTIF);
  const notifSaveTimer = useRef<any>(null);

  // load
  useEffect(() => {
    if (!session?.user?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from('user_notification_prefs')
        .select('prefs')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (error) { console.warn('load notif prefs failed:', error.message); return; }
      if (data?.prefs && Object.keys(data.prefs).length) {
        setNotif({ ...DEFAULT_NOTIF, ...data.prefs });
      }
    })();
  }, [session?.user?.id]);

  // save (debounced)
  const handleNotifChange = (next: any) => {
    setNotif(next);
    const uid = session?.user?.id;
    if (!uid) return;

    clearTimeout(notifSaveTimer.current);
    notifSaveTimer.current = setTimeout(async () => {
      // 1) احفظ في الجدول الجديد (prefs)
      const { error } = await supabase
        .from('user_notification_prefs')
        .upsert(
          { user_id: uid, prefs: next, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );
      if (error) {
        console.warn('save notif prefs failed:', error.message);
        showToast('فشل حفظ إعدادات الإشعارات', 'error');
        return;
      }

      // 2) حدّث الجدول اللي الـ cron بيقرا منه
      const quietOn = next?.quiet?.enabled !== false;
      const settingsJson = {
        daily_reminder:   { enabled: !!next.dailyReminder?.on, time: next.dailyReminder?.time || '20:00', channel: 'both', days: [0,1,2,3,4,5,6] },
        daily_goal:       { enabled: !!next.dailyGoal?.on,     time: next.dailyGoal?.time || '21:00',     channel: 'both' },
        smart_review:     { enabled: !!next.smartReview?.on,   time: next.smartReview?.time || '19:00',   channel: 'push' },
        streak_risk:      { enabled: !!next.streak?.on,        time: next.streak?.time || '21:00',        channel: 'push' },
        exam_countdown:   { enabled: !!next.exam?.on,          mode: 'daily',                             channel: 'push' },
        absence_reminder: { enabled: !!next.missYou?.on,                                                  channel: 'push' },
      };

      await supabase
        .from('user_notification_settings')
        .upsert({
          user_id: uid,
          enabled: true,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo',
          quiet_hours_start: quietOn ? (next.quiet?.from || '23:00') : '00:00',
          quiet_hours_end:   quietOn ? (next.quiet?.to   || '07:00') : '00:00',
          max_per_day: next.limit || 3,
          settings: settingsJson,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    }, 600);
  };

  // don't lose a pending save when leaving the screen
  useEffect(() => () => clearTimeout(notifSaveTimer.current), []);

  // ═══════════════════════════════════════════════════════
  // 📲 Push
  // ═══════════════════════════════════════════════════════
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { hasActiveSubscription } = await import('../../lib/push');
        const active = await hasActiveSubscription();
        setPushEnabled(active);
      } catch {}
    })();
  }, []);

  const handleTogglePush = async (on: boolean) => {
    setPushBusy(true);
    try {
      const mod = await import('../../lib/push');
      if (on) {
        if (!session?.user?.id) throw new Error('مفيش جلسة');
        const res = await mod.enablePush(session.user.id);
        if (!res.ok) showToast(res.message, 'error');
        else { setPushEnabled(true); showToast(res.message, 'success'); }
      } else {
        if (session?.user?.id) await mod.disablePush(session.user.id);
        else await mod.detachDevice();
        setPushEnabled(false);
        showToast('تم إيقاف الإشعارات', 'info');
      }
    } catch (err: any) {
      showToast('فشل: ' + (err?.message || 'unknown'), 'error');
    }
    setPushBusy(false);
  };

  const handleSendTest = async () => {
    try {
      const mod = await import('../../lib/push');
      await mod.sendTestNotification();
      showToast('✅ ابعتنا إشعار تجريبي', 'success');
    } catch (err: any) {
      showToast('فشل الإرسال: ' + (err?.message || 'unknown'), 'error');
    }
  };

  // ═══════════════════════════════════════════════════════
  // 👤 Avatar / Username
  // ═══════════════════════════════════════════════════════
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    session?.user?.user_metadata?.avatar_url || null
  );
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvatarUrl(session?.user?.user_metadata?.avatar_url || null);
  }, [session?.user?.user_metadata?.avatar_url]);

  const triggerPhotoUpload = () => fileInputRef.current?.click();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;
    if (!file.type.startsWith('image/')) { showToast('الملف لازم يكون صورة', 'error'); return; }
    if (file.size > 2 * 1024 * 1024) { showToast('الصورة لازم أقل من 2MB', 'error'); return; }
    setUploadingAvatar(true);
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${session.user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('avatars').upload(path, file, { upsert: true, cacheControl: '3600' });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      const { error: updErr } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      if (updErr) throw updErr;
      setAvatarUrl(publicUrl);
      showToast('✅ تم رفع الصورة', 'success');
    } catch (err: any) {
      showToast('فشل الرفع: ' + (err?.message || 'unknown'), 'error');
    }
    setUploadingAvatar(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAvatar = async () => {
    if (!session?.user?.id) return;
    setUploadingAvatar(true);
    try {
      const { data: files } = await supabase.storage.from('avatars').list(session.user.id);
      if (files?.length) {
        await supabase.storage.from('avatars').remove(files.map(f => `${session.user.id}/${f.name}`));
      }
      const { error } = await supabase.auth.updateUser({ data: { avatar_url: null } });
      if (error) throw error;
      setAvatarUrl(null);
      showToast('✅ تم حذف الصورة', 'success');
    } catch (err: any) {
      showToast('فشل الحذف: ' + (err?.message || 'unknown'), 'error');
    }
    setUploadingAvatar(false);
  };

  const handleChangeUsername = async () => {
    const trimmed = newUsername.trim();
    if (!trimmed) return showToast('اكتب اسم جديد', 'error');
    if (trimmed.length < 3) return showToast('الاسم لازم 3 أحرف على الأقل', 'error');
    if (trimmed.length > 30) return showToast('الاسم أقل من 30 حرف', 'error');
    setSavingUsername(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: trimmed } });
      if (error) throw error;
      showToast('✅ تم تغيير الاسم', 'success');
      setShowUsernameModal(false);
      setNewUsername('');
    } catch (err: any) {
      showToast('فشل: ' + (err?.message || 'unknown'), 'error');
    }
    setSavingUsername(false);
  };

  // ═══════════════════════════════════════════════════════
  // 🔒 Security callbacks
  // ═══════════════════════════════════════════════════════
  const handleChangePassword = async (current: string, next: string) => {
    if (!session?.user?.email) throw new Error('مفيش جلسة نشطة');
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email, password: current,
    });
    if (signInError) throw new Error('الباسورد الحالي غلط');
    const { error: updErr } = await supabase.auth.updateUser({ password: next });
    if (updErr) throw updErr;
  };

  const handleSendResetLink = async () => {
    const email = session?.user?.email;
    if (!email) throw new Error('مفيش إيميل مرتبط بالجلسة');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    });
    if (error) throw error;
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id) throw new Error('مفيش جلسة');
    const { data: { session: live } } = await supabase.auth.getSession();
    const token = live?.access_token;
    if (!token) throw new Error('الجلسة انتهت، سجّل دخول تاني');
    const res = await fetch('/api/account/delete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json().catch(() => ({} as any));
    if (!res.ok) throw new Error(json?.error || 'فشل حذف الحساب');
    showToast('تم حذف حسابك. ربنا يوفقك! 👋', 'success');
    await onLogout();
  };

  // ═══════════════════════════════════════════════════════
  // 🧩 بناء الـ props
  // ═══════════════════════════════════════════════════════

  const accounts: Array<{
    id: string; name: string; email: string;
    photoUrl: string | null; active: boolean;
  }> = savedAccounts.map((acc) => ({
    id: acc.email,
    name: acc.name,
    email: acc.email,
    photoUrl: session?.user?.email === acc.email ? avatarUrl : null,
    active: session?.user?.email === acc.email,
  }));

  const daysLeftFor = (d: string) => {
    if (!d) return null;
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  };
  const perDayFor = (count: number, days: number | null) =>
    days && days > 0 && count > 0 ? Math.ceil(count / days) : 0;

 const banks: Array<{
  id: string; name: string; date: string;
  perDay: number; tone: 'cyan' | 'ion' | 'violet' | 'rose';
}> = [
  {
    id: 'mrcs',
    name: 'MRCS Bank',
    date: panelExamDates.mrcs,
    perDay: perDayFor(questionsCount, daysLeftFor(panelExamDates.mrcs)),
    tone: 'cyan',
  },
  {
    id: 'mrcb',
    name: 'MRCB Bank',
    date: panelExamDates.mrcb,
    perDay: perDayFor(0, daysLeftFor(panelExamDates.mrcb)),
    tone: 'ion',
  },
  {
    id: 'usmle',
    name: 'USMLE Bank',
    date: panelExamDates.usmle,
    perDay: perDayFor(0, daysLeftFor(panelExamDates.usmle)),
    tone: 'rose',
  },
  {
    id: 'undergraduate',
    name: 'Undergraduate Bank',
    date: panelExamDates.undergraduate,
    perDay: perDayFor(undergradQuestionsCount, daysLeftFor(panelExamDates.undergraduate)),
    tone: 'violet',
  },
];

  const renderAvatar = (a: any) => (
    <AvatarFrame
      src={a.photoUrl}
      name={a.name}
      userId={session?.user?.id}
      panelId={activePanel}
      size="sm"
      isDark={isDark}
    />
  );

  // ═══════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAvatarUpload}
      />

        <SettingsFuture
        theme={skyMode === 'night' ? 'dark' : 'light'}
        onBack={onBack}
        isAdmin={isAdmin}

        accounts={accounts}
        renderAvatar={renderAvatar}
        onSwitchAccount={(id: string) => onSwitchAccount(id)}
        onAddAccount={onLogout}
        onChangeUsername={() => {
          setNewUsername(session?.user?.user_metadata?.full_name || '');
          setShowUsernameModal(true);
        }}
        onChangePhoto={() => triggerPhotoUpload()}
        onRemovePhoto={handleRemoveAvatar}
        onSignOutAccount={onLogout}
        onRemoveAccount={(id: string) => onRemoveAccount(id)}

        banks={banks}
        onSaveDate={handleSavePanelDate}

        notif={notif}
        onNotifChange={handleNotifChange}
        pushEnabled={pushEnabled}
        onTogglePush={handleTogglePush}
        onSendTest={handleSendTest}
        timezone={Intl.DateTimeFormat().resolvedOptions().timeZone}

        onChangePassword={handleChangePassword}
        onSendResetLink={handleSendResetLink}
        onSignOut={onLogout}
        onResetProgress={async () => { await onResetProgress(); }}
        onDeleteAccount={handleDeleteAccount}

        onScanDuplicates={onScanDuplicates}
        onOpenAdmin={onGoToAdmin}
        adminTab={
          <div className="adm">
            <h2 className="plain">{t('duplicate_cleanup')}</h2>
            <p className="sx-sub">{t('find_and_remove_duplicate_questions')}</p>
            <div className="adm-actions">
              <button
                className="sx-ghost"
                onClick={onScanDuplicates}
                disabled={duplicatesScanning}
              >
                {duplicatesScanning ? t('scanning') : t('scan_for_duplicates')}
              </button>

              {duplicatesCount > 0 && (
                <button className="sx-primary amberbtn" onClick={onRemoveDuplicates}>
                  <Trash2 size={16} /> Remove {duplicatesCount} duplicates
                </button>
              )}

              <button className="sx-primary amberbtn" onClick={onGoToAdmin}>
                <UserCog size={16} /> {t('open_admin_dashboard')}
                                      </button>
            </div>
          </div>
        }
      />

      {/* Username Modal */}
      {showUsernameModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className={`w-full max-w-md rounded-3xl shadow-2xl border p-6 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isDark ? 'bg-sky-500/10' : 'bg-sky-50'}`}>
                  <span className="text-xl">✏️</span>
                </div>
                <div>
                  <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('change_username')}</h3>
                  <p className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>غيّر اسمك الظاهر</p>
                </div>
              </div>
              <button
                onClick={() => { setShowUsernameModal(false); setNewUsername(''); }}
                className={`p-2 rounded-xl ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder={t('dr_falcon')}
              maxLength={30}
              autoFocus
              className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              style={{ fontSize: 16 }}
            />
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => { setShowUsernameModal(false); setNewUsername(''); }}
                className={`flex-1 py-3 font-bold rounded-xl text-sm ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                إلغاء
              </button>
              <button
                onClick={handleChangeUsername}
                disabled={savingUsername || !newUsername.trim() || newUsername.trim().length < 3}
                className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-black text-sm rounded-xl"
              >
                {savingUsername ? '...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}