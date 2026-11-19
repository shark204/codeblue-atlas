import { supabase } from './supabase';

const KICK_EVENT = 'codeblue:kicked';

/**
 * ═══ إنشاء الجلسة بعد Login ═══
 */
export async function createServerSession(
  deviceLabel: string = 'Unknown Device'
): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return false;

    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ device_label: deviceLabel }),
    });

    return res.ok;
  } catch (e) {
    console.warn('createServerSession failed:', e);
    return false;
  }
}

/**
 * ═══ إنهاء الجلسة عند Logout ═══
 */
export async function destroyServerSession(): Promise<void> {
  try {
    await fetch('/api/auth/session', { method: 'DELETE' });
  } catch (e) {
    console.warn('destroyServerSession failed:', e);
  }
}

/**
 * ═══ Auto-logout عند kick ═══
 * بيتنادى لما أي API يرجع 401 + code=SESSION_REVOKED
 */
export async function handleSessionRevoked() {
  await supabase.auth.signOut();
  window.dispatchEvent(new CustomEvent(KICK_EVENT));
}

/**
 * ═══ الاستماع لحدث الـ kick ═══
 */
export function onKickedOut(callback: () => void): () => void {
  window.addEventListener(KICK_EVENT, callback);
  return () => window.removeEventListener(KICK_EVENT, callback);
}