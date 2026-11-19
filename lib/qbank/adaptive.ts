// ═══════════════════════════════════════════════════════════════
// Adaptive Ordering — deterministic, seeded, block-aware
// Ported from SIRIUS adaptive-ordering.js (pure TS)
// ═══════════════════════════════════════════════════════════════

import type { QuestionForAdaptive, QuestionMetrics, StudentQuestionMetrics } from './types';
import { targetFromAbility } from './types';
import { scoreQuestion } from './score';

function fnv1a(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  }
  return h >>> 0;
}

function stableRank(seed: string, id: string): number {
  return fnv1a(`${seed}|${id}`) / 4294967296;
}

function studentAbility(answers: Map<number, StudentQuestionMetrics>): number {
  let attempts = 0;
  let correct = 0;
  for (const a of answers.values()) {
    attempts += a.attempts;
    correct += a.correct_attempts;
  }
  return attempts ? Math.max(0, Math.min(1, correct / attempts)) : 0.5;
}

export type AdaptiveContext = {
  metrics: Map<number, QuestionMetrics>;
  answers: Map<number, StudentQuestionMetrics>;
  seed?: string;
  lastOutcome?: 'correct' | 'wrong' | null;
};

/**
 * Order questions intelligently.
 * - Prefers questions near a target difficulty that rises with progress.
 * - Bonus for questions the student is weak on.
 * - Penalty for repeating the same Theme_Category back-to-back.
 * - Deterministic: same seed → same order.
 */
export function orderQuestions(
  questions: QuestionForAdaptive[],
  ctx: AdaptiveContext,
): QuestionForAdaptive[] {
  const seed = ctx.seed ?? 'codeblue-adaptive-v1';
  const ability = studentAbility(ctx.answers);
  const total = questions.length;
  if (total === 0) return [];

  // Pre-score everything once
  const scored = questions.map((q) => ({
    question: q,
    score: scoreQuestion(q, ctx.metrics.get(q.id), ctx.answers.get(q.id)),
  }));

  const pool = [...scored];
  const ordered: QuestionForAdaptive[] = [];
  let lastCategory = '';
  let lastOutcome = ctx.lastOutcome ?? null;

  for (let position = 0; position < total; position++) {
    if (!pool.length) break;

    const target = targetFromAbility(ability, position, total);

    // Score each remaining candidate for this position
    const ranked = pool.map((item) => {
      const sameCat = item.question.Theme_Category === lastCategory;
      const proximity = Math.abs(item.score.difficultyScore - target);
      const weakBonus =
        (ctx.answers.get(item.question.id)?.attempts ?? 0) > 0 &&
        (ctx.answers.get(item.question.id)?.correct_attempts ?? 0) <
          (ctx.answers.get(item.question.id)?.attempts ?? 0)
          ? 0.14
          : 0;
      const calibration = item.score.sampleSize < 30 ? 0.04 : 0;
      const varietyPenalty = sameCat ? 0.035 : 0;
      const tie = stableRank(`${seed}|${position}`, String(item.question.id));

      return {
        item,
        positionScore:
          proximity - weakBonus - calibration + varietyPenalty + tie * 0.0001,
      };
    });

    ranked.sort(
      (a, b) =>
        a.positionScore - b.positionScore ||
        a.item.question.id - b.item.question.id,
    );

    const chosen = ranked[0].item;
    ordered.push(chosen.question);
    lastCategory = chosen.question.Theme_Category;

    // Update lastOutcome for next iteration's target adjustment
    const rec = ctx.answers.get(chosen.question.id);
    if (rec) lastOutcome = rec.last_correct ? 'correct' : 'wrong';

    // Remove from pool
    const idx = pool.findIndex((p) => p.question.id === chosen.question.id);
    if (idx >= 0) pool.splice(idx, 1);
  }

  return ordered;
}

/** Deterministic shuffle (Fisher-Yates with seeded RNG) */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  const arr = [...items];
  let s = fnv1a(seed);
  const rng = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}