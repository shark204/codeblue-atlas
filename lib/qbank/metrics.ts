// ═══════════════════════════════════════════════════════════════
// Metrics fetch + update helpers (Supabase)
// ═══════════════════════════════════════════════════════════════

import { supabase } from '../supabase';
import type { QuestionMetrics, StudentQuestionMetrics } from './types';

/** Load aggregate metrics for a batch of question IDs */
export async function loadQuestionMetrics(
  ids: number[],
): Promise<Map<number, QuestionMetrics>> {
  const map = new Map<number, QuestionMetrics>();
  if (!ids.length) return map;

  const { data, error } = await supabase
    .from('question_metrics')
    .select('*')
    .in('question_id', ids);

  if (error || !data) return map;
  for (const row of data) map.set(row.question_id, row as QuestionMetrics);
  return map;
}

/** Load the current student's metrics for a batch of question IDs */
export async function loadStudentMetrics(
  userId: string,
  ids: number[],
): Promise<Map<number, StudentQuestionMetrics>> {
  const map = new Map<number, StudentQuestionMetrics>();
  if (!ids.length || !userId) return map;

  const { data, error } = await supabase
    .from('student_question_metrics')
    .select('*')
    .eq('user_id', userId)
    .in('question_id', ids);

  if (error || !data) return map;
  for (const row of data) {
    map.set(row.question_id, {
      attempts: row.attempts,
      correct_attempts: row.correct_attempts,
      active_ms: row.active_ms,
      answer_changes: row.answer_changes,
      last_answer: row.last_answer,
      last_correct: row.last_correct,
    });
  }
  return map;
}

/**
 * Record one answer attempt atomically.
 * - Updates both aggregate metrics and personal metrics.
 * - `isFirstAttempt` should be true only the first time the student answers this question.
 */
export async function recordAnswerAttempt(args: {
  userId: string;
  questionId: number;
  correct: boolean;
  isFirstAttempt: boolean;
  activeMs: number;
  answerChanges: number;
  choice: string | null;
  bookmarkDelta?: number; // +1 when bookmarked, -1 when removed
}): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.rpc('increment_question_metrics', {
    p_question_id: args.questionId,
    p_first_attempt: args.isFirstAttempt,
    p_first_correct: args.correct,
    p_active_ms: args.activeMs,
    p_answer_changes: args.answerChanges,
    p_choice: args.choice,
    p_bookmark_delta: args.bookmarkDelta ?? 0,
  });

  if (error) return { ok: false, error: error.message };

  // Personal metrics — read + upsert
  const { data: existing } = await supabase
    .from('student_question_metrics')
    .select('*')
    .eq('user_id', args.userId)
    .eq('question_id', args.questionId)
    .maybeSingle();

  const prev = existing || {
    attempts: 0,
    correct_attempts: 0,
    active_ms: 0,
    answer_changes: 0,
  };

  await supabase.from('student_question_metrics').upsert(
    {
      user_id: args.userId,
      question_id: args.questionId,
      attempts: prev.attempts + 1,
      correct_attempts: prev.correct_attempts + (args.correct ? 1 : 0),
      active_ms: prev.active_ms + Math.max(0, args.activeMs),
      answer_changes: prev.answer_changes + Math.max(0, args.answerChanges),
      last_answer: args.choice,
      last_correct: args.correct,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,question_id' },
  );

  return { ok: true };
}