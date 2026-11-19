'use client';
import { RefreshCw, Paperclip } from 'lucide-react';
import { useExamStore } from '../../../stores/examStore';
import { useUIStore } from '../../../stores/uiStore';
import { getCorrectLetter } from '../../../lib/helpers';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  onRetake: () => void;
};

// 💪 5 رسائل تشجيع لتحت 70%
const LOW_SCORE_MESSAGES = [
  "Every mistake is a lesson, Doctor. Review and rise stronger. 📚",
  "The best surgeons failed many times before they succeeded. Keep going! 🩺",
  "Your effort isn't wasted — every question sharpens your mind. 💡",
  "Champions are made in the moments they choose not to give up. 🔥",
  "This is just a checkpoint, not the finish line. Next round, you'll crush it! 💪",
];

// ✅ 5 رسائل لـ 70% - 89%
const MID_SCORE_MESSAGES = [
  "Solid work, Doctor! You're on the right track — polish the details and you'll hit 90%. 🎯",
  "Great progress! Your foundation is strong, now sharpen your weak spots. 🩺",
  "You're nearly there, Doctor. Consistency at this level guarantees success. 🔥",
  "Well done! Every practice like this brings you closer to mastery. 📈",
  "Strong performance! Trust the process — you're building real clinical instincts. 💡",
];

// 🏆 رسالة قوية لفوق 90%
const HIGH_SCORE_MESSAGE = "Exceptional, Doctor! You didn't just pass — you dominated. The real exam should be afraid of you. 👑🩺";

export default function ExamResultScreen({ isDark, onRetake }: Props) {
    const t = useTranslations('components_screens_exam_ExamResultScreen');
  const currentPanel = useUIStore(s => s.currentPanel);

  const examQuestions = useExamStore(currentPanel, s => s.examQuestions);
  const examAnswers = useExamStore(currentPanel, s => s.examAnswers);

  // ✅ حمايات
  const safeQuestions = Array.isArray(examQuestions) ? examQuestions : [];
  const safeAnswers = (examAnswers && typeof examAnswers === 'object') ? examAnswers : {};

  const score = safeQuestions.filter(q =>
    q?.id !== undefined && safeAnswers[q.id] === getCorrectLetter(q.Correct_Answer)
  ).length;

  // ✅ احسب النسبة
  const scorePercentage = safeQuestions.length > 0
    ? Math.round((score / safeQuestions.length) * 100)
    : 0;

  // ✅ اختيار الرسالة بناءً على النسبة
  let message = '';
  let messageColorClasses = '';

  if (scorePercentage >= 90) {
    message = HIGH_SCORE_MESSAGE;
    messageColorClasses = isDark
      ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
      : 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-[0_0_25px_rgba(16,185,129,0.2)]';
  } else if (scorePercentage >= 70) {
    const idx = score % MID_SCORE_MESSAGES.length;
    message = MID_SCORE_MESSAGES[idx];
    messageColorClasses = isDark
      ? 'bg-slate-900 border-purple-800 text-purple-300'
      : 'bg-white border-purple-200 text-purple-900';
  } else {
    const idx = score % LOW_SCORE_MESSAGES.length;
    message = LOW_SCORE_MESSAGES[idx];
    messageColorClasses = isDark
      ? 'bg-amber-950/40 border-amber-700 text-amber-300'
      : 'bg-amber-50 border-amber-300 text-amber-800';
  }

  return (
    <div className="w-full animate-fade-in max-w-4xl mx-auto space-y-8">
      <div className={`p-8 rounded-3xl border text-center shadow-xs space-y-4 ${isDark ? 'bg-purple-950/30 border-purple-900/50 text-purple-200' : 'bg-purple-50/60 border-purple-200 text-slate-800'}`}>
        <h2 className={`text-2xl lg:text-3xl font-black ${isDark ? 'text-purple-300' : 'text-purple-900'}`}>{t('exam_summary')}</h2>

        <p className="text-xl font-bold">
          Score: <span className="text-purple-600 dark:text-purple-400">{score}</span> / {safeQuestions.length}
          <span className={`ms-2 text-base ${scorePercentage >= 70 ? 'text-emerald-500' : 'text-rose-500'}`}>
            ({scorePercentage}%)
          </span>
        </p>

        {/* ✅ الرسالة — بتظهر دايماً، بس بلون ومحتوى مختلف حسب النسبة */}
        <div className={`p-4 rounded-2xl border text-sm font-semibold italic ${messageColorClasses}`}>
          "{message}"
        </div>

        <button onClick={onRetake} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-md transition-all">
          {t('retake_exam')} <RefreshCw size={14} className="inline ms-1" />
        </button>
      </div>

      <div className="space-y-6 mt-8">
        <h3 className={`text-2xl font-black mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t('exam_review')}</h3>
        {safeQuestions.map((q, idx) => {
          const userAns = safeAnswers[q.id];
          const correctAns = getCorrectLetter(q.Correct_Answer);
          const isCorrect = userAns === correctAns;
          const options = [
            { letter: 'A', text: q.Option_A },
            { letter: 'B', text: q.Option_B },
            { letter: 'C', text: q.Option_C },
            { letter: 'D', text: q.Option_D },
            { letter: 'E', text: q.Option_E },
          ].filter(o => Boolean(o.text));

          return (
            <div key={q.id} className={`p-6 lg:p-8 rounded-3xl shadow-sm border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              {q.source_file && (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold mb-3 ${
                  isDark ? 'bg-slate-800/80 text-slate-400 border border-slate-700' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  <Paperclip size={10} />
                  <span className="truncate max-w-[200px]">Source: {q.source_file}</span>
                </div>
              )}
              <p className={`font-bold mb-6 text-lg ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                <span className="text-purple-500 me-2">{idx + 1}.</span>{q.Question_Text}
              </p>

              <div className="space-y-3">
                {options.map(opt => {
                  let btnStyle = isDark ? 'bg-slate-800/80 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500';
                  if (opt.letter === correctAns) {
                    btnStyle = isDark ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-black shadow-[0_0_15px_rgba(16,185,129,0.3)] z-10 scale-[1.02]' : 'bg-emerald-500 border-emerald-600 text-white font-black shadow-[0_0_15px_rgba(16,185,129,0.4)] z-10 scale-[1.02]';
                  } else if (opt.letter === userAns && !isCorrect) {
                    btnStyle = isDark ? 'bg-rose-950/80 border-rose-600 text-rose-300 font-bold' : 'bg-rose-500 border-rose-600 text-white font-bold';
                  } else {
                    btnStyle += ' opacity-40';
                  }
                  return (
                    <div key={opt.letter} className={`w-full text-start p-3 sm:p-4 rounded-xl border flex items-center gap-3 transition-all ${btnStyle}`}>
                      <span className="w-6 h-6 rounded-lg border border-inherit flex items-center justify-center text-xs font-bold shrink-0">{opt.letter}</span>
                      <span>{opt.text}</span>
                    </div>
                  );
                })}
              </div>

              <div className={`mt-6 p-5 rounded-2xl text-sm border ${isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-blue-50/60 border-blue-200 text-slate-800'}`}>
                <span className="font-bold block mb-2 text-sky-400">{t('explanation')}</span>
                {q.Explanation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}