'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { RoomChallenge } from './types';
import { fetchMyPendingChallenges } from './api';

/** Watches for incoming pending challenges for the current user. */
export function useIncomingChallenge(userId: string | undefined) {
  const [pending, setPending] = useState<RoomChallenge | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let alive = true;

    (async () => {
      const list = await fetchMyPendingChallenges(userId);
      if (alive) setPending(list[0] ?? null);
    })();

    const channel = supabase
      .channel(`incoming:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'room_challenges', filter: `opponent_id=eq.${userId}` },
        async () => {
          const list = await fetchMyPendingChallenges(userId);
          if (alive) setPending(list[0] ?? null);
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'room_challenges', filter: `opponent_id=eq.${userId}` },
        async () => {
          const list = await fetchMyPendingChallenges(userId);
          if (alive) setPending(list[0] ?? null);
        },
      )
      .subscribe();

    return () => { alive = false; supabase.removeChannel(channel); };
  }, [userId, tick]);

  return { pending, refresh: () => setTick((t) => t + 1) };
}