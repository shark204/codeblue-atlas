'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import type { RoomChallenge } from './types';
import { fetchChallenge, sendHeartbeat } from './api';

/**
 * Subscribe to a single challenge via Realtime.
 * Also sends heartbeats every 5s while status='live'.
 */
export function useChallenge(challengeId: string | null) {
  const [challenge, setChallenge] = useState<RoomChallenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!challengeId) { setChallenge(null); setLoading(false); return; }
    let alive = true;

    (async () => {
      const c = await fetchChallenge(challengeId);
      if (alive) { setChallenge(c); setLoading(false); }
    })();

    const channel = supabase
      .channel(`challenge:${challengeId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'room_challenges', filter: `id=eq.${challengeId}` },
        (payload) => { if (alive) setChallenge(payload.new as RoomChallenge); },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'challenge_answers', filter: `challenge_id=eq.${challengeId}` },
        () => { /* live opponent activity ping */ },
      )
      .subscribe();

    return () => { alive = false; supabase.removeChannel(channel); };
  }, [challengeId]);

  // Heartbeat every 5s while live
  useEffect(() => {
    if (!challenge || challenge.status !== 'live') return;
    const id = setInterval(() => { sendHeartbeat(challenge.id).catch(() => {}); }, 5000);
    sendHeartbeat(challenge.id).catch(() => {});
    return () => clearInterval(id);
  }, [challenge?.id, challenge?.status]);

  return { challenge, loading };
}