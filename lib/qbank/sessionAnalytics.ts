// ═══════════════════════════════════════════════════════════════
// Session Analytics — compute end-of-session summary
// ═══════════════════════════════════════════════════════════════

import type { Question } from '../helpers';
import { getCorrectLetter } from '../helpers';

export type SessionStats = {
  total: number;
  answered: number;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number;         // 0..100
  durationMs: number;       // session duration
  avgTimePerQuestion: number;

  // Breakdown by Theme_Category
  byCategory: Array<{
    category: string;
    total: number;
    correct: number;
    accuracy: number;
  }>;

  // Breakdown by Difficulty
  byDifficulty: Array<{
    difficulty: number;
    total: number;
    correct: number;
    accuracy: number;
  }>;

  // List of wrong question IDs (for review)
  wrongIds: number[];
  correctIds: number[];
  skippedIds: number[];
};

export function computeSessionStats(args: {
  questions: Question[];
  answers: { [key: number]: string };
  startedAt: number;         // timestamp (ms)
  endedAt?: number;          // default: now
}): SessionStats {
  const { questions, answers } = args;
  const endedAt = args.endedAt ?? Date.now();
  const durationMs = Math.max(0, endedAt - args.startedAt);

  const byCatMap = new Map<string, { total: number; correct: number }>();
  const byDiffMap = new Map<number, { total: number; correct: number }>();
  const wrongIds: number[] = [];
  const correctIds: number[] = [];
  const skippedIds: number[] = [];

  let answered = 0;
  let correct = 0;

  for (const q of questions) {
    const given = answers[q.id];
    const correctLetter = getCorrectLetter(q.Correct_Answer);

    const cat = q.Theme_Category || 'General';
    const diff = q.Difficulty ?? 1;

    if (!byCatMap.has(cat)) byCatMap.set(cat, { total: 0, correct: 0 });
    if (!byDiffMap.has(diff)) byDiffMap.set(diff, { total: 0, correct: 0 });

    byCatMap.get(cat)!.total += 1;
    byDiffMap.get(diff)!.total += 1;

    if (!given) {
      skippedIds.push(q.id);
      continue;
    }

    answered += 1;
    const isCorrect = given === correctLetter;
    if (isCorrect) {
      correct += 1;
      correctIds.push(q.id);
      byCatMap.get(cat)!.correct += 1;
      byDiffMap.get(diff)!.correct += 1;
    } else {
      wrongIds.push(q.id);
    }
  }

  const incorrect = answered - correct;
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  const avgTimePerQuestion = answered > 0 ? Math.round(durationMs / answered) : 0;

  const byCategory = [...byCatMap.entries()]
    .map(([category, v]) => ({
      category,
      total: v.total,
      correct: v.correct,
      accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy); // الأسوأ الأول

  const byDifficulty = [...byDiffMap.entries()]
    .map(([difficulty, v]) => ({
      difficulty,
      total: v.total,
      correct: v.correct,
      accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 0,
    }))
    .sort((a, b) => a.difficulty - b.difficulty);

  return {
    total: questions.length,
    answered,
    correct,
    incorrect,
    skipped: skippedIds.length,
    accuracy,
    durationMs,
    avgTimePerQuestion,
    byCategory,
    byDifficulty,
    wrongIds,
    correctIds,
    skippedIds,
  };
}

export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}