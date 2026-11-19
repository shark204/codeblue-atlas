import { supabase } from './supabase';

const DEVICE_ID_KEY = 'codeblue_device_id';

/**
 * ═══ Device ID — يتخزن في localStorage ويفضل ثابت على نفس المتصفح
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `dev_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getDeviceInfo(): string {
  if (typeof window === 'undefined') return '';
  try {
    const ua = navigator.userAgent;
    const platform = (navigator as any).platform || '';
    return `${platform} | ${ua.slice(0, 150)}`.trim();
  } catch {
    return 'unknown';
  }
}

/**
 * ═══ Claim — سجّل الجهاز الحالي كالجهاز النشط
 */
export async function claimActiveSession(): Promise<{
  ok: boolean;
  isNewDevice: boolean;
  previousDevice: string | null;
}> {
  const deviceId = getDeviceId();
  if (!deviceId) return { ok: false, isNewDevice: false, previousDevice: null };

  const { data, error } = await supabase.rpc('claim_active_session', {
    p_device_id: deviceId,
    p_device_info: getDeviceInfo(),
  });

  if (error) {
    console.warn('claim_active_session failed:', error.message);
    return { ok: false, isNewDevice: false, previousDevice: null };
  }

  return {
    ok: !!data?.claimed,
    isNewDevice: !!data?.is_new_device,
    previousDevice: data?.previous_device ?? null,
  };
}

/**
 * ═══ Check — هل الجهاز الحالي لسه النشط؟
 */
export async function checkActiveSession(): Promise<'ok' | 'kicked' | 'no-row' | 'no-auth' | 'error'> {
  const deviceId = getDeviceId();
  if (!deviceId) return 'no-auth';

  const { data, error } = await supabase.rpc('check_active_session', {
    p_device_id: deviceId,
  });

  if (error) {
    console.warn('check_active_session failed:', error.message);
    return 'error';
  }

  return (data as 'ok' | 'kicked' | 'no-row' | 'no-auth') || 'error';
}

/**
 * ═══ Release — امسح الصف عند الـ logout
 */
export async function releaseActiveSession(): Promise<void> {
  const deviceId = getDeviceId();
  if (!deviceId) return;
  try {
    await supabase.rpc('release_active_session', { p_device_id: deviceId });
  } catch (e) {
    console.warn('release_active_session failed:', e);
  }
}

/**
 * ═══ Realtime — استنى تغييرات الجلسة (kick فوري)
 */
export function subscribeToSessionChanges(
  userId: string,
  onKickedOut: () => void
): () => void {
  const deviceId = getDeviceId();
  if (!deviceId) return () => {};

  const channel = supabase
    .channel(`active_session_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_active_session',
        filter: `user_id=eq.${userId}`,
      },
      (payload: any) => {
        const newDevice = payload.new?.session_id;
        if (newDevice && newDevice !== deviceId) {
          console.log('🚪 Kicked out by new login from another device');
          onKickedOut();
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}