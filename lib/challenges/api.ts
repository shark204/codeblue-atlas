// ═══════════════════════════════════════════════════════════════
// Live Challenges — API Layer
// ═══════════════════════════════════════════════════════════════

import { supabase } from '../supabase';
import type {
  RoomChallenge, RoomCrown, WeeklyStats, ChallengeRules,
  ChallengeAnswer, ChallengeScore,
} from './types';

// ─── Create ───
export async function createChallenge(args: {
  roomId: string;
  opponentId: string;
  questionIds: number[];
  seed: string;
  rules: ChallengeRules;
  acceptSeconds?: number;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const { data, error } = await supabase.rpc('create_challenge', {
    p_room_id: args.roomId,
    p_opponent_id: args.opponentId,
    p_question_ids: args.questionIds,
    p_seed: args.seed,
    p_rules: args.rules,
    p_accept_seconds: args.acceptSeconds ?? 60,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data as string };
}

// ─── Accept / Decline ───
export async function acceptChallenge(id: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.rpc('accept_challenge', { p_challenge_id: id });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function declineChallenge(id: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.rpc('decline_challenge', { p_challenge_id: id });
  return error ? { ok: false, error: error.message } : { ok: true };
}

// ─── Ready ───
export async function setChallengeReady(id: string): Promise<{
  ok: boolean;
  status?: string;
  challenger_ready?: boolean;
  opponent_ready?: boolean;
  started_at?: string | null;
  error?: string;
}> {
  const { data, error } = await supabase.rpc('set_challenge_ready', { p_challenge_id: id });
  if (error) return { ok: false, error: error.message };
  const j = data as any;
  return {
    ok: true,
    status: j.status,
    challenger_ready: j.challenger_ready,
    opponent_ready: j.opponent_ready,
    started_at: j.started_at,
  };
}

// ─── Answer ───
export async function submitChallengeAnswer(args: {
  challengeId: string;
  questionId: number;
  choice: string;
  timeMs: number;
}): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.rpc('submit_challenge_answer', {
    p_challenge_id: args.challengeId,
    p_question_id: args.questionId,
    p_choice: args.choice,
    p_time_ms: args.timeMs,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

// ─── Finalize ───
export async function finalizeChallenge(id: string): Promise<{
  ok: boolean;
  winner_id?: string | null;
  challenger_score?: ChallengeScore;
  opponent_score?: ChallengeScore;
  error?: string;
}> {
  const { data, error } = await supabase.rpc('finalize_challenge', { p_challenge_id: id });
  if (error) return { ok: false, error: error.message };
  const j = data as any;
  return {
    ok: true,
    winner_id: j.winner_id,
    challenger_score: j.challenger_score,
    opponent_score: j.opponent_score,
  };
}

// ─── Heartbeat ───
export async function sendHeartbeat(challengeId: string): Promise<void> {
  await supabase.rpc('challenge_heartbeat', { p_challenge_id: challengeId });
}

// ─── Fetch one ───
export async function fetchChallenge(id: string): Promise<RoomChallenge | null> {
  const { data, error } = await supabase
    .from('room_challenges')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return data as RoomChallenge;
}

// ─── Fetch recent challenges for a room ───
export async function fetchRoomChallenges(roomId: string, limit = 20): Promise<RoomChallenge[]> {
  const { data } = await supabase
    .from('room_challenges')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data || []) as RoomChallenge[];
}

// ─── Fetch my pending incoming challenges ───
export async function fetchMyPendingChallenges(userId: string): Promise<RoomChallenge[]> {
  const { data } = await supabase
    .from('room_challenges')
    .select('*')
    .eq('opponent_id', userId)
    .in('status', ['pending'])
    .gt('accept_deadline', new Date().toISOString())
    .order('created_at', { ascending: false });
  return (data || []) as RoomChallenge[];
}

// ─── Fetch active live challenge for user ───
export async function fetchMyLiveChallenge(userId: string): Promise<RoomChallenge | null> {
  const { data } = await supabase
    .from('room_challenges')
    .select('*')
    .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
    .in('status', ['ready_wait', 'live'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data || null) as RoomChallenge | null;
}

// ─── Fetch answers of a challenge ───
export async function fetchChallengeAnswers(challengeId: string, userId?: string): Promise<ChallengeAnswer[]> {
  let q = supabase
    .from('challenge_answers')
    .select('*')
    .eq('challenge_id', challengeId);
  if (userId) q = q.eq('user_id', userId);
  const { data } = await q;
  return (data || []) as ChallengeAnswer[];
}

// ─── Crown ───
export async function fetchRoomCrown(roomId: string): Promise<RoomCrown | null> {
  const { data } = await supabase
    .from('room_crowns')
    .select('*')
    .eq('room_id', roomId)
    .maybeSingle();
  return (data || null) as RoomCrown | null;
}

// ─── Weekly stats ───
export async function fetchWeeklyStats(userId: string): Promise<WeeklyStats | null> {
  const week = getWeekKey(new Date());
  const { data } = await supabase
    .from('challenge_weekly_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('week_key', week)
    .maybeSingle();
  return (data || null) as WeeklyStats | null;
}

export function getWeekKey(d: Date): string {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.valueOf() - firstThursday.valueOf();
  const week = 1 + Math.round(diff / (7 * 24 * 3600 * 1000));
  return `${target.getFullYear()}-W${String(week).padStart(2, '0')}`;
}