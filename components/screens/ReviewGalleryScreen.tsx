'use client';
import { ChevronLeft, ArrowLeft, X, Brain, Flag, XCircle } from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';
import { useUIStore, type PanelId } from '../../stores/uiStore';
import type { Question } from '../../lib/helpers';
import { BackButton } from '../ui/BackButton';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  onBack: () => void;
  onRemove: (qId: number) => void;
  onStartSession: (questions: Question[], idx: number, source: 'review_gallery') => void;
};

export default function ReviewGalleryScreen({ isDark, onBack, onRemove, onStartSession }: Props) {
    const t = useTranslations('components_screens_ReviewGalleryScreen');
  // ✅ البانل الحالي
  const currentPanel = useUIStore(s => s.currentPanel) as PanelId;

  // ✅ API الجديد — بنبعت currentPanel كأول arg
  const reviewQuestions = useSessionStore(currentPanel, s => s.reviewQuestions);
  const reviewTitle = useSessionStore(currentPanel, s => s.reviewTitle);
  const searchQuery = useSessionStore(currentPanel, s => s.searchQuery);
  const setSearchQuery = useSessionStore(currentPanel, s => s.setSearchQuery);

  // 🛡️ حماية: تأكد إن reviewQuestions مصفوفة
  const safeQuestions = Array.isArray(reviewQuestions) ? reviewQuestions : [];
  const safeSearchQuery = (searchQuery ?? '').toString().toLowerCase();

  const filteredReviewQs = safeQuestions.filter(q =>
    (q?.Question_Text ?? '').toLowerCase().includes(safeSearchQuery) ||
    (q?.Theme_Category ?? '').toLowerCase().includes(safeSearchQuery)
  );

  // 🛡️ حماية: امنع الـ click من الانتشار
  const handleRemove = (e: React.MouseEvent, qId: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      onRemove(qId);
    } catch (err) {
      console.error('Remove error:', err);
    }
  };

  // 🛡️ حماية: تأكد إن index صح
  const handleStart = (idx: number) => {
    if (filteredReviewQs.length === 0) return;
    const safeIdx = Math.max(0, Math.min(idx, filteredReviewQs.length - 1));
    onStartSession(filteredReviewQs, safeIdx, 'review_gallery');
  };

  return (
    <div className="w-full animate-fade-in space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8">
        <button
          type="button"
          onClick={onBack}
          className={`self-start flex items-center gap-2 px-4 py-2 rounded-lg text-xs lg:text-sm font-bold shadow-sm transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'}`}
        >
          <ChevronLeft size={14} className="inline" /> {t('dashboard')}
                          </button>
        <input
          type="text"
          placeholder={t('search_questions')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={`p-2 rounded-lg border text-sm w-full sm:w-auto ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
        />
      </div>

      {filteredReviewQs.length === 0 ? (
        <div className={`p-12 lg:p-16 text-center rounded-3xl border-2 border-solid ${isDark ? 'border-slate-700 bg-slate-900/50 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'}`}>
          <div className={`w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            {reviewTitle === 'Smart Review' && <Brain size={40} className="text-sky-400" />}
            {reviewTitle === 'Flagged Questions' && <Flag size={40} className="text-indigo-400" />}
            {reviewTitle === 'Incorrect Questions' && <XCircle size={40} className="text-rose-400" />}
          </div>
          <h3 className={`text-xl font-black mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {reviewTitle === 'Smart Review' && 'All caught up!'}
            {reviewTitle === 'Flagged Questions' && 'No flagged questions'}
            {reviewTitle === 'Incorrect Questions' && 'No incorrect questions'}
            {!['Smart Review', 'Flagged Questions', 'Incorrect Questions'].includes(reviewTitle) && 'No questions to review'}
          </h3>
          <p className={`text-sm max-w-md mx-auto leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            {reviewTitle === 'Smart Review' && 'You have no questions due for spaced repetition today. Keep practicing to build your review schedule.'}
            {reviewTitle === 'Flagged Questions' && 'Flag any question during practice to revisit it later. Flagged questions will appear here.'}
            {reviewTitle === 'Incorrect Questions' && 'Great job! You have no incorrect questions. Any question you answer wrong will be listed here for review.'}
            {!['Smart Review', 'Flagged Questions', 'Incorrect Questions'].includes(reviewTitle) && 'Pick a category from the sidebar to start reviewing.'}
          </p>
          <BackButton onClick={onBack} label={t('back')} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
          {filteredReviewQs.slice(0, 50).map((q, idx) => (
            <div
              key={q.id ?? `q-${idx}`}
              onClick={() => handleStart(idx)}
              className={`p-4 lg:p-5 rounded-2xl border cursor-pointer transition-all hover:-translate-y-1 shadow-sm hover:shadow-md flex flex-col h-32 lg:h-40 relative group ${isDark ? 'bg-slate-900 border-slate-700 hover:border-sky-500' : 'bg-white border-slate-200 hover:border-blue-400'}`}
            >
              <button
                type="button"
                onClick={(e) => handleRemove(e, q.id)}
                className="absolute top-2.5 end-2.5 w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors z-10 cursor-pointer"
                title={t('remove_from_list')}
              >
                <X size={14} />
              </button>
              <div className="flex justify-between items-center mb-3 pe-7">
                <span className="text-[10px] lg:text-xs font-bold text-slate-500">Question {idx + 1}</span>
                <span className={`text-[9px] lg:text-[10px] px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-full font-extrabold ${isDark ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-amber-600'}`}>
                  Diff: {q.Difficulty}
                </span>
              </div>
              <p className={`text-xs lg:text-sm font-semibold leading-relaxed line-clamp-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {q.Question_Text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}