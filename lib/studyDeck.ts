import { supabase } from './supabase';

/** شكل موحّد للسؤال (بيشتغل مع جدول questions و undergraduate_questions) */
export type DeckQ = {
  id: number;
  cat: string;
  q: string;
  opts: { letter: string; text: string }[];
  correct: string;
  explanation: string;
};

const isUG = (panel: string) => panel === 'undergraduate';
const tableOf = (panel: string) => (isUG(panel) ? 'undergraduate_questions' : 'questions');
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

function normalize(panel: string, r: any): DeckQ {
  const ug = isUG(panel);
  return {
    id: Number(r.id),
    cat: (ug ? r.theme_category || r.subject : r.Theme_Category) || 'General',
    q: (ug ? r.question_text : r.Question_Text) || '',
    opts: LETTERS
      .map((L) => ({ letter: L, text: ug ? r[`option_${L.toLowerCase()}`] : r[`Option_${L}`] }))
      .filter((o) => !!o.text),
    correct: String((ug ? r.correct_answer : r.Correct_Answer) || 'A').trim().toUpperCase().charAt(0),
    explanation: (ug ? r.explanation : r.Explanation) || '',
  };
}

const shuffle = <T,>(a: T[]) => {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
};

// ───────── كاش في الذاكرة عشان مانطلبش نفس السؤال مرتين ─────────
const qCache = new Map<string, DeckQ>();

export async function fetchQuestionsByIds(panel: string, ids: number[]): Promise<DeckQ[]> {
  const missing = ids.filter((id) => !qCache.has(`${panel}:${id}`));
  for (let i = 0; i < missing.length; i += 150) {
    const chunk = missing.slice(i, i + 150);
    const { data } = await supabase.from(tableOf(panel)).select('*').in('id', chunk).eq('panel_id', panel);
    (data || []).forEach((r: any) => qCache.set(`${panel}:${r.id}`, normalize(panel, r)));
  }
  return ids.map((id) => qCache.get(`${panel}:${id}`)).filter(Boolean) as DeckQ[];
}

// ───────── فهرس البنك (id + التصنيف بس) بدل تحميل الأسئلة كلها ─────────
type IndexRow = { id: number; cat: string };
const indexCache = new Map<string, Promise<IndexRow[]>>();

export function fetchBankIndex(panel: string): Promise<IndexRow[]> {
  let p = indexCache.get(panel);
  if (!p) {
    p = (async () => {
      const ug = isUG(panel);
      const cols = ug ? 'id, theme_category, subject' : 'id, Theme_Category';
      const out: IndexRow[] = [];
      for (let from = 0; ; from += 1000) {            // Supabase بيرجّع 1000 صف كحد أقصى في الطلب
        const { data, error } = await supabase
          .from(tableOf(panel)).select(cols).eq('panel_id', panel).order('id').range(from, from + 999);
        if (error || !data) break;
        data.forEach((r: any) =>
          out.push({ id: Number(r.id), cat: (ug ? r.theme_category || r.subject : r.Theme_Category) || 'General' }));
        if (data.length < 1000) break;
      }
      if (!out.length) indexCache.delete(panel);       // لو فشل ماتحفظش النتيجة الفاضية
      return out;
    })();
    indexCache.set(panel, p);
  }
  return p;
}

/** كويز من تصنيف واحد: الأسئلة اللي غلطت فيها الأول، وبعدها أسئلة جديدة من نفس التصنيف */
export async function buildTopicQuiz(panel: string, category: string, incorrect: number[], n = 10): Promise<DeckQ[]> {
  const bad = new Set(incorrect.map(Number));
  const inCat = (await fetchBankIndex(panel)).filter((r) => r.cat === category).map((r) => r.id);
  const ids = [...shuffle(inCat.filter((id) => bad.has(id))), ...shuffle(inCat.filter((id) => !bad.has(id)))].slice(0, n);
  return shuffle(await fetchQuestionsByIds(panel, ids));
}
