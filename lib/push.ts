import { supabase } from './supabase';

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(b64: string) {
  const padding = '='.repeat((4 - (b64.length % 4)) % 4);
  const base64 = (b64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function getTimezone(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo'; }
  catch { return 'Africa/Cairo'; }
}

export function pushSupport(): 'ok' | 'needs-install' | 'unsupported' {
  if (typeof window === 'undefined') return 'unsupported';
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true;
  if (isIOS && !standalone) return 'needs-install';
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window))
    return 'unsupported';
  return 'ok';
}

export async function getRegistration() {
  const existing = await navigator.serviceWorker.getRegistration();
  if (!existing) await navigator.serviceWorker.register('/sw.js');
  return navigator.serviceWorker.ready;
}

export async function getOrCreateSubscription(reg: ServiceWorkerRegistration) {
  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;
  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC) as unknown as BufferSource,
  });
}

export async function registerSubscription(sub: PushSubscription) {
  const j = sub.toJSON();
  const { error } = await supabase.rpc('register_push_subscription', {
    p_endpoint: sub.endpoint,
    p_p256dh: j.keys?.p256dh,
    p_auth: j.keys?.auth,
    p_ua: navigator.userAgent.slice(0, 250),
  });
  if (error) throw error;
}

export async function enablePush(userId: string): Promise<{ ok: boolean; message: string }> {
  const support = pushSupport();
  if (support === 'needs-install')
    return { ok: false, message: 'على الآيفون: افتح الموقع من Safari ← Share ← Add to Home Screen، وبعدين فعّل الإشعارات' };
  if (support === 'unsupported')
    return { ok: false, message: 'متصفحك مش بيدعم الإشعارات' };
  if (!VAPID_PUBLIC) return { ok: false, message: 'VAPID key ناقص في الإعدادات' };

  const perm = await Notification.requestPermission();
  if (perm !== 'granted')
    return { ok: false, message: 'لازم توافق على الإشعارات من إعدادات المتصفح' };

  const reg = await getRegistration();
  const sub = await getOrCreateSubscription(reg);
  await registerSubscription(sub);

  const { error } = await supabase.from('user_notification_settings').upsert(
    { user_id: userId, enabled: true, timezone: getTimezone() },
    { onConflict: 'user_id' }
  );
  if (error) throw error;
  return { ok: true, message: 'الإشعارات اتفعّلت ✅' };
}

export async function detachDevice() {
  try {
    if (!('serviceWorker' in navigator)) return;
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return;
    await supabase.rpc('unregister_push_subscription', { p_endpoint: sub.endpoint });
    await sub.unsubscribe();
  } catch (e) { console.warn('detachDevice', e); }
}

export async function disablePush(userId: string) {
  await detachDevice();
  await supabase.from('user_notification_settings')
    .update({ enabled: false }).eq('user_id', userId);
}
export async function hasActiveSubscription(): Promise<boolean> {
  try {
    if (pushSupport() !== 'ok') return false;
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (!sub) return false;
    const { data } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', sub.endpoint)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}
export async function sendTestNotification(): Promise<void> {
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) throw new Error('مفيش اشتراك إشعارات مفعّل');

  // ✅ جيب التوكن من Supabase
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('الجلسة انتهت، سجّل دخول تاني');

  const res = await fetch('/api/push/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,        // ← ✅ السطر الناقص
    },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    // حاول تحلل الـ JSON لو رجع error
    let msg = txt;
    try {
      const j = JSON.parse(txt);
      msg = j.error || j.message || txt;
    } catch {}
    throw new Error(msg || `فشل الإرسال (${res.status})`);
  }
}