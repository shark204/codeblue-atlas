// ═══════════════════════════════════════════════════════════════
// Mistake Queue — in-session spaced repetition for wrong answers
// Ported from SIRIUS weekly-exams-and-mistake-repetition.md
// ═══════════════════════════════════════════════════════════════

export type MistakeItem = {
  baseQuestionId: number;
  instanceId: string;
  round: number;
  dueAtStep: number;
};

export type DueMistake = MistakeItem;

const SPACING = [5, 7, 10] as const;
const MAX_ROUNDS = 3;

export class MistakeQueue {
  private items: MistakeItem[] = [];

  /**
   * Add a missed question to the queue.
   * If it's already there, re-arm with the next spacing tier.
   */
  add(questionId: number, currentStep: number): void {
    const existing = this.items.find(
      (i) => i.baseQuestionId === questionId,
    );

    if (existing) {
      if (existing.round >= MAX_ROUNDS) {
        return; // already at max rounds, don't re-arm
      }
      const gap = SPACING[Math.min(existing.round, SPACING.length - 1)];
      existing.round += 1;
      existing.dueAtStep = currentStep + gap;
      return;
    }

    this.items.push({
      baseQuestionId: questionId,
      instanceId: `${questionId}#r1`,
      round: 1,
      dueAtStep: currentStep + SPACING[0],
    });
  }

  /** Student answered the repeated question correctly → resolve. */
  markCorrect(questionId: number): void {
    this.items = this.items.filter((i) => i.baseQuestionId !== questionId);
  }

  /** Is there a due mistake for the current step? */
  getDue(currentStep: number): DueMistake | null {
    const due = this.items
      .filter((i) => i.dueAtStep <= currentStep)
      .sort((a, b) => a.dueAtStep - b.dueAtStep);
    return due[0] ?? null;
  }

  size(): number {
    return this.items.length;
  }

  has(questionId: number): boolean {
    return this.items.some((i) => i.baseQuestionId === questionId);
  }

  reset(): void {
    this.items = [];
  }

  snapshot(): MistakeItem[] {
    return this.items.map((i) => ({ ...i }));
  }
}