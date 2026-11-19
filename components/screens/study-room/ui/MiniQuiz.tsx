'use client';
import { useState } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import type { DeckQ } from '@/lib/studyDeck';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  title: string;
  questions: DeckQ[];
  onAnswer: (q: DeckQ, correct: boolean) => void;
  onExit: () => void;
};

export default function MiniQuiz({ title, questions, onAnswer, onExit }: Props) {
    const t = useTranslations('components_screens_study_room_ui_MiniQuiz');
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const q = questions[i];
  const finished = i >= questions.length;

  const pick = (letter: string) => {
    if (picked || !q) return;
    const ok = letter === q.correct;
    setPicked(letter);
    if (ok) setScore((s) => s + 1);
    onAnswer(q, ok);
  };

  if (!questions.length) {
    return (
      <div className="sr-quiz">
        <button className="sr-back" onClick={onExit}><ArrowLeft size={14} /> {t('back')}</button>
        <p className="sr-history-empty">{t('no_questions_found_for_this')}</p>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="sr-quiz">
        <div className="sr-card sr-quiz-done">
          <div className={`sr-ring-mini ${pct >= 70 ? 'full' : ''}`} style={{ ['--p' as any]: pct }}><b>{pct}%</b></div>
          <h3>{score} of {questions.length} correct</h3>
          <p className="sr-sub">
            {pct >= 70 ? t('solid_the_mistakes_you_fixed') : t('worth_another_round_questions_you')}
          </p>
          <button className="sr-apply" onClick={onExit}>{t('back_to_topics')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="sr-quiz">
      <div className="sr-quiz-top">
        <button className="sr-back" onClick={onExit} aria-label={t('leave_quiz')}><ArrowLeft size={14} /> {title}</button>
        <span>{i + 1}/{questions.length}</span>
      </div>
      <div className="sr-bar" style={{ marginTop: 0 }}><i style={{ width: `${(i / questions.length) * 100}%` }} /></div>

      <p className="sr-q">{q.q}</p>

      <div className="sr-quiz-opts">
        {q.opts.map((o) => {
          const state = !picked ? '' : o.letter === q.correct ? 'ok' : o.letter === picked ? 'bad' : 'dim';
          return (
            <button key={o.letter} className={`sr-quiz-opt ${state}`} onClick={() => pick(o.letter)} disabled={!!picked}>
              <span className="L">{o.letter}</span>
              <span className="T">{o.text}</span>
              {state === 'ok' && <Check size={16} />}
              {state === 'bad' && <X size={16} />}
            </button>
          );
        })}
      </div>

      {picked && (
        <>
          {q.explanation && <div className="sr-expl-box">{q.explanation}</div>}
          <button className="sr-apply" onClick={() => { setPicked(null); setI((x) => x + 1); }}>
            {i + 1 === questions.length ? t('see_result') : t('next_question')}
          </button>
        </>
      )}
    </div>
  );
}