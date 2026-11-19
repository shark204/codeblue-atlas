import { supabase } from '../supabase';
import type { SourceDoc, AIExplanation } from './types';

export async function searchSources(args: {
  query: string;
  category?: string;
  limit?: number;
}): Promise<SourceDoc[]> {
  const { data, error } = await supabase.rpc('search_sources', {
    p_query: args.query,
    p_category: args.category ?? null,
    p_limit: args.limit ?? 5,
  });
  if (error) return [];
  return (data || []) as SourceDoc[];
}

export async function fetchCachedExplanation(questionId: number): Promise<AIExplanation | null> {
  const { data } = await supabase
    .from('ai_explanations')
    .select('*')
    .eq('question_id', questionId)
    .eq('is_approved', true)
    .maybeSingle();
  return (data || null) as AIExplanation | null;
}

export async function canGenerateAI(): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_generate_ai', { p_daily_limit: 20 });
  if (error) return false;
  return !!data;
}

export async function logAIUsage(questionId: number): Promise<void> {
  await supabase.rpc('log_ai_usage', { p_question_id: questionId });
}

/** Generate AI explanation via API route */
export async function generateExplanation(args: {
  questionId: number;
  questionText: string;
  options: Record<string, string>;
  correctAnswer: string;
  category?: string;
}): Promise<{ ok: boolean; content?: string; error?: string; sourceIds?: string[] }> {
  try {
    const sources = await searchSources({
      query: args.questionText.slice(0, 300),
      category: args.category,
      limit: 5,
    });

    // 🛡️ جلب توكن المستخدم الحالي وإرساله مع الطلب
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      return { ok: false, error: 'يجب تسجيل الدخول لاستخدام الذكاء الاصطناعي' };
    }

    // لو مفيش cache، اطلب من الـ API
    const res = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        question: args.questionText,
        options: args.options,
        correctAnswer: args.correctAnswer,
        sources: sources.map((s) => ({ id: s.id, title: s.title, snippet: s.snippet })),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.error || 'AI failed' };
    }

    const j = await res.json();
    await logAIUsage(args.questionId);

    return {
      ok: true,
      content: j.content,
      sourceIds: sources.map((s) => s.id),
    };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error' };
  }
}