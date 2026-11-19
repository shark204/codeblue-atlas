// ═══════════════════════════════════════════════════════════════
// Bookmarks Service + Community Aggregates
// ═══════════════════════════════════════════════════════════════

import { supabase } from '../supabase';
import type { Question } from '../helpers';

export type CommunityBookmark = {
  question_id: number;
  bookmark_count: number;
  Theme_Category: string;
  panel_id: string;
};

// ─── Personal: toggle ───
export async function toggleBookmark(args: {
  userId: string;
  questionId: number;
  active: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  if (args.active) {
    const { error } = await supabase
      .from('question_bookmarks')
      .insert({ user_id: args.userId, question_id: args.questionId });
    if (error && !error.message.includes('duplicate')) {
      return { ok: false, error: error.message };
    }
  } else {
    const { error } = await supabase
      .from('question_bookmarks')
      .delete()
      .eq('user_id', args.userId)
      .eq('question_id', args.questionId);
    if (error) return { ok: false, error: error.message };
  }
  return { ok: true };
}

// ─── Personal: list ───
export async function fetchMyBookmarks(args: {
  userId: string;
  panelId: string;
}): Promise<Question[]> {
  const { data: rows } = await supabase
    .from('question_bookmarks')
    .select('question_id')
    .eq('user_id', args.userId);
  if (!rows?.length) return [];

  const ids = rows.map((r: any) => r.question_id);
  const { data: qs } = await supabase
    .from('questions')
    .select('*')
    .in('id', ids)
    .eq('panel_id', args.panelId);

  return (qs || []) as Question[];
}

// ─── Community aggregates (no identity) ───
export async function fetchCommunityBookmarks(args: {
  panelId: string;
  limit?: number;
}): Promise<CommunityBookmark[]> {
  const { data } = await supabase
    .from('community_bookmark_counts')
    .select('question_id, bookmark_count, Theme_Category, panel_id')
    .eq('panel_id', args.panelId)
    .gt('bookmark_count', 0)
    .order('bookmark_count', { ascending: false })
    .limit(args.limit ?? 50);
  return (data || []) as CommunityBookmark[];
}