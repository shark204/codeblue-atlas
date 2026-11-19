'use client';
import { useEffect, useRef, useState } from 'react';
import { Flag, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { StarIcon } from '../ui/Icons';
import { useSessionStore } from '../../stores/sessionStore';
import { useProgressStore } from '../../stores/progressStore';
import { useUIStore, type PanelId } from '../../stores/uiStore';
import { getCorrectLetter, type Question } from '../../lib/helpers';
import { useQuestionTimer } from '../../lib/qbank/useQuestionTimer';
import { recordAnswerAttempt } from '../../lib/qbank/metrics';
import { supabase } from '../../lib/supabase';
import AIExplanationCard from '../ai/AIExplanationCard';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  q: Question;
  index: number;
  isStandalone: boolean;
  isDark: boolean;
  spectateMode: boolean;
  displayMode: 'horizontal' | 'vertical';
  currentNoteInput: { [key: number]: string };
  setCurrentNoteInput: (fn: (p: { [key: number]: string }) => { [key: number]: string }) => void;
  onOptionClick: (q: Question, letter: string) => void;
  onToggleFlag: (id: number) => void;
  onSaveNote: (qId: number, text: string) => void;
  hideSource?: boolean;
  userId?: string;
};

const REPORT_REASONS = [
  'إجابة صحيحة غير دقيقة',
  'خطأ في صياغة السؤال أو الاختيارات',
  'الشرح ناقص أو غير واضح',
  'سؤال مكرر',
];

export default function QuestionCard({
  q, index, isStandalone, isDark, spectateMode, displayMode,
  currentNoteInput, setCurrentNoteInput, onOptionClick, onToggleFlag, onSaveNote,
  hideSource = false,
  userId,
}: Props) {
    const t = useTranslations('components_screens_QuestionCard');
  const currentPanel = useUIStore(s => s.currentPanel) as PanelId;
  const showToast = useUIStore(s => s.showToast);

  const sessionAnswers = useSessionStore(currentPanel, s => s.sessionAnswers);
  const currentIndex = useSessionStore(currentPanel, s => s.currentIndex);
  const setCurrentIndex = useSessionStore(currentPanel, s => s.setCurrentIndex);
  const sessionQuestions = useSessionStore(currentPanel, s => s.sessionQuestions);
  const flaggedIds = useProgressStore(currentPanel, s => s.flaggedIds);
  const userNotes = useProgressStore(currentPanel, s => s.userNotes);

  // ⏱️ Timer — فقط للسؤال المعروض أو الفعّال
  const shouldTime = isStandalone && !spectateMode;
  const { activeMs, finish } = useQuestionTimer(shouldTime ? q?.id : null);

  // 🎯 تتبع تغييرات الإجابة قبل التسليم
  const [answerChanges, setAnswerChanges] = useState(0);
  const lastChoiceRef = useRef<string | null>(null);

  // 🚩 حالة نافذة البلاغ عن السؤال
  const [showReportBox, setShowReportBox] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    setAnswerChanges(0);
    lastChoiceRef.current = null;
    setShowReportBox(false);
    setCustomReason('');
  }, [q?.id]);

  if (!q || typeof q !== 'object') return null;

  const questionKey = q.id ?? `fallback_${index}_${(q.Question_Text ?? '').slice(0, 20)}`;

  const isAnswered = !!sessionAnswers[questionKey] || spectateMode;
  const correctAns = getCorrectLetter(q.Correct_Answer);
  const selectedOpt = sessionAnswers[questionKey] || (spectateMode ? correctAns : null);
  const showExpl = isAnswered;

  const options = [
    { letter: 'A', text: q.Option_A },
    { letter: 'B', text: q.Option_B },
    { letter: 'C', text: q.Option_C },
    { letter: 'D', text: q.Option_D },
    { letter: 'E', text: q.Option_E },
  ].filter(o => Boolean(o.text));

  const handleOptionClick = (letter: string) => {
    if (isAnswered) return;

    if (lastChoiceRef.current && lastChoiceRef.current !== letter) {
      setAnswerChanges((c) => c + 1);
    }
    lastChoiceRef.current = letter;

    onOptionClick(q, letter);

    if (userId) {
      const totalMs = finish();
      const correct = letter === correctAns;
      const isFirstAttempt = !sessionAnswers[questionKey];
      void recordAnswerAttempt({
        userId,
        questionId: q.id,
        correct,
        isFirstAttempt,
        activeMs: totalMs,
        answerChanges,
        choice: letter,
      });
    }
  };

  const handleSubmitReport = async () => {
    if (!q?.id) return;
    const finalReason = customReason.trim() ? `${reportReason} — ${customReason.trim()}` : reportReason;
    setReporting(true);
    try {
      const { error } = await supabase.from('question_reports').insert({
        question_id: q.id,
        question_text: q.Question_Text || '',
        reason: finalReason,
        status: 'open',
        reported_by: userId || null,
      });
      if (error) throw error;
      showToast('🚩 تم إرسال البلاغ للأدمن للمراجعة، شكراً لك!', 'success');
      setShowReportBox(false);
      setCustomReason('');
    } catch (err: any) {
      showToast(err.message || 'تعذر إرسال البلاغ', 'error');
    }
    setReporting(false);
  };

  return (
    <div
      key={`q-${questionKey}-${index}`}
      className={`p-4 sm:p-6 lg:p-9 rounded-2xl lg:rounded-3xl shadow-xl border transition-colors relative ${isDark ? 'bg-slate-900 border-slate-800 shadow-slate-950/50' : 'bg-white border-slate-200 shadow-slate-200/50'}`}
    >
      {spectateMode && (
        <div className="absolute top-0 end-0 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-es-xl shadow-md z-20">
          {t('spectate_mode')}
                          </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-2 mb-4 sm:mb-5">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] lg:text-xs px-3 py-1.5 rounded-full font-extrabold tracking-wide border ${isDark ? 'bg-sky-950/80 text-sky-300 border-sky-800/60' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
            {q.Theme_Category || 'General'}
          </span>
          <span className={`text-[10px] lg:text-xs px-3 py-1.5 rounded-full font-extrabold border flex items-center gap-1 ${isDark ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-50 border-slate-200 text-amber-500'}`}>
            {Array.from({ length: q.Difficulty || 1 }).map((_, i) => <StarIcon key={i} />)}
          </span>
          {shouldTime && activeMs > 0 && (
            <span className={`text-[10px] font-bold tabular-nums ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              ⏱ {Math.floor(activeMs / 1000)}s
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowReportBox(v => !v)}
            className={`px-3 py-1.5 rounded-xl text-[10px] lg:text-xs font-bold transition-all border ${
              showReportBox
                ? (isDark ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-rose-50 text-rose-700 border-rose-200')
                : (isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border-slate-200')
            }`}
            title="بلّغ عن خطأ في السؤال"
          >
            <AlertTriangle size={12} className="inline me-1" />
            بلّغ
          </button>
          <button
            type="button"
            onClick={() => onToggleFlag(q.id)}
            className={`px-3 py-1.5 rounded-xl text-[10px] lg:text-xs font-bold transition-all ${
              flaggedIds.includes(q.id)
                ? (isDark ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-indigo-50 text-indigo-700 border border-indigo-200')
                : (isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200')
            }`}
          >
            <Flag size={12} className="inline me-1" />
            {flaggedIds.includes(q.id) ? t('flagged') : t('flag')}
          </button>
        </div>
      </div>

      {/* 🚩 صندوق الإبلاغ عن السؤال */}
      {showReportBox && (
        <div dir="rtl" className={`mb-5 p-4 rounded-2xl border space-y-3 animate-fade-in ${isDark ? 'bg-slate-800/70 border-rose-900/60' : 'bg-rose-50/60 border-rose-200'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>🚩 الإبلاغ عن مشكلة في السؤال</span>
            <button type="button" onClick={() => setShowReportBox(false)} className="text-xs font-bold text-slate-400 hover:text-slate-200">إغلاق</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {REPORT_REASONS.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setReportReason(r)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${
                  reportReason === r
                    ? 'bg-rose-600 border-rose-600 text-white'
                    : (isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700')
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customReason}
              onChange={e => setCustomReason(e.target.value)}
              placeholder="تفاصيل إضافية (اختياري)..."
              className={`flex-1 p-2.5 rounded-xl text-xs border focus:outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
            />
            <button
              type="button"
              disabled={reporting}
              onClick={handleSubmitReport}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-black"
            >
              {reporting ? 'جاري الإرسال...' : 'إرسال البلاغ'}
            </button>
          </div>
        </div>
      )}

      {q.source_file && !hideSource && (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold mb-3 ${isDark ? 'bg-slate-800/80 text-slate-400 border border-slate-700' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
          <span className="text-[8px]">📎</span>
          <span className="truncate max-w-[200px]">المصدر: {q.source_file}</span>
        </div>
      )}

      <p className={`text-sm sm:text-base lg:text-xl font-bold mb-6 leading-relaxed ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
        <span className="text-sky-500 me-2 opacity-70">{index + 1}.</span>{q.Question_Text}
      </p>

      <div className="space-y-3">
        {options.map((opt) => {
          let buttonStyle = isDark
            ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            : 'bg-white border-slate-200 text-slate-800 hover:bg-blue-50/50 hover:border-blue-300';

          if (isAnswered) {
            if (opt.letter === correctAns) {
              buttonStyle = isDark
                ? 'bg-emerald-900 border-emerald-500 text-emerald-100 font-bold shadow-lg shadow-emerald-950'
                : 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold shadow-lg shadow-emerald-100';
            } else if (opt.letter === selectedOpt) {
              buttonStyle = isDark
                ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                : 'bg-rose-100 border-rose-500 text-rose-900 font-bold';
            } else {
              buttonStyle = isDark
                ? 'bg-slate-800/30 border-slate-800 text-slate-500 opacity-40'
                : 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-40';
            }
          }

          return (
            <button
              key={opt.letter}
              type="button"
              onClick={() => handleOptionClick(opt.letter)}
              disabled={spectateMode || isAnswered}
              className={`w-full text-start p-3 sm:p-4 rounded-xl lg:rounded-2xl border transition-all text-xs sm:text-sm font-semibold flex items-center gap-3 cursor-pointer ${buttonStyle}`}
            >
              <span className="w-6 h-6 lg:w-7 lg:h-7 rounded-lg border border-current flex items-center justify-center text-xs font-bold shrink-0">
                {opt.letter}
              </span>
              <span className="break-words flex-1">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {showExpl && (
        <div className="mt-7 space-y-5 animate-fade-in">
          {/* الشرح الأصلي */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-sky-950/40 border-sky-900/60 text-sky-200' : 'bg-blue-50/60 border-blue-200 text-slate-800'}`}>
            <h3 className={`text-xs sm:text-sm font-black uppercase tracking-wide mb-2 ${isDark ? 'text-sky-400' : 'text-blue-800'}`}>
              {t('revision_notes_explanation')}
                                      </h3>
            <p className={`text-xs sm:text-sm leading-relaxed mb-5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {q.Explanation}
            </p>

            {/* ملاحظتك الشخصية */}
            <div className={`mt-4 pt-4 border-t ${isDark ? 'border-sky-800/50' : 'border-sky-200'}`}>
              <label className={`block text-xs font-bold mb-2 uppercase tracking-wide ${isDark ? 'text-sky-400' : 'text-blue-700'}`}>
                {t('your_custom_note')}
                                            </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={currentNoteInput[q.id] !== undefined ? currentNoteInput[q.id] : (userNotes[q.id] || '')}
                  onChange={(e) => setCurrentNoteInput(prev => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder={t('type_your_revision_note')}
                  className={`flex-1 p-2.5 rounded-lg text-xs sm:text-sm border focus:outline-none transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-200 focus:border-sky-500' : 'bg-white border-blue-200 text-slate-800 focus:border-blue-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const noteText = currentNoteInput[q.id] !== undefined ? currentNoteInput[q.id] : (userNotes[q.id] || '');
                    onSaveNote(q.id, noteText);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-transform active:scale-95"
                >
                  {t('save')}
                                                  </button>
              </div>
            </div>
          </div>

          {/* ✅ AI Explanation */}
          <AIExplanationCard
            isDark={isDark}
            questionId={q.id}
            questionText={q.Question_Text}
            options={{
              A: q.Option_A || '',
              B: q.Option_B || '',
              C: q.Option_C || '',
              D: q.Option_D || '',
              E: q.Option_E || '',
            }}
            correctAnswer={correctAns}
            category={q.Theme_Category}
            userId={userId}
          />
        </div>
      )}

      {isStandalone && displayMode === 'horizontal' && (
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
            className={`flex-1 py-3 font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all disabled:opacity-30 ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <ChevronLeft size={14} className="inline me-1" /> {t('previous')}
                                </button>
          <button
            type="button"
            disabled={currentIndex === sessionQuestions.length - 1}
            onClick={() => { setCurrentIndex(currentIndex + 1); window.scrollTo(0, 0); }}
            className={`flex-1 py-3 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all ${
              !isAnswered
                ? (isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300')
                : 'bg-sky-600 hover:bg-sky-700 text-white'
            }`}
          >
            {!isAnswered ? (
              <span className="flex items-center justify-center gap-1">{t('skip_question')} <ChevronRight size={14} /></span>
            ) : (
              <span className="flex items-center justify-center gap-1">{t('next_question')} <ChevronRight size={14} /></span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}