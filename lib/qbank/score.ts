// ═══════════════════════════════════════════════════════════════
// Question Scoring — difficulty + review-need signals
// Ported from SIRIUS question-score.js (pure TS)
// ═══════════════════════════════════════════════════════════════

import type { QuestionForAdaptive, QuestionMetrics, StudentQuestionMetrics } from './types';
import { difficultyPrior } from './types';

function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, Number(v) || 0));
}

function countSignal(value: number, saturation: number): number {
  return clamp(Math.max(0, value) / Math.max(1, saturation));
}

function errorSignal(metrics: QuestionMetrics | undefined, prior: number): number {
  const attempts = metrics?.first_attempts ?? 0;
  if (!attempts) return 1 - prior;
  const correct = metrics?.first_correct ?? 0;
  return clamp(1 - correct / attempts);
}

function timeSignal(metrics: QuestionMetrics | undefined, maxMs = 120_000): number {
  const attempts = Math.max(1, metrics?.first_attempts ?? 0);
  const avg = (metrics?.total_active_ms ?? 0) / attempts;
  return clamp(Math.log1p(avg) / Math.log1p(maxMs));
}

function answerChangeSignal(metrics: QuestionMetrics | undefined): number {
  const attempts = Math.max(1, metrics?.first_attempts ?? 0);
  return clamp((metrics?.answer_changes ?? 0) / attempts / 3);
}

function choiceAmbiguity(metrics: QuestionMetrics | undefined): number {
  const counts = metrics?.choice_counts
    ? Object.values(metrics.choice_counts).map((v) => Math.max(0, Number(v) || 0))
    : [];
  const total = counts.reduce((s, v) => s + v, 0);
  if (counts.length < 2 || total < 5) return 0;
  const largestShare = Math.max(...counts) / total;
  const entropy =
    counts.reduce((s, c) => {
      if (!c) return s;
      const share = c / total;
      return s - share * Math.log(share);
    }, 0) / Math.log(counts.length);
  return clamp((entropy * 0.7 + (1 - largestShare) * 0.3) * clamp(total / 25));
}

function personalWeakness(local: StudentQuestionMetrics | undefined): number {
  const attempts = local?.attempts ?? 0;
  if (!attempts) return 0;
  const accuracy = clamp((local?.correct_attempts ?? 0) / attempts);
  return clamp((0.7 - accuracy) * 0.22, -0.15, 0.15);
}

export type QuestionScore = {
  questionId: number;
  difficultyScore: number;   // 0..1
  reviewNeed: number;         // 0..1
  reportSignal: number;       // 0..1
  selectionScore: number;     // final blended score
  sampleSize: number;
  components: {
    error: number;
    activeTime: number;
    answerChanges: number;
    choiceAmbiguity: number;
  };
};

export function scoreQuestion(
  question: QuestionForAdaptive,
  metrics?: QuestionMetrics,
  local?: StudentQuestionMetrics,
): QuestionScore {
  const prior = difficultyPrior(question.Difficulty);
  const attempts = metrics?.first_attempts ?? 0;

  const observed =
    0.55 * errorSignal(metrics, prior) +
    0.17 * timeSignal(metrics) +
    0.08 * answerChangeSignal(metrics) +
    0.05 * countSignal(metrics?.report_count ?? 0, 5) +
    0.15 * choiceAmbiguity(metrics);

  const difficultyScore = clamp(
    (attempts >= 3 ? observed : prior) + personalWeakness(local),
  );

  const reviewNeed = countSignal(metrics?.bookmark_count ?? 0, 20);

  return {
    questionId: question.id,
    difficultyScore,
    reviewNeed,
    reportSignal: countSignal(metrics?.report_count ?? 0, 5),
    selectionScore: clamp(difficultyScore * 0.82 + reviewNeed * 0.18),
    sampleSize: attempts,
    components: {
      error: errorSignal(metrics, prior),
      activeTime: timeSignal(metrics),
      answerChanges: answerChangeSignal(metrics),
      choiceAmbiguity: choiceAmbiguity(metrics),
    },
  };
}