'use client';
import { Settings, BookOpen, GraduationCap, X, Rocket, Type } from 'lucide-react';
import { useExamStore } from '../../../stores/examStore';
import { useUIStore } from '../../../stores/uiStore';
import { getSubjectsFor } from '../../../lib/undergradSubjects';
import { useMemo } from 'react';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  uniqueCategories: string[];
  examBank: 'mrcs' | 'undergraduate';
  onConfirm: () => void;
};

export default function ExamSetupModal({ isDark, uniqueCategories, examBank, onConfirm }: Props) {
    const t = useTranslations('components_screens_exam_ExamSetupModal');
  const currentPanel = useUIStore(s => s.currentPanel);

  const showExamSetup = useExamStore(currentPanel, s => s.showExamSetup);
  const setShowExamSetup = useExamStore(currentPanel, s => s.setShowExamSetup);
  const customQuestionCount = useExamStore(currentPanel, s => s.customQuestionCount);
  const setCustomQuestionCount = useExamStore(currentPanel, s => s.setCustomQuestionCount);
  const customDurationMinutes = useExamStore(currentPanel, s => s.customDurationMinutes);
  const setCustomDurationMinutes = useExamStore(currentPanel, s => s.setCustomDurationMinutes);
  const customDifficulty = useExamStore(currentPanel, s => s.customDifficulty);
  const setCustomDifficulty = useExamStore(currentPanel, s => s.setCustomDifficulty);
  const examMode = useExamStore(currentPanel, s => s.examMode);
  const setExamMode = useExamStore(currentPanel, s => s.setExamMode);

  // ✅ NEW — Realistic Exam Mode
  const examFontMode = useExamStore(currentPanel, s => s.examFontMode);
  const setExamFontMode = useExamStore(currentPanel, s => s.setExamFontMode);

  const undergradExamYear = useExamStore(currentPanel, s => s.undergradExamYear);
  const setUndergradExamYear = useExamStore(currentPanel, s => s.setUndergradExamYear);
  const undergradExamSemester = useExamStore(currentPanel, s => s.undergradExamSemester);
  const setUndergradExamSemester = useExamStore(currentPanel, s => s.setUndergradExamSemester);
  const undergradExamSubject = useExamStore(currentPanel, s => s.undergradExamSubject);
  const setUndergradExamSubject = useExamStore(currentPanel, s => s.setUndergradExamSubject);

  const availableSubjects = useMemo(() => {
    return getSubjectsFor(undergradExamYear, undergradExamSemester);
  }, [undergradExamYear, undergradExamSemester]);

  if (!showExamSetup) return null;

  const mrcsModes = [
    {
      key: 'mrcs_abs' as const,
      label: t('applied_basic_sciences'),
      desc: '3h exam · 14 topics',
      duration: 180,
    },
    {
      key: 'mrcs_psg' as const,
      label: t('principles_of_surgery_in_general'),
      desc: '2h exam · 6 topics',
      duration: 120,
    },
  ];

  const handleMrcsModeSelect = (mode: typeof mrcsModes[0]) => {
    setExamMode(mode.key);
    setCustomDurationMinutes(mode.duration);
  };

  const handleUndergradStart = () => {
    if (!undergradExamSubject) return;
    setExamMode('undergrad_custom');
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
      <div className={`w-full max-w-lg rounded-3xl shadow-2xl border p-6 lg:p-8 animate-fade-in max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              examBank === 'undergraduate'
                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                : 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'
            }`}>
              {examBank === 'undergraduate' ? <GraduationCap size={24} /> : <Settings size={24} />}
            </div>
            <div>
              <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('exam_settings')}
                                            </h3>
              <p className="text-xs text-slate-500">
                {examBank === 'undergraduate' ? t('undergraduate_mock_exam') : t('mrcs_mock_exam')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowExamSetup(false)}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <X size={18} />
          </button>
        </div>

        {examBank === 'mrcs' ? (
          <>
            {/* MRCS: Exam Mode Selection */}
            <div className="mb-6">
              <label className={`block text-xs font-bold mb-2 uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('choose_exam_type')}
                                            </label>
              <div className="grid grid-cols-1 gap-2">
                {mrcsModes.map(mode => (
                  <button
                    key={mode.key}
                    onClick={() => handleMrcsModeSelect(mode)}
                    className={`p-3 rounded-xl font-bold text-xs border-2 transition-all text-start ${
                      examMode === mode.key
                        ? 'bg-purple-600 text-white border-purple-700 shadow-lg'
                        : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100')
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={14} />
                        {mode.label}
                      </span>
                      <span className="text-[10px] opacity-80">{mode.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="mb-4">
              <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('number_of_questions')} <span className="text-purple-500">{customQuestionCount}</span>
              </label>
              <input
                type="range" min="5" max="150" step="5"
                value={customQuestionCount}
                onChange={e => setCustomQuestionCount(parseInt(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>5</span><span>150</span>
              </div>
            </div>

            {/* Duration */}
            <div className="mb-4">
              <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('duration')} <span className="text-purple-500">{customDurationMinutes} min</span>
              </label>
              <input
                type="range" min="5" max="240" step="5"
                value={customDurationMinutes}
                onChange={e => setCustomDurationMinutes(parseInt(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            {/* Difficulty */}
            <div className="mb-6">
              <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('difficulty')}</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: t('all'), value: 'All' as const },
                  { label: t('easy'), value: 1 },
                  { label: t('medium'), value: 2 },
                  { label: t('hard'), value: 3 },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    onClick={() => setCustomDifficulty(opt.value)}
                    className={`py-2 rounded-xl font-bold text-xs border transition-all ${
                      customDifficulty === opt.value
                        ? 'bg-purple-600 text-white border-purple-700'
                        : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700')
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Undergrad: Year */}
            <div className="mb-4">
              <h4 className={`text-xs font-black mb-3 uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
                {t('choose_year')}
                                                </h4>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(year => (
                  <button key={year}
                    onClick={() => { setUndergradExamYear(year); setUndergradExamSemester(1); setUndergradExamSubject('All'); }}
                    className={`py-2 rounded-xl font-bold text-xs border-2 transition-all ${
                      undergradExamYear === year ? 'bg-indigo-600 text-white border-indigo-500 scale-105'
                        : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700')
                    }`}
                  >{year}</button>
                ))}
              </div>
            </div>

            {/* Undergrad: Semester */}
            <div className="mb-4">
              <h4 className={`text-xs font-black mb-3 uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
                {t('choose_semester')}
                                                </h4>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map(sem => (
                  <button key={sem}
                    onClick={() => { setUndergradExamSemester(sem); setUndergradExamSubject('All'); }}
                    className={`py-2 rounded-xl font-bold text-xs border-2 transition-all ${
                      undergradExamSemester === sem ? 'bg-indigo-600 text-white border-indigo-500 scale-105'
                        : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700')
                    }`}
                  >{sem === 1 ? t('1st_semester') : t('2nd_semester')}</button>
                ))}
              </div>
            </div>

            {/* Undergrad: Subject */}
            <div className="mb-4">
              <h4 className={`text-xs font-black mb-3 uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">3</span>
                {t('choose_subject')}
                                                </h4>
              {availableSubjects.length === 0 ? (
                <p className={`text-xs text-center py-3 rounded-xl border border-dashed ${isDark ? 'text-slate-500 border-slate-700' : 'text-slate-400 border-slate-300'}`}>
                  {t('no_subjects_available_for_this')}
                                                      </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setUndergradExamSubject('All')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs border-2 transition-all ${
                      undergradExamSubject === 'All'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700')
                    }`}
                  >
                    {t('all_subjects')}
                                                                </button>
                  {availableSubjects.map((subj: string) => (
                    <button
                      key={subj}
                      onClick={() => setUndergradExamSubject(subj)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs border-2 transition-all ${
                        undergradExamSubject === subj
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700')
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Question Count */}
            <div className="mb-4">
              <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('number_of_questions')} <span className="text-indigo-500">{customQuestionCount}</span>
              </label>
              <input
                type="range" min="5" max="150" step="5"
                value={customQuestionCount}
                onChange={e => setCustomQuestionCount(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Duration */}
            <div className="mb-6">
              <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {t('duration')} <span className="text-indigo-500">{customDurationMinutes} min</span>
              </label>
              <input
                type="range" min="5" max="180" step="5"
                value={customDurationMinutes}
                onChange={e => setCustomDurationMinutes(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/*  ✅ Realistic Exam Mode Toggle                              */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className={`mb-6 p-4 rounded-2xl border ${
          isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 transition-colors ${
                  examFontMode
                    ? 'bg-sky-500/15 text-sky-400'
                    : isDark
                    ? 'bg-slate-700 text-slate-400'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                <Type size={18} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {t('realistic_exam_mode')}
                                                  </p>
                <p className={`text-[11px] mt-0.5 leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('arial_16px_same_as_pearson')}
                                                  </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={examFontMode}
              aria-label={t('toggle_realistic_exam_mode')}
              onClick={() => setExamFontMode(!examFontMode)}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                examFontMode ? 'bg-sky-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                  examFontMode ? 'end-0.5' : 'end-[22px]'
                }`}
              />
            </button>
          </div>

          {/* Live preview */}
          {examFontMode && (
            <div
              className={`mt-3 px-3 py-2.5 rounded-lg border ${
                isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-white border-slate-200'
              }`}
              style={{ fontFamily: "'Arial', 'Helvetica', sans-serif" }}
            >
              <p className={`font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`} style={{ fontFamily: 'inherit', fontSize: 13 }}>
                {t('preview')}
                                            </p>
              <p className={isDark ? 'text-slate-200' : 'text-slate-800'} style={{ fontFamily: 'inherit', fontSize: 16, lineHeight: 1.55 }}>
                {t('a_45_year_old_male')}
                                            </p>
              <div className="flex gap-2 mt-2.5">
                {['A', 'B', 'C', 'D'].map(l => (
                  <span
                    key={l}
                    className={`px-2.5 py-0.5 rounded-md font-bold ${
                      isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}
                    style={{ fontFamily: 'inherit', fontSize: 13 }}
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-slate-700/30">
          <button
            onClick={() => setShowExamSetup(false)}
            className={`flex-1 py-3 font-bold rounded-xl text-sm transition-colors ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {t('cancel')}
                                </button>
          <button
            onClick={examBank === 'undergraduate' ? handleUndergradStart : onConfirm}
            disabled={examBank === 'undergraduate' && !undergradExamSubject}
            className={`flex-1 py-3 font-black rounded-xl text-sm shadow-lg text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              examBank === 'undergraduate' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {t('start_exam')} <Rocket size={14} className="inline ms-1" />
          </button>
        </div>
      </div>
    </div>
  );
}