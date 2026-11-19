'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from './supabase';

/**
 * useState بس بيتحفظ دايمًا:
 *  - Supabase = المصدر الأساسي (يتزامن بين الأجهزة)
 *  - localStorage = نسخة فورية + شغّالة بدون نت
 *  - الحفظ بعد 1 ثانية من آخر تعديل (debounce) + عند قفل التاب/الخروج + عند رجوع النت
 */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'offline';
type Stored<T> = { v: T; t: number };

const TABLE = 'study_user_data';
const DEBOUNCE_MS = 1000;

export function useCloudState<T>(userId: string | undefined, key: string, initial: T) {
  const lsKey = `cbb:${userId ?? 'anon'}:${key}`;
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');

  const latest = useRef<Stored<T>>({ v: initial, t: 0 });
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const push = useCallback(async () => {
    if (!userId || !dirty.current) return;
    dirty.current = false;
    setStatus('saving');
    const { error } = await supabase.from(TABLE).upsert(
      { user_id: userId, key, value: latest.current.v as any, updated_at: new Date(latest.current.t).toISOString() },
      { onConflict: 'user_id,key' },
    );
    if (error) { dirty.current = true; setStatus('offline'); }
    else setStatus('saved');
  }, [userId, key]);

  // تحميل: المحلي فورًا، وبعدين الأحدث بين المحلي والسحابي
  useEffect(() => {
    let alive = true;
    setReady(false);
    let local: Stored<T> | null = null;
    try {
      const raw = localStorage.getItem(lsKey);
      if (raw) local = JSON.parse(raw);
    } catch {}
    if (local) { latest.current = local; setValue(local.v); }
    if (!userId) { setReady(true); return; }

    (async () => {
      const { data, error } = await supabase
        .from(TABLE).select('value, updated_at')
        .eq('user_id', userId).eq('key', key).maybeSingle();
      if (!alive) return;
      if (error) { setStatus('offline'); setReady(true); return; }

      const remoteT = data ? new Date(data.updated_at).getTime() : 0;
      if (data && remoteT > latest.current.t && !dirty.current) {
        latest.current = { v: data.value as T, t: remoteT };
        setValue(data.value as T);
        try { localStorage.setItem(lsKey, JSON.stringify(latest.current)); } catch {}
        setStatus('saved');
      } else if (local && local.t > remoteT) {
        dirty.current = true;   // تعديلات اتعملت أوفلاين → ارفعها
        push();
      } else if (data) setStatus('saved');
      setReady(true);
    })();

    return () => { alive = false; };
  }, [userId, key, lsKey, push]);

  const update = useCallback((next: T | ((prev: T) => T)) => {
    const v = typeof next === 'function' ? (next as (p: T) => T)(latest.current.v) : next;
    latest.current = { v, t: Date.now() };
    setValue(v);
    try { localStorage.setItem(lsKey, JSON.stringify(latest.current)); } catch {}
    dirty.current = true;
    setStatus('saving');
    clearTimeout(timer.current);
    timer.current = setTimeout(push, DEBOUNCE_MS);
  }, [lsKey, push]);

  // حفظ فوري عند الخروج / قفل التاب / رجوع النت
  useEffect(() => {
    const flush = () => { clearTimeout(timer.current); push(); };
    const onVis = () => { if (document.visibilityState === 'hidden') flush(); };
    const onOnline = () => { if (dirty.current) flush(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', flush);
    window.addEventListener('online', onOnline);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('online', onOnline);
      flush();
    };
  }, [push]);

  return [value, update, { ready, status }] as const;
}