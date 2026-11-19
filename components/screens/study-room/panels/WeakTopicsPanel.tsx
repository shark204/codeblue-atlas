'use client';
import { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import { buildTopicQuiz, fetchBankIndex, fetchQuestionsByIds, type DeckQ } from '@/lib/studyDeck';
import MiniQuiz from '../ui/MiniQuiz';
import Tip from '../ui/Tip';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  panelId: string;
  incorrectIds: number[];
  onResolve: (id: number, correct: boolean) => void;   // بيحدّث قايمة الأخطاء في الداتا الأساسية
};
type Row = { cat: string; open: number; total: number };

export default function WeakTopicsPanel({ panelId, incorrectIds, onResolve }: Props) {
    const t = useTranslations('components_screens_study_room_panels_WeakTopicsPanel');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<{ title: string; questions: DeckQ[] } | null>(null);

  const ids = incorrectIds.map(Number).filter((n) => n > 0);
  const idsKey = ids.join(',');

  useEffect(() => {
    let alive = true;
    (async () => {
      const [qs, index] = await Promise.all([fetchQuestionsByIds(panelId, ids), fetchBankIndex(panelId)]);
      if (!alive) return;
      const totals: Record<string, number> = {};
      index.forEach((r) => { totals[r.cat] = (totals[r.cat] || 0) + 1; });
      const open: Record<string, number> = {};
      qs.forEach((q) => { open[q.cat] = (open[q.cat] || 0) + 1; });
      setRows(
        Object.keys(open)
          .map((cat) => ({ cat, open: open[cat], total: Math.max(totals[cat] || 0, open[cat]) }))
          .sort((a, b) => b.open - a.open || b.open / b.total - a.open / a.total),
      );
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [idsKey, panelId]); // eslint-disable-line

  const practice = async (cat: string) => {
    setStarting(cat);
    const questions = await buildTopicQuiz(panelId, cat, ids, 10);
    setStarting(null);
    setQuiz({ title: cat, questions });
  };

  if (quiz) {
    return <MiniQuiz title={quiz.title} questions={quiz.questions} onAnswer={(q, ok) => onResolve(q.id, ok)} onExit={() => setQuiz(null)} />;
  }

  if (loading) return <div className="sr-skel tall" />;

  if (!rows.length) {
    return (
      <p className="sr-history-empty">
        {t('no_open_mistakes_when_you')}
                  </p>
    );
  }

  const worst = rows[0];
  const worstPct = Math.round((worst.open / worst.total) * 100);

  return (
    <div className="sr-weak">
      <section className="sr-weak-hero">
        <div className="sr-row-between">
          <Tip text="The topic with the biggest share of unresolved mistakes, compared with how many questions it has." side="bottom"><h3>{t('weakest_topic')}</h3></Tip>
          <Target size={16} />
        </div>
        <p className="sr-weak-name">{worst.cat}</p>
        <p className="sr-sub" style={{ marginTop: 0 }}>
          {worst.open} open mistake{worst.open === 1 ? '' : 's'} · {worstPct}% of this topic's {worst.total} questions
        </p>
        <Tip text="10 questions: your open mistakes first, then new ones from the same topic. Answering correctly clears the mistake from your list." side="top"><button className="sr-cta" disabled={!!starting} onClick={() => practice(worst.cat)}>
          {starting === worst.cat ? t('preparing') : t('practice_10_questions')}
        </button></Tip>
      </section>

      <div>
        <h3 className="sr-h3" style={{ marginBottom: 8 }}>{t('all_topics_with_open_mistakes')}</h3>
        <ul className="sr-topics">
          {rows.map((r) => {
            const pct = Math.round((r.open / r.total) * 100);
            const level = pct >= 25 ? 'high' : pct >= 10 ? 'mid' : 'low';
            return (
              <li key={r.cat}>
                <div className="sr-topic-head">
                  <b>{r.cat}</b>
                  <Tip text="10 questions: your open mistakes first, then new ones from the same topic. Answering correctly clears the mistake from your list." side="top"><button disabled={!!starting} onClick={() => practice(r.cat)}>{starting === r.cat ? '…' : t('practice')}</button></Tip>
                </div>
                <Tip text="Open mistakes as a share of all questions in this topic. Red is 25% or more, amber is 10% or more." side="top"><div className={`sr-topic-bar ${level}`}><i style={{ width: `${Math.max(4, pct)}%` }} /></div></Tip>
                <small>{r.open} open of {r.total} · {pct}%</small>
              </li>
            );
          })}
        </ul>
        <p className="sr-sub">{t('a_mistake_leaves_this_list')}</p>
      </div>
    </div>
  );
}
