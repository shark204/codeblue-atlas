// ═══════════════════════════════════════════════════════════════
// Smart Review Queue — aggregate questions that need attention
// ═══════════════════════════════════════════════════════════════

import { supabase } from '../supabase';
import type { Question } from '../helpers';

export type ReviewBucket = 'wrong' | 'bookmarked' | 'weak';

export type ReviewItem = {
  question: Question;
  reason: ReviewBucket;
  // Stats for display
  attempts: number;
  correct_attempts: number;
  accuracy: number;      // 0..100
  last_seen_at: string | null;
  category: string;
  difficulty: number;
};

export type ReviewSummary = {
  wrong: ReviewItem[];
  bookmarked: ReviewItem[];
  weak: ReviewItem[];
  total: number;
};

/**
 * Fetch all questions that need review for a user in a panel.
 * Includes:
 *  - Wrong: student got it wrong (correct_attempts < attempts)
 *  - Bookmarked: student flagged it
 *  - Weak: category where student's accuracy < 70%
 */
export async function fetchReviewQueue(args: {
  userId: string;
  panelId: string;
  weakThreshold?: number;  // default 70
}): Promise<ReviewSummary> {
  const { userId, panelId, weakThreshold = 70 } = args;

  const empty: ReviewSummary = { wrong: [], bookmarked: [], weak: [], total: 0 };
  if (!userId) return empty;

  // ─── 1) Wrong questions ───
  const { data: wrongRows } = await supabase
    .from('student_question_metrics')
    .select('question_id, attempts, correct_attempts, last_seen_at:updated_at, last_correct')
    .eq('user_id', userId)
    .filter('attempts', 'gt', 0);

  const wrongIds: number[] = [];
  const statsById = new Map<number, any>();
  for (const row of wrongRows || []) {
    statsById.set(row.question_id, row);
    if (row.correct_attempts < row.attempts) {
      wrongIds.push(row.question_id);
    }
  }

  // ─── 2) Bookmarked questions ───
  const { data: bookmarkRows } = await supabase
    .from('question_bookmarks')
    .select('question_id')
    .eq('user_id', userId);

  const bookmarkedIds: number[] = (bookmarkRows || []).map((r: any) => r.question_id);

  // ─── 3) Combine + fetch question details ───
  const allIds = Array.from(new Set([...wrongIds, ...bookmarkedIds]));
  if (!allIds.length) return empty;

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .in('id', allIds)
    .eq('panel_id', panelId);

  const byId = new Map<number, Question>();
  for (const q of questions || []) byId.set(q.id, q as Question);

  // ─── 4) Build items ───
  const wrong: ReviewItem[] = [];
  const bookmarked: ReviewItem[] = [];

  for (const id of wrongIds) {
    const q = byId.get(id);
    if (!q) continue;
    const st = statsById.get(id);
    const attempts = st?.attempts ?? 0;
    const correct = st?.correct_attempts ?? 0;
    wrong.push({
      question: q,
      reason: 'wrong',
      attempts,
      correct_attempts: correct,
      accuracy: attempts ? Math.round((correct / attempts) * 100) : 0,
      last_seen_at: st?.last_seen_at ?? null,
      category: q.Theme_Category || 'General',
      difficulty: q.Difficulty ?? 1,
    });
  }

  for (const id of bookmarkedIds) {
    const q = byId.get(id);
    if (!q) continue;
    const st = statsById.get(id);
    const attempts = st?.attempts ?? 0;
    const correct = st?.correct_attempts ?? 0;
    bookmarked.push({
      question: q,
      reason: 'bookmarked',
      attempts,
      correct_attempts: correct,
      accuracy: attempts ? Math.round((correct / attempts) * 100) : 0,
      last_seen_at: st?.last_seen_at ?? null,
      category: q.Theme_Category || 'General',
      difficulty: q.Difficulty ?? 1,
    });
  }

  // ─── 5) Compute weak categories ───
  const catStats = new Map<string, { attempts: number; correct: number; items: ReviewItem[] }>();
  for (const item of [...wrong, ...bookmarked]) {
    if (!catStats.has(item.category)) catStats.set(item.category, { attempts: 0, correct: 0, items: [] });
    const c = catStats.get(item.category)!;
    c.attempts += item.attempts;
    c.correct += item.correct_attempts;
    c.items.push(item);
  }

  const weak: ReviewItem[] = [];
  for (const [category, stat] of catStats.entries()) {
    const acc = stat.attempts ? (stat.correct / stat.attempts) * 100 : 0;
    if (acc < weakThreshold) {
      // خد أفقر 5 أسئلة في الفئة
      const top = stat.items
        .slice()
        .sort((a, b) => a.accuracy - b.accuracy || a.attempts - b.attempts)
        .slice(0, 5);
      weak.push(...top);
    }
  }

  // De-duplicate weak (remove those already in wrong)
  const wrongSet = new Set(wrong.map((w) => w.question.id));
  const uniqueWeak = weak.filter((w) => !wrongSet.has(w.question.id));

  const total = new Set([
    ...wrong.map((w) => w.question.id),
    ...bookmarked.map((b) => b.question.id),
    ...uniqueWeak.map((w) => w.question.id),
  ]).size;

  return { wrong, bookmarked, weak: uniqueWeak, total };
}

/** Get summary counts without full fetch (faster) */
export async function fetchReviewCounts(userId: string): Promise<{
  wrong: number;
  bookmarked: number;
  total: number;
}> {
  if (!userId) return { wrong: 0, bookmarked: 0, total: 0 };

  const [metricsRes, bookmarksRes] = await Promise.all([
    supabase
      .from('student_question_metrics')
      .select('question_id, attempts, correct_attempts')
      .eq('user_id', userId)
      .filter('attempts', 'gt', 0),
    supabase
      .from('question_bookmarks')
      .select('question_id')
      .eq('user_id', userId),
  ]);

  const wrongCount = (metricsRes.data || []).filter(
    (r: any) => r.correct_attempts < r.attempts,
  ).length;

  const bookmarkedCount = (bookmarksRes.data || []).length;

  const allIds = new Set<number>();
  (metricsRes.data || []).forEach((r: any) => allIds.add(r.question_id));
  (bookmarksRes.data || []).forEach((r: any) => allIds.add(r.question_id));

  return {
    wrong: wrongCount,
    bookmarked: bookmarkedCount,
    total: allIds.size,
  };
}