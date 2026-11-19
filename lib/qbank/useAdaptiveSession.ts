'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';
import type { Question } from '../helpers';
import { orderQuestions, seededShuffle } from './adaptive';
import { loadQuestionMetrics, loadStudentMetrics } from './metrics';
import { dedupeQuestions } from './duplicateFilter';
import type { QuestionForAdaptive, QuestionMetrics, StudentQuestionMetrics } from './types';

type Mode = 'adaptive' | 'shuffle' | 'default';

type Args = {
  questions: Question[];
  userId: string | undefined;
  mode?: Mode;
  seed?: string;
  enabled?: boolean;
  skipDuplicates?: boolean;
};

export function useAdaptiveSession({
  questions,
  userId,
  mode = 'adaptive',
  seed,
  enabled = true,
  skipDuplicates = false,
}: Args) {
  const [metrics, setMetrics] = useState<Map<number, QuestionMetrics>>(new Map());
  const [localMetrics, setLocalMetrics] = useState<Map<number, StudentQuestionMetrics>>(new Map());
  const [ready, setReady] = useState(false);

  // ✅ Deduplicate first (before any network call)
  const cleaned = useMemo(() => {
    if (!skipDuplicates) return questions;
    // ✅ Cast to any عشان dedupeQuestions يقبل Question
    return dedupeQuestions(questions as any) as Question[];
  }, [questions, skipDuplicates]);

  useEffect(() => {
    if (!enabled || !cleaned.length) {
      setReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const ids = cleaned.map((q) => q.id).filter(Boolean);
      const [m, lm] = await Promise.all([
        loadQuestionMetrics(ids),
        userId ? loadStudentMetrics(userId, ids) : Promise.resolve(new Map()),
      ]);
      if (cancelled) return;
      setMetrics(m as Map<number, QuestionMetrics>);
      setLocalMetrics(lm as Map<number, StudentQuestionMetrics>);
      setReady(true);
    })();
    return () => { cancelled = true; };
  }, [cleaned, userId, enabled]);

  const ordered = useMemo(() => {
    if (!enabled) return cleaned;
    if (mode === 'default') return cleaned;
    if (!ready) return cleaned;

    const asAdaptive: QuestionForAdaptive[] = cleaned.map((q) => {
      // ✅ Cast عشان TypeScript ما يشتكيش
      const anyQ = q as any;
      return {
        id: anyQ.id,
        Theme_Category: anyQ.Theme_Category || 'General',
        Difficulty: anyQ.Difficulty ?? 3,
        panel_id: anyQ.panel_id ?? 'mrcs',
        source_file: anyQ.source_file ?? null,
      };
    });

    if (mode === 'shuffle') {
      const shuffled = seededShuffle(asAdaptive, seed ?? 'codeblue-shuffle-v1');
      const byId = new Map(cleaned.map((q) => [q.id, q]));
      return shuffled.map((a) => byId.get(a.id)!).filter(Boolean);
    }

    const result = orderQuestions(asAdaptive, {
      metrics,
      answers: localMetrics,
      seed,
    });
    const byId = new Map(cleaned.map((q) => [q.id, q]));
    return result.map((a) => byId.get(a.id)!).filter(Boolean);
  }, [cleaned, metrics, localMetrics, mode, seed, enabled, ready]);

  return { ordered, ready };
}