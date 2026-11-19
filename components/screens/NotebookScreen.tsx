'use client';

import { OrganAtelierMainView } from "@/features/study/StudyPanel";
import { ArrowLeft, FileText, X, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useProgressStore } from '../../stores/progressStore';
import { useUIStore, type PanelId } from '../../stores/uiStore';
import type { Question } from '../../lib/helpers';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  notebookQuestions: Question[];
  onBack: () => void;
  onRemoveNote: (qId: number) => void;
};

export default function NotebookScreen({ isDark, notebookQuestions, onBack, onRemoveNote }: Props) {
    const t = useTranslations('components_screens_NotebookScreen');
  // ✅ البانل الحالي
  const currentPanel = useUIStore(s => s.currentPanel) as PanelId;
  const userNotes = useProgressStore(currentPanel, s => s.userNotes);

  const [sectionTab, setSectionTab] = useState<"organs3d" | "notes">("organs3d");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null);

  const getCorrectLetter = (ans: string | null | undefined): string => {
    if (!ans) return 'A';
    const str = String(ans).trim().toUpperCase();
    const match = str.match(/\b([A-E])\b/);
    if (match) return match[1];
    return str.charAt(0);
  };

  const getOptionText = (q: Question, letter: string): string => {
    const map: { [key: string]: string | null } = {
      A: q.Option_A,
      B: q.Option_B,
      C: q.Option_C,
      D: q.Option_D,
      E: q.Option_E,
    };
    return map[letter] || '';
  };

  const handleRemoveClick = (qId: number) => {
    setConfirmRemoveId(qId);
  };

  const confirmRemove = () => {
    if (confirmRemoveId !== null) {
      onRemoveNote(confirmRemoveId);
      setConfirmRemoveId(null);
      setExpandedId(null);
    }
  };

  if (sectionTab === "organs3d") {
    return (
      <div className="w-full h-[calc(100vh-70px)] min-h-[680px] flex flex-col rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-white shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition"
            >
              <ArrowLeft size={14} className="inline" /> رجوع
            </button>
            <button
              type="button"
              onClick={() => setSectionTab("organs3d")}
              className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-blue-600 text-white shadow-sm"
            >
              🫀 الأعضاء 3D · 3D Organs (9)
            </button>
            <button
              type="button"
              onClick={() => setSectionTab("notes")}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:text-white transition"
            >
              📝 ملاحظات الأسئلة ({notebookQuestions.length})
            </button>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold hidden md:inline">
            معرض الأعضاء التشريحي التفاعلي 3D · 9 أعضاء مع العلامات والاختبار والمقارنة
          </span>
        </div>
        <div className="flex-1 min-h-0 relative">
          <OrganAtelierMainView onBackToFullAtlas={onBack} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in max-w-5xl mx-auto space-y-6 py-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setSectionTab("organs3d")}
          className="px-4 py-2 rounded-xl text-xs font-extrabold bg-blue-600 text-white shadow-sm hover:bg-blue-500 transition"
        >
          🫀 العودة إلى قسم الأعضاء 3D (9 أعضاء تفاعلية)
        </button>
      </div>
      <div className="flex justify-start mb-2">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all shadow-sm ${
            isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ArrowLeft size={16} className="inline me-1" /> {t('back_to_dashboard')}
                          </button>
      </div>

      <h2 className={`text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-3 mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        <FileText size={24} className="inline me-2" /> {t('my_notebook')}
                    </h2>

      {notebookQuestions.length === 0 ? (
        <div className={`p-10 lg:p-16 text-center border border-dashed rounded-3xl ${isDark ? 'border-slate-700 bg-slate-900/50 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-500'}`}>
          <p className="text-lg font-bold mb-2">{t('no_notes_found_yet')}</p>
          <p className="text-sm">{t('start_practicing_and_write_custom')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {notebookQuestions.map((q, idx) => {
            const correctAns = getCorrectLetter(q.Correct_Answer);
            const correctText = getOptionText(q, correctAns);
            const isExpanded = expandedId === q.id;
            const isConfirming = confirmRemoveId === q.id;

            return (
              <div
                key={q.id}
                className={`p-6 lg:p-8 rounded-3xl border shadow-sm transition-colors relative ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                {/* Header with badge + X button */}
                <div className="flex justify-between items-start mb-4 gap-3">
                  <span className={`text-[10px] px-3 py-1.5 rounded-full font-extrabold border ${
                    isDark ? 'bg-sky-950/80 text-sky-300 border-sky-800/60' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {q.Theme_Category}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] lg:text-xs font-bold text-slate-400">Note {idx + 1}</span>
                    {!isConfirming ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveClick(q.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isDark
                            ? 'bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-rose-500 hover:text-white'
                        }`}
                        title={t('remove_from_notebook')}
                      >
                        <X size={14} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={confirmRemove}
                          className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold"
                        >
                          {t('confirm')}
                                                                    </button>
                        <button
                          type="button"
                          onClick={() => setConfirmRemoveId(null)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
                            isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {t('cancel')}
                                                                    </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Question text */}
                <p className={`text-sm sm:text-base font-bold mb-5 leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {q.Question_Text}
                </p>

                {/* User's note */}
                <div className={`p-4 rounded-xl text-sm font-semibold border mb-4 ${
                  isDark ? 'bg-amber-950/20 border-amber-900/40 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <span className="block mb-2 text-[10px] uppercase tracking-widest font-black text-amber-500">
                    {t('your_note')}
                                              </span>
                  {userNotes[q.id]}
                </div>

                {/* Toggle button for answer + explanation */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all font-bold text-xs sm:text-sm ${
                    isDark
                      ? 'bg-slate-800/50 border-slate-700 text-slate-200 hover:bg-slate-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-500" />
                    {isExpanded ? t('hide_answer_explanation') : t('show_answer_explanation')}
                  </span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Answer + Explanation */}
                {isExpanded && (
                  <div className="mt-4 space-y-4 animate-fade-in">
                    {/* Correct Answer */}
                    <div className={`p-4 rounded-xl border ${
                      isDark ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-emerald-50 border-emerald-200'
                    }`}>
                      <span className={`block mb-2 text-[10px] uppercase tracking-widest font-black ${
                        isDark ? 'text-emerald-400' : 'text-emerald-700'
                      }`}>
                        {t('correct_answer')}
                                                          </span>
                      <div className={`flex items-start gap-3 text-sm font-bold ${
                        isDark ? 'text-emerald-100' : 'text-emerald-900'
                      }`}>
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                          isDark ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-600 text-white'
                        }`}>
                          {correctAns}
                        </span>
                        <span className="pt-1">{correctText}</span>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className={`p-4 rounded-xl border ${
                      isDark ? 'bg-sky-950/30 border-sky-900/50' : 'bg-blue-50 border-blue-200'
                    }`}>
                      <span className={`block mb-2 text-[10px] uppercase tracking-widest font-black ${
                        isDark ? 'text-sky-400' : 'text-blue-700'
                      }`}>
                        {t('explanation')}
                                                          </span>
                      <p className={`text-xs sm:text-sm leading-relaxed ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {q.Explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}