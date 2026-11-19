// components/Providers.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useHomeEffects, useBadgeScheduler } from '@/hooks/useHomeEffects';
import { useSingleSession } from '@/hooks/useSingleSession';
import { usePushSync } from '@/hooks/usePushSync';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useHomeState } from '@/hooks/useHomeState';
import { supabase } from '@/lib/supabase';

export default function Providers({ children }: { children: React.ReactNode }) {
  const s = useHomeState();
  const session = useAuthStore(state => state.session);
  const setSession = useAuthStore(state => state.setSession);

  useHomeEffects();

  usePushSync(session);
  useSingleSession(session, async () => {
    await supabase.auth.signOut();
    setSession(null);
    s.setCurrentScreen('landing');
    s.showToast('🚪 تم تسجيل الدخول من جهاز آخر. تم تسجيل خروجك.', 'info');
  });

  useEffect(() => {
    if ((useUIStore as any)?.persist?.rehydrate) {
      (useUIStore as any).persist.rehydrate();
    }
  }, []);

  const scheduleBadgeCheck = useBadgeScheduler(session, s.showToast, s.currentPanel);
  const prevAnswersCountRef = useRef(0);
  const prevPanelRef = useRef(s.currentPanel);

  useEffect(() => {
    if (prevPanelRef.current !== s.currentPanel) {
      prevPanelRef.current = s.currentPanel;
      prevAnswersCountRef.current = 0;
    }
    const currentCount = Object.keys(s.sessionAnswers || {}).length;
    if (currentCount < prevAnswersCountRef.current) {
      prevAnswersCountRef.current = currentCount;
      return;
    }
    const delta = currentCount - prevAnswersCountRef.current;
    prevAnswersCountRef.current = currentCount;
    if (delta > 3) return;
    for (let i = 0; i < delta; i++) scheduleBadgeCheck();
  }, [s.sessionAnswers, scheduleBadgeCheck, s.currentPanel]);

  return <>{children}</>;
}