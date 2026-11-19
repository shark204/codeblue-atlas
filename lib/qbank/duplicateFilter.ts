// ═══════════════════════════════════════════════════════════════
// Duplicate Question Filter
// ═══════════════════════════════════════════════════════════════

export type DuplicateTagged = {
  id: number;
  duplicate_id?: string | null;
  /** بقية الحقول مسموحة */
  [key: string]: any;
};

/**
 * Keep one deterministic survivor per duplicate_id group.
 * Untagged questions always pass.
 * Survivor = lexicographically smallest stable id.
 */
export function dedupeQuestions<T extends DuplicateTagged>(list: T[]): T[] {
  if (!Array.isArray(list) || list.length === 0) return list;

  const winnerByGroup = new Map<string, number>();
  for (const q of list) {
    const g = String(q.duplicate_id || '').trim();
    if (!g) continue;
    const existing = winnerByGroup.get(g);
    if (existing === undefined || q.id < existing) {
      winnerByGroup.set(g, q.id);
    }
  }

  return list.filter((q) => {
    const g = String(q.duplicate_id || '').trim();
    if (!g) return true;
    return q.id === winnerByGroup.get(g);
  });
}