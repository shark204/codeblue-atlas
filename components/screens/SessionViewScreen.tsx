'use client';
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Target, RotateCcw } from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';
import { useProgressStore } from '../../stores/progressStore';
import { useUIStore, type PanelId } from '../../stores/uiStore';
import QuestionCard from './QuestionCard';
import { useAdaptiveSession } from '../../lib/qbank/useAdaptiveSession';
import { useMistakeQueue } from '../../lib/qbank/useMistakeQueue';
import { getCorrectLetter, type Question } from '../../lib/helpers';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  displayMode: 'horizontal' | 'vertical';
  spectateMode: boolean;
  currentNoteInput: { [key: number]: string };
  setCurrentNoteInput: (fn: (p: { [key: number]: string }) => { [key: number]: string }) => void;
  onOptionClick: (q: Question, letter: string) => void;
  onToggleFlag: (id: number) => void;
  onSaveNote: (qId: number, text: string) => void;
  onExit: (source: string) => void;
  userId?: string;
  adaptiveMode?: 'adaptive' | 'shuffle' | 'default';
};

export default function SessionViewScreen({
  isDark, displayMode, spectateMode, currentNoteInput, setCurrentNoteInput,
  onOptionClick, onToggleFlag, onSaveNote, onExit,
  userId,
  adaptiveMode = 'adaptive',
}: Props) {
    const t = useTranslations('components_screens_SessionViewScreen');
  const currentPanel = useUIStore(s => s.currentPanel) as PanelId;

  const sessionQuestionsRaw = useSessionStore(currentPanel, s => s.sessionQuestions);
  const sessionAnswers = useSessionStore(currentPanel, s => s.sessionAnswers);
  const currentIndex = useSessionStore(currentPanel, s => s.currentIndex);
  const sessionSource = useSessionStore(currentPanel, s => s.sessionSource);
  const repeatIncorrect = useSessionStore(currentPanel, s => s.repeatIncorrect);
  const setCurrentIndex = useSessionStore(currentPanel, s => s.setCurrentIndex);
  const score = useProgressStore(currentPanel, s => s.score);

  const cleaned = useMemo(
    () =>
      Array.isArray(sessionQuestionsRaw)
        ? sessionQuestionsRaw.filter(
            (q: any) => q && typeof q === 'object' && q.id !== undefined && q.id !== null,
          )
        : [],
    [sessionQuestionsRaw],
  );

  // ✅ Adaptive reordering
  const { ordered: sessionQuestions } = useAdaptiveSession({
    questions: cleaned,
    userId,
    mode: adaptiveMode,
    seed: `${currentPanel}:${sessionSource}:${cleaned.length}`,
    enabled: !spectateMode && cleaned.length > 1,
  });

  // 🎯 Mistake Queue — يشتغل فقط لو repeatIncorrect مفعّل ومش في spectate
  const mistakesEnabled = repeatIncorrect && !spectateMode && displayMode === 'horizontal';
  const mistakes = useMistakeQueue(mistakesEnabled);

  const safeIndex = Math.max(0, Math.min(currentIndex, sessionQuestions.length - 1));
  const originalQuestion = sessionQuestions[safeIndex];

  // 🎯 هل فيه خطأ "حان وقته"؟
  const [overrideQuestion, setOverrideQuestion] = useState<Question | null>(null);
  const [overrideIsRepeat, setOverrideIsRepeat] = useState(false);

  useEffect(() => {
    if (!mistakesEnabled) {
      if (overrideQuestion) { setOverrideQuestion(null); setOverrideIsRepeat(false); }
      return;
    }

    const due = mistakes.getDue(safeIndex);
    if (!due) {
      if (overrideQuestion) { setOverrideQuestion(null); setOverrideIsRepeat(false); }
      return;
    }

    const q = sessionQuestions.find((x) => x.id === due.baseQuestionId);
    // ✅ اعرضها فقط لو لسه مش اتجاوبت في الجلسة
    if (q && !sessionAnswers[q.id]) {
      setOverrideQuestion(q);
      setOverrideIsRepeat(true);
    } else {
      if (overrideQuestion) { setOverrideQuestion(null); setOverrideIsRepeat(false); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeIndex, mistakes.size, mistakesEnabled, sessionQuestions, sessionAnswers]);

  // ✅ إعادة تعيين الـ override لما يتجاوب
  useEffect(() => {
    if (overrideQuestion && sessionAnswers[overrideQuestion.id]) {
      setOverrideQuestion(null);
      setOverrideIsRepeat(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionAnswers]);

  // السؤال المعروض حالياً (إما الأصلي أو خطأ رجع تاني)
  const displayedQuestion = overrideQuestion ?? originalQuestion;
  const displayedIndex = overrideIsRepeat ? safeIndex : safeIndex;

  if (sessionQuestions.length === 0 || !displayedQuestion) return null;

  // 🎯 Wrapper للإجابة — يتتبع الأخطاء
  const handleAnswer = (q: Question, letter: string) => {
    if (mistakesEnabled) {
      const correctLetter = getCorrectLetter(q.Correct_Answer);
      const isCorrect = letter === correctLetter;

      if (correctLetter) {
        if (isCorrect && mistakes.has(q.id)) {
          // ✅ صح على إعادة → شيلها من الطابور
          mistakes.markCorrect(q.id);
        } else if (!isCorrect) {
          // ❌ غلط → أضفها للطابور (أو أعد جدولتها)
          mistakes.add(q.id, safeIndex);
        }
        // لو صح على سؤال عادي → مفيش حاجة
      }
    }

    onOptionClick(q, letter);
  };

  return (
    <div className="animate-fade-in w-full max-w-4xl mx-auto">
      {/* ═══ Header ═══ */}
      <div className="flex justify-between items-center mb-4 lg:mb-6">
        <button
          onClick={() => onExit(sessionSource)}
          className={`flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-bold shadow-sm transition-colors ${
            isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
          }`}
        >
          {sessionSource === 'review_gallery' ? (
            <><ChevronLeft size={14} className="inline me-1" />{t('back_to_gallery')}</>
          ) : (
            <><ChevronLeft size={14} className="inline me-1" />{t('save_exit')}</>
          )}
        </button>

        <div className="flex items-center gap-2">
          {/* 🎯 مؤشر الأخطاء المعلقة */}
          {mistakesEnabled && mistakes.size > 0 && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] lg:text-xs font-bold border ${
              isDark ? 'bg-amber-950/40 border-amber-800/60 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <RotateCcw size={12} />
              <span className="tabular-nums">{mistakes.size}</span>
              <span className="hidden sm:inline">للمراجعة</span>
            </div>
          )}

          <div className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-[10px] lg:text-xs font-bold border shadow-sm ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
          }`}>
            {t('accuracy')} <span className="text-emerald-500">{score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%</span>
          </div>
        </div>
      </div>

      {/* ═══ Progress ═══ */}
      <div className="mb-6 lg:mb-8">
        <div className="flex justify-between text-[10px] lg:text-xs font-bold mb-1.5 lg:mb-2 text-slate-500">
          <span>
            {t('session_progress')}{' '}
            <span className="text-sky-500 dark:text-sky-400">
              {Object.keys(sessionAnswers).length}
            </span>{' '}
            {t('answered')}
                                </span>
          <span>{sessionQuestions.length} Total</span>
        </div>
        <div className={`w-full h-1.5 lg:h-2 rounded-full overflow-hidden shadow-inner ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
          <div
            className="h-full bg-sky-500 transition-all duration-700 ease-out"
            style={{ width: `${(Object.keys(sessionAnswers).length / sessionQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ═══ Repeat Banner ═══ */}
      {overrideIsRepeat && displayedQuestion && (
        <div className={`mb-4 rounded-xl border-2 border-dashed px-4 py-2.5 flex items-center gap-2 ${
          isDark ? 'border-amber-700/50 bg-amber-950/20 text-amber-300' : 'border-amber-300 bg-amber-50 text-amber-800'
        }`}>
          <RotateCcw size={14} className="shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-wider">
            سؤال للمراجعة — حاول تاني
          </span>
          <span className={`ms-auto text-[10px] font-bold opacity-70`}>
            {mistakesEnabled ? mistakes.size : 0} في الطابور
          </span>
        </div>
      )}

      {/* ═══ Question Display ═══ */}
      {displayMode === 'horizontal' ? (
        <QuestionCard
          key={`${displayedQuestion.id}-${overrideIsRepeat ? 'r' : 'o'}-${safeIndex}`}
          q={displayedQuestion}
          index={overrideIsRepeat ? -1 : safeIndex}   // index = -1 لإعادة الأسئلة
          isStandalone={true}
          isDark={isDark}
          spectateMode={spectateMode}
          displayMode={displayMode}
          currentNoteInput={currentNoteInput}
          setCurrentNoteInput={setCurrentNoteInput}
          onOptionClick={handleAnswer}
          onToggleFlag={onToggleFlag}
          onSaveNote={onSaveNote}
          hideSource={true}
          userId={userId}
        />
      ) : (
        <div className="space-y-6 lg:space-y-10">
          {sessionQuestions.map((q, idx) => (
            <QuestionCard
              key={`${q.id}-${idx}`}
              q={q}
              index={idx}
              isStandalone={false}
              isDark={isDark}
              spectateMode={spectateMode}
              displayMode={displayMode}
              currentNoteInput={currentNoteInput}
              setCurrentNoteInput={setCurrentNoteInput}
              onOptionClick={handleAnswer}
              onToggleFlag={onToggleFlag}
              onSaveNote={onSaveNote}
              hideSource={true}
              userId={userId}
            />
          ))}
          <div className="text-center pt-8 pb-10">
            <button
              onClick={() => onExit(sessionSource)}
              className="px-6 py-3 lg:px-8 lg:py-4 bg-sky-600 text-white font-bold rounded-xl lg:rounded-2xl shadow-lg hover:bg-sky-700 transition-transform active:scale-95 text-sm lg:text-base"
            >
              {t('finish_session')} <Target size={14} className="inline ms-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}