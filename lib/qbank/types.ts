// ═══════════════════════════════════════════════════════════════
// QBank Adaptive — Shared Types & Helpers
// ═══════════════════════════════════════════════════════════════

export type QuestionForAdaptive = {
  id: number;
  Theme_Category: string;
  Difficulty: number;
  panel_id: string;
  source_file: string | null;
};

export type QuestionMetrics = {
  question_id: number;
  first_attempts: number;
  first_correct: number;
  total_active_ms: number;
  answer_changes: number;
  choice_counts: Record<string, number>;
  report_count: number;
  bookmark_count: number;
  updated_at?: string;
};

export type StudentQuestionMetrics = {
  attempts: number;
  correct_attempts: number;
  active_ms: number;
  answer_changes: number;
  last_answer: string | null;
  last_correct: boolean | null;
};

export type SessionMode = 'adaptive' | 'shuffle' | 'default';

/** Map integer difficulty (1-5) → normalized prior [0,1] */
export function difficultyPrior(difficulty: number | null | undefined): number {
  const d = Math.max(1, Math.min(5, Number(difficulty) || 3));
  return (
    {
      1: 0.20,
      2: 0.35,
      3: 0.50,
      4: 0.70,
      5: 0.85,
    }[d] ?? 0.50
  );
}

/** Normalized target difficulty from student ability + progress */
export function targetFromAbility(
  ability: number,
  position: number,
  total: number,
): number {
  const progress = total > 1 ? position / (total - 1) : 0;
  const target = 0.28 + progress * 0.42 + ability * 0.16;
  return Math.max(0.20, Math.min(0.88, target));
}