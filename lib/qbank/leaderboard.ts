// ═══════════════════════════════════════════════════════════════
// Leaderboard Service + Profile Management
// ═══════════════════════════════════════════════════════════════

import { supabase } from '../supabase';

export type UserProfile = {
  user_id: string;
  public_alias: string;
  avatar_id: string;
  ghost_mode: boolean;
  total_attempts: number;
  total_correct: number;
  active_ms: number;
  completed_sessions: number;
};

export type LeaderboardRow = {
  rank: number;
  user_id: string;
  public_alias: string;
  avatar_id: string;
  total_attempts: number;
  accuracy: number;
  active_ms: number;
};

export async function ensureProfile(): Promise<void> {
  try {
    await supabase.rpc('ensure_user_profile');
  } catch (err) {
    console.warn('[leaderboard] ensureProfile failed:', err);
  }
}

export async function fetchMyProfile(userId: string): Promise<UserProfile | null> {
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return (data || null) as UserProfile | null;
}

export async function updateProfile(args: {
  userId: string;
  public_alias?: string;
  avatar_id?: string;
  ghost_mode?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const patch: Record<string, any> = {};
  if (args.public_alias !== undefined) patch.public_alias = args.public_alias;
  if (args.avatar_id !== undefined) patch.avatar_id = args.avatar_id;
  if (args.ghost_mode !== undefined) patch.ghost_mode = args.ghost_mode;

  const { error } = await supabase
    .from('user_profiles')
    .update(patch)
    .eq('user_id', args.userId);

  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function fetchLeaderboard(limit = 50): Promise<LeaderboardRow[]> {
  const { data } = await supabase
    .from('user_profiles')
    .select('user_id, public_alias, avatar_id, total_attempts, total_correct, active_ms')
    .eq('ghost_mode', false)
    .gt('total_attempts', 0)
    .order('total_attempts', { ascending: false })
    .limit(limit);

  if (!data) return [];
  return data.map((r: any, i: number) => ({
    rank: i + 1,
    user_id: r.user_id,
    public_alias: r.public_alias,
    avatar_id: r.avatar_id,
    total_attempts: r.total_attempts,
    accuracy: r.total_attempts > 0 ? Math.round((r.total_correct / r.total_attempts) * 100) : 0,
    active_ms: r.active_ms,
  }));
}

export async function bumpProfileStats(args: {
  correct: boolean;
  activeMs: number;
}): Promise<void> {
  try {
    await supabase.rpc('bump_profile_stats', {
      p_correct: args.correct,
      p_active_ms: Math.max(0, Number(args.activeMs) || 0),
    });
  } catch (err) {
    console.warn('[leaderboard] bumpProfileStats failed:', err);
  }
}