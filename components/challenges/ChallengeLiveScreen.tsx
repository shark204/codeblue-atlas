'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, CheckCircle2, XCircle, ChevronRight, AlertTriangle, User } from 'lucide-react';
import { getCorrectLetter, type Question } from '../../lib/helpers';
import { submitChallengeAnswer, finalizeChallenge } from '../../lib/challenges/api';
import type { RoomChallenge } from '../../lib/challenges/types';

type Props = {
  isDark: boolean;
  challenge: RoomChallenge;
  questions: Question[];
  currentUserId: string;
  onFinished: (result: any) => void;
  opponentName: string;
};

export default function ChallengeLiveScreen({
  isDark, challenge, questions, currentUserId, onFinished, opponentName,
}: Props) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(challenge.rules?.timePerQ || 0);
  const [answered, setAnswered] = useState(false);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const qStartRef = useRef<number>(Date.now());
  const [submitting, setSubmitting] = useState(false);

  const q = questions[idx];
  const isLast = idx === questions.length - 1;
  const isChallenger = currentUserId === challenge.challenger_id;
  const myAnswersCount = Object.keys(answers).length;
  const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

  // Reset timer on question change
  useEffect(() => {
    qStartRef.current = Date.now();
    setAnswered(!!answers[q?.id]);
    if (challenge.rules?.timePerQ) setTimeLeft(challenge.rules.timePerQ);
  }, [idx, q?.id, challenge.rules?.timePerQ]);

  // Timer tick
  useEffect(() => {
    if (!challenge.rules?.timePerQ || answered) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { handleSelect(null as any); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [challenge.rules?.timePerQ, answered, idx]);

  // Elapsed clock
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const handleSelect = async (letter: string | null) => {
    if (answered) return;
    const timeMs = Date.now() - qStartRef.current;
    if (letter) {
      setAnswers((prev) => ({ ...prev, [q.id]: letter }));
      setAnswered(true);
      await submitChallengeAnswer({ challengeId: challenge.id, questionId: q.id, choice: letter, timeMs });
    } else {
      // timeout → count as wrong
      setAnswers((prev) => ({ ...prev, [q.id]: '__timeout__' }));
      setAnswered(true);
    }
  };

  const next = async () => {
    if (!isLast) { setIdx((i) => i + 1); return; }
    // Finished — submit final
    setSubmitting(true);
    const r = await finalizeChallenge(challenge.id);
    setSubmitting(false);
    if (r.ok) onFinished(r);
  };

  const progressPct = ((idx + (answered ? 1 : 0)) / questions.length) * 100;

  if (!q) return null;

  const options = [
    { letter: 'A', text: q.Option_A },
    { letter: 'B', text: q.Option_B },
    { letter: 'C', text: q.Option_C },
    { letter: 'D', text: q.Option_D },
    { letter: 'E', text: q.Option_E },
  ].filter((o) => o.text);

  const card = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const title = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';
  const selectedLetter = answers[q.id];

  return (
    <div className="fixed inset-0 z-[230] overflow-y-auto bg-slate-950">
      {/* ═══ TOP BAR ═══ */}
      <div className="sticky top-0 z-10 backdrop-blur-xl border-b border-slate-800 bg-slate-950/95">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3">
          {/* Score row */}
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
                <User size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase text-sky-400">أنت</p>
                <p className="text-xs font-black text-white">{myAnswersCount}/{questions.length}</p>
              </div>
            </div>

            <div className="flex flex-col items-center shrink-0">
              <div className="flex items-center gap-1 text-amber-400">
                <Clock size={14} />
                <span className="text-sm font-black tabular-nums">
                  {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}
                </span>
              </div>
              {challenge.rules?.timePerQ > 0 && !answered && (
                <p className="text-[10px] font-black text-rose-400 tabular-nums mt-0.5">
                  ⏱ {timeLeft}s
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <div className="text-end min-w-0">
                <p className="text-[10px] font-black uppercase text-rose-400 truncate">{opponentName}</p>
                <p className="text-xs font-black text-white">{opponentProgress}/{questions.length}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                <User size={14} />
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden bg-slate-800">
            <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* ═══ QUESTION ═══ */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6">
        <div className={`rounded-3xl border-2 p-5 sm:p-8 ${card}`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30">
              {q.Theme_Category || 'General'}
            </span>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
              {idx + 1} / {questions.length}
            </span>
            {challenge.rules?.timePerQ > 0 && !answered && (
              <span className={`ms-auto text-[11px] font-black tabular-nums ${timeLeft <= 10 ? 'text-rose-400' : 'text-amber-400'}`}>
                ⏱ {timeLeft}s
              </span>
            )}
          </div>

          <p className={`text-base sm:text-lg font-bold mb-6 leading-relaxed ${title}`}>
            {q.Question_Text}
          </p>

          <div className="space-y-3">
            {options.map((opt) => {
              const isSel = selectedLetter === opt.letter;
              const correctLetter = getCorrectLetter(q.Correct_Answer);
              const showResult = answered;
              const isCorrect = opt.letter === correctLetter;

              let cls = isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-800 hover:bg-blue-50/50 hover:border-blue-300';

              if (showResult) {
                if (isCorrect) cls = isDark
                  ? 'bg-emerald-900 border-emerald-500 text-emerald-100 font-bold'
                  : 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold';
                else if (isSel) cls = isDark
                  ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                  : 'bg-rose-100 border-rose-500 text-rose-900 font-bold';
                else cls = isDark
                  ? 'bg-slate-800/30 border-slate-800 text-slate-500 opacity-40'
                  : 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-40';
              }

              return (
                <button
                  key={opt.letter}
                  onClick={() => handleSelect(opt.letter)}
                  disabled={answered}
                  className={`w-full text-start p-4 rounded-2xl border transition-all text-sm font-semibold flex items-center gap-3 ${cls}`}
                >
                  <span className="w-7 h-7 rounded-lg border border-current flex items-center justify-center text-xs font-bold shrink-0">
                    {opt.letter}
                  </span>
                  <span className="flex-1">{opt.text}</span>
                  {showResult && isCorrect && <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />}
                  {showResult && isSel && !isCorrect && <XCircle size={18} className="text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation (only after answered) */}
          {answered && q.Explanation && (
            <div className={`mt-6 p-4 rounded-2xl border-s-4 ${isDark ? 'bg-sky-950/30 border-sky-500' : 'bg-blue-50 border-blue-400'}`}>
              <p className={`text-[11px] font-black uppercase mb-1 ${isDark ? 'text-sky-400' : 'text-blue-700'}`}>
                الشرح
              </p>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {q.Explanation}
              </p>
            </div>
          )}

          {/* Next button */}
          {answered && (
            <button
              onClick={next}
              disabled={submitting}
              className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 disabled:opacity-60 text-white font-black text-base shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
            >
              {submitting ? 'جاري...' : isLast ? '🏁 إنهاء التحدي' : 'السؤال التالي'}
              <ChevronRight size={18} />
            </button>
          )}

          {/* Timeout indicator */}
          {selectedLetter === '__timeout__' && (
            <div className={`mt-3 flex items-center gap-2 p-3 rounded-xl ${isDark ? 'bg-amber-950/30 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
              <AlertTriangle size={14} />
              <span className="text-xs font-black">انتهى الوقت — السؤال اتسجل خطأ</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}