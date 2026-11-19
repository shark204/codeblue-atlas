'use client';
import { Wrench, X, Zap, Flag, XCircle } from 'lucide-react';
import { IconBrain } from '../ui/Icons';
import { useUIStore, type PanelId } from '../../stores/uiStore';
import { useProgressStore } from '../../stores/progressStore';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  panelId?: PanelId;
  questionsCount: number;
  dueSrCount: number;
  onOpenFlashcards: () => void;
  onReviewTab: (tab: 'smart_review' | 'flagged' | 'incorrect') => void;
};

export default function ToolsModal({
  isDark, panelId, questionsCount, dueSrCount, onOpenFlashcards, onReviewTab,
}: Props) {
    const t = useTranslations('components_screens_ToolsModal');
  // ✅ البانل الحالي — لو متمرر من بره، استخدمه. لو لأ، من الـ store
  const storePanel = useUIStore(s => s.currentPanel) as PanelId;
  const currentPanel = panelId || storePanel;

  const showToolsModal = useUIStore(s => s.showToolsModal);
  const setShowToolsModal = useUIStore(s => s.setShowToolsModal);
  const flaggedIds = useProgressStore(currentPanel, s => s.flaggedIds);
  const incorrectIds = useProgressStore(currentPanel, s => s.incorrectIds);

  if (!showToolsModal) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center lg:items-center bg-slate-900/80 backdrop-blur-md animate-fade-in"
      onClick={() => setShowToolsModal(false)}
    >
      <div
        className={`w-full max-w-md lg:rounded-3xl rounded-t-3xl p-6 shadow-2xl border-t lg:border animate-slide-up ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`lg:hidden w-12 h-1.5 rounded-full mx-auto mb-5 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></div>

        <div className="flex items-center justify-between mb-5">
          <h3 className={`text-lg font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Wrench size={20} /> {t('tools')}
                                </h3>
          <button onClick={() => setShowToolsModal(false)} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            <X size={14} />
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => { setShowToolsModal(false); onOpenFlashcards(); }}
            className={`w-full flex items-center justify-between gap-3 p-4 rounded-2xl border-2 transition-all text-start ${isDark ? 'bg-teal-950/30 border-teal-900 hover:bg-teal-950/50' : 'bg-teal-50 border-teal-200 hover:bg-teal-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-teal-900/50 text-teal-400' : 'bg-teal-100 text-teal-600'}`}>
                <Zap size={20} />
              </div>
              <div>
                <p className={`text-sm font-black ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>{t('flashcards')}</p>
                <p className="text-[10px] text-slate-500 font-medium">{t('rapid_card_review')}</p>
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-black ${isDark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-200 text-teal-800'}`}>{questionsCount}</span>
          </button>

          <button
            onClick={() => { setShowToolsModal(false); onReviewTab('smart_review'); }}
            className={`w-full flex items-center justify-between gap-3 p-4 rounded-2xl border-2 transition-all text-start ${isDark ? 'bg-sky-950/30 border-sky-900 hover:bg-sky-950/50' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-sky-900/50 text-sky-400' : 'bg-blue-100 text-blue-600'}`}>
                <IconBrain />
              </div>
              <div>
                <p className={`text-sm font-black ${isDark ? 'text-sky-300' : 'text-blue-700'}`}>{t('smart_review')}</p>
                <p className="text-[10px] text-slate-500 font-medium">{t('spaced_repetition_due_today')}</p>
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-black ${isDark ? 'bg-sky-900/50 text-sky-300' : 'bg-blue-200 text-blue-800'}`}>{dueSrCount}</span>
          </button>

          <button
            onClick={() => { setShowToolsModal(false); onReviewTab('flagged'); }}
            className={`w-full flex items-center justify-between gap-3 p-4 rounded-2xl border-2 transition-all text-start ${isDark ? 'bg-indigo-950/30 border-indigo-900 hover:bg-indigo-950/50' : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                <Flag size={20} />
              </div>
              <div>
                <p className={`text-sm font-black ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>{t('flagged')}</p>
                <p className="text-[10px] text-slate-500 font-medium">{t('questions_you_saved_for_later')}</p>
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-black ${isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-200 text-indigo-800'}`}>{flaggedIds.length}</span>
          </button>

          <button
            onClick={() => { setShowToolsModal(false); onReviewTab('incorrect'); }}
            className={`w-full flex items-center justify-between gap-3 p-4 rounded-2xl border-2 transition-all text-start ${isDark ? 'bg-rose-950/30 border-rose-900 hover:bg-rose-950/50' : 'bg-rose-50 border-rose-200 hover:bg-rose-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-rose-900/50 text-rose-400' : 'bg-rose-100 text-rose-600'}`}>
                <XCircle size={20} />
              </div>
              <div>
                <p className={`text-sm font-black ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>{t('incorrect')}</p>
                <p className="text-[10px] text-slate-500 font-medium">{t('questions_you_answered_wrong')}</p>
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-black ${isDark ? 'bg-rose-900/50 text-rose-300' : 'bg-rose-200 text-rose-800'}`}>{incorrectIds.length}</span>
          </button>
        </div>
      </div>
    </div>
  );
}