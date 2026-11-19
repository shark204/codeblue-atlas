'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { RoomChallenge, RoomCrown } from './types';
import { fetchRoomChallenges, fetchRoomCrown } from './api';

/** Realtime list of all challenges in a room + crown. */
export function useRoomChallenges(roomId: string | null) {
  const [challenges, setChallenges] = useState<RoomChallenge[]>([]);
  const [crown, setCrown] = useState<RoomCrown | null>(null);

  useEffect(() => {
    if (!roomId) return;
    let alive = true;

    (async () => {
      const [list, c] = await Promise.all([
        fetchRoomChallenges(roomId, 20),
        fetchRoomCrown(roomId),
      ]);
      if (!alive) return;
      setChallenges(list);
      setCrown(c);
    })();

    const channel = supabase
      .channel(`room-challenges:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_challenges', filter: `room_id=eq.${roomId}` },
        () => { fetchRoomChallenges(roomId, 20).then((l) => { if (alive) setChallenges(l); }); },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_crowns', filter: `room_id=eq.${roomId}` },
        (p) => { if (alive) setCrown((p.new as RoomCrown) || null); },
      )
      .subscribe();

    return () => { alive = false; supabase.removeChannel(channel); };
  }, [roomId]);

  return { challenges, crown };
}