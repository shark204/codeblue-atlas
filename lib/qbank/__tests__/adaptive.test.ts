// ═══════════════════════════════════════════════════════════════
// Basic sanity tests for the adaptive ordering pipeline.
// Run with:  npx tsx lib/qbank/__tests__/adaptive.test.ts
// ═══════════════════════════════════════════════════════════════

import { orderQuestions, seededShuffle } from '../adaptive';
import { scoreQuestion } from '../score';
import { difficultyPrior, targetFromAbility } from '../types';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`✅ ${name}`);
  } catch (err: any) {
    failed++;
    console.error(`❌ ${name}\n   ${err?.message || err}`);
  }
}

function assert(cond: any, msg: string) {
  if (!cond) throw new Error(msg);
}

// ═══ difficultyPrior ═══
test('difficultyPrior maps 1..5 monotonically', () => {
  const p1 = difficultyPrior(1);
  const p3 = difficultyPrior(3);
  const p5 = difficultyPrior(5);
  assert(p1 < p3, 'prior(1) should be < prior(3)');
  assert(p3 < p5, 'prior(3) should be < prior(5)');
});

// ═══ targetFromAbility ═══
test('targetFromAbility rises with progress', () => {
  const early = targetFromAbility(0.5, 0, 10);
  const late = targetFromAbility(0.5, 9, 10);
  assert(late > early, 'target should rise near end');
});

test('targetFromAbility stays in [0.20, 0.88]', () => {
  for (let p = 0; p < 20; p++) {
    const t = targetFromAbility(0.9, p, 20);
    assert(t >= 0.20 && t <= 0.88, `target out of range: ${t}`);
  }
});

// ═══ scoreQuestion ═══
test('scoreQuestion returns prior when no metrics', () => {
  const q = { id: 1, Theme_Category: 'X', Difficulty: 3, panel_id: 'mrcs', source_file: null };
  const s = scoreQuestion(q);
  assert(s.difficultyScore === difficultyPrior(3), 'should equal prior');
  assert(s.sampleSize === 0, 'no sample size');
});

test('scoreQuestion shows higher difficulty when error rate is high', () => {
  const q = { id: 1, Theme_Category: 'X', Difficulty: 3, panel_id: 'mrcs', source_file: null };
  const lowErr = scoreQuestion(q, {
    question_id: 1, first_attempts: 10, first_correct: 9,
    total_active_ms: 60_000, answer_changes: 0, choice_counts: {},
    report_count: 0, bookmark_count: 0,
  });
  const highErr = scoreQuestion(q, {
    question_id: 1, first_attempts: 10, first_correct: 2,
    total_active_ms: 60_000, answer_changes: 0, choice_counts: {},
    report_count: 0, bookmark_count: 0,
  });
  assert(highErr.difficultyScore > lowErr.difficultyScore, 'high error → higher difficulty');
});

// ═══ seededShuffle ═══
test('seededShuffle is deterministic for the same seed', () => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const a = seededShuffle(arr, 'seed-a');
  const b = seededShuffle(arr, 'seed-a');
  assert(JSON.stringify(a) === JSON.stringify(b), 'same seed → same order');
});

test('seededShuffle differs for different seeds', () => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const a = seededShuffle(arr, 'seed-a');
  const b = seededShuffle(arr, 'seed-b');
  assert(JSON.stringify(a) !== JSON.stringify(b), 'different seed → different order');
});

test('seededShuffle preserves all items', () => {
  const arr = [1, 2, 3, 4, 5];
  const out = seededShuffle(arr, 'x');
  assert(out.length === arr.length, 'length preserved');
  assert(arr.every((x) => out.includes(x)), 'all items present');
});

// ═══ orderQuestions ═══
test('orderQuestions is deterministic with same seed', () => {
  const questions = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    Theme_Category: `C${i % 3}`,
    Difficulty: (i % 5) + 1,
    panel_id: 'mrcs',
    source_file: null,
  }));
  const ctx = { metrics: new Map(), answers: new Map(), seed: 'test' };
  const a = orderQuestions(questions, ctx);
  const b = orderQuestions(questions, ctx);
  assert(JSON.stringify(a.map((q) => q.id)) === JSON.stringify(b.map((q) => q.id)), 'deterministic');
});

test('orderQuestions returns all questions', () => {
  const questions = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    Theme_Category: `C${i % 3}`,
    Difficulty: 3,
    panel_id: 'mrcs',
    source_file: null,
  }));
  const out = orderQuestions(questions, { metrics: new Map(), answers: new Map() });
  assert(out.length === questions.length, 'all questions preserved');
});

test('orderQuestions avoids repeating categories back-to-back when possible', () => {
  const questions = [
    { id: 1, Theme_Category: 'A', Difficulty: 3, panel_id: 'mrcs', source_file: null },
    { id: 2, Theme_Category: 'A', Difficulty: 3, panel_id: 'mrcs', source_file: null },
    { id: 3, Theme_Category: 'B', Difficulty: 3, panel_id: 'mrcs', source_file: null },
  ];
  const out = orderQuestions(questions, { metrics: new Map(), answers: new Map(), seed: 'x' });
  let consecutive = 0;
  for (let i = 1; i < out.length; i++) {
    if (out[i].Theme_Category === out[i - 1].Theme_Category) consecutive++;
  }
  assert(consecutive <= 1, `too many consecutive same-category: ${consecutive}`);
});

// ═══ Summary ═══
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);