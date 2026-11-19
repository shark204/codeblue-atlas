// lib/pushServer.ts
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

let _admin: ReturnType<typeof createClient> | null = null;
export function getAdmin() {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return _admin;
}

let vapidReady = false;
function initVapid() {
  if (vapidReady) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  vapidReady = true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  type?: string;
};

export type SubRow = {
  id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function sendToSubscriptions(
  subs: SubRow[],
  payload: PushPayload
): Promise<number> {
  initVapid();
  const admin = getAdmin();
  const body = JSON.stringify(payload);
  let ok = 0;
  const dead: number[] = [];

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body,
          { TTL: 60 * 60 * 6, urgency: 'normal' }
        );
        ok++;
      } catch (err: any) {
        // ✅ سجّل الخطأ في DB
        console.error('❌ Push failed:', err?.statusCode, err?.body);

        try {
          await (admin as any).from('push_debug_log').insert({
            endpoint: s.endpoint.slice(-30),
            status_code: err?.statusCode || 0,
            error_body: (err?.body || err?.message || '').slice(0, 500),
          });
        } catch (logErr) {
          console.warn('Failed to log push error:', logErr);
        }

        // امسح الـ subscription لو ميت
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          dead.push(s.id);
        }
      }
    })
  );

  if (dead.length) {
    await admin.from('push_subscriptions').delete().in('id', dead);
    console.log(`🗑️ Removed ${dead.length} dead subscriptions`);
  }

  return ok;
}