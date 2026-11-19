'use client';
import { ArrowLeft, GraduationCap, Rocket, ChevronRight, Settings as SettingsIcon, Sparkles } from 'lucide-react';
import { useProgressStore } from '../../stores/progressStore';
import { getSubjectsFor } from '../../lib/undergradSubjects';
import { useMemo, useState } from 'react';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  userName: string;
  examDate: string;
  daysLeft: number | null;
  dailyGoal: number;
  undergradQuestionsCount?: number;
  undergradLoading: boolean;
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  selectedSemester: number;
  setSelectedSemester: (s: number) => void;
  selectedSubject: string;
  setSelectedSubject: (s: string) => void;
  displayMode: 'horizontal' | 'vertical';
  setDisplayMode: (m: 'horizontal' | 'vertical') => void;
  repeatIncorrect: boolean;
  setRepeatIncorrect: (b: boolean) => void;
  skipDuplicates: boolean;
  setSkipDuplicates: (b: boolean) => void;
  spectateMode: boolean;
  setSpectateMode: (b: boolean) => void;
  onBack: () => void;
  onStart: () => void;
};

export default function UndergraduateScreen({
  isDark, userName, examDate, daysLeft, dailyGoal,
  undergradQuestionsCount = 0,
  undergradLoading,
  selectedYear, setSelectedYear, selectedSemester, setSelectedSemester,
  selectedSubject, setSelectedSubject,
  displayMode, setDisplayMode,
  repeatIncorrect, setRepeatIncorrect,
  skipDuplicates, setSkipDuplicates,
  spectateMode, setSpectateMode,
  onBack, onStart,
}: Props) {
    const t = useTranslations('components_screens_UndergraduateScreen');
  const score = useProgressStore('undergraduate', s => s.score);
  const availableSubjects = useMemo(
    () => getSubjectsFor(selectedYear, selectedSemester),
    [selectedYear, selectedSemester]
  );

  // ✅ الترتيب الجديد: customize الأول، ثم pick
  const [step, setStep] = useState<'customize' | 'pick'>('customize');

  // ═══════════════ Step 1: Customize ═══════════════
  if (step === 'customize') {
    return (
      <div className="w-full animate-fade-in max-w-4xl mx-auto space-y-6 py-4">
        {/* Header */}
        <div className={`p-6 lg:p-8 rounded-3xl shadow-xl border ${isDark ? 'bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border-indigo-800/50' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
            >
              <ArrowLeft size={14} /> {t('back')}
                                    </button>
            <div className="flex items-center gap-1.5">
              <span className="w-8 h-1 rounded-full bg-indigo-500"></span>
              <span className="w-8 h-1 rounded-full bg-slate-600"></span>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('step_1_of_2')}
                                    </span>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
              <SettingsIcon size={24} />
            </div>
            <div>
              <h2 className={`text-xl lg:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {t('customize_your_experience')}
                                          </h2>
              <p className="text-xs text-slate-500">
                ظبط إعداداتك قبل ما تختار المحتوى
              </p>
            </div>
          </div>
        </div>

        {/* Display Mode */}
        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-xs font-black uppercase tracking-wider mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {t('display_mode')}
                              </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDisplayMode('horizontal')}
              className={`py-4 px-4 rounded-2xl font-bold text-sm border-2 transition-all ${
                displayMode === 'horizontal'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg scale-105'
                  : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400')
              }`}
            >
              {t('horizontal_1_by_1')}
                                    </button>
            <button
              onClick={() => setDisplayMode('vertical')}
              className={`py-4 px-4 rounded-2xl font-bold text-sm border-2 transition-all ${
                displayMode === 'vertical'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg scale-105'
                  : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400')
              }`}
            >
              {t('vertical_list')}
                                    </button>
          </div>
        </div>

        {/* Repeat errors */}
        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-xs font-black uppercase tracking-wider mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {t('repeat_errors_in_the_same')}
                              </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setRepeatIncorrect(false)}
              className={`py-4 px-4 rounded-2xl font-bold text-sm border-2 transition-all ${
                !repeatIncorrect
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg scale-105'
                  : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400')
              }`}
            >
              {t('no')}
                                    </button>
            <button
              onClick={() => setRepeatIncorrect(true)}
              className={`py-4 px-4 rounded-2xl font-bold text-sm border-2 transition-all ${
                repeatIncorrect
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg scale-105'
                  : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400')
              }`}
            >
              {t('yes')}
                                    </button>
          </div>
        </div>

        {/* Skip duplicates */}
        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-xs font-black uppercase tracking-wider mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {t('skip_duplicate_questions')}
                              </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSkipDuplicates(true)}
              className={`py-4 px-4 rounded-2xl font-bold text-sm border-2 transition-all ${
                skipDuplicates
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg scale-105'
                  : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400')
              }`}
            >
              {t('yes')}
                                    </button>
            <button
              onClick={() => setSkipDuplicates(false)}
              className={`py-4 px-4 rounded-2xl font-bold text-sm border-2 transition-all ${
                !skipDuplicates
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg scale-105'
                  : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400')
              }`}
            >
              {t('no')}
                                    </button>
          </div>
        </div>

        {/* Spectate mode */}
        <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-xs font-black uppercase tracking-wider mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {t('spectate_mode')} <span className="text-[10px] font-normal normal-case text-slate-500">{t('answers_shown_automatically')}</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSpectateMode(false)}
              className={`py-4 px-4 rounded-2xl font-bold text-sm border-2 transition-all ${
                !spectateMode
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg scale-105'
                  : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400')
              }`}
            >
              {t('normal')}
                                    </button>
            <button
              onClick={() => setSpectateMode(true)}
              className={`py-4 px-4 rounded-2xl font-bold text-sm border-2 transition-all ${
                spectateMode
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg scale-105'
                  : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400')
              }`}
            >
              {t('spectate')}
                                    </button>
          </div>
        </div>

        {/* Next button */}
        <div className="flex justify-center pt-2 pb-8">
          <button
            onClick={() => setStep('pick')}
            className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-base rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2"
          >
            {t('next')} <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════ Step 2: Pick (السنة/الترم/المادة) ═══════════════
  return (
    <div className="w-full animate-fade-in max-w-5xl mx-auto space-y-6 py-4">
      

      <div className="flex justify-start mb-2">
        <button onClick={() => setStep('customize')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all shadow-sm ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
          <ArrowLeft size={16} className="inline me-1" /> {t('back_to_customize')}
                          </button>
      </div>

      <div className={`p-6 lg:p-8 rounded-3xl text-center shadow-xl border ${isDark ? 'bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border-indigo-800/50' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-8 h-1 rounded-full bg-indigo-500"></span>
            <span className="w-8 h-1 rounded-full bg-indigo-500"></span>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('step_2_of_2')}
                                </span>
        </div>
        <GraduationCap size={48} className="mx-auto mb-3 text-indigo-400" />
        <h2 className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('undergraduate_bank')}</h2>
        <p className="text-sm text-slate-500">{t('pick_year_semester_subject')}</p>
      </div>

      {undergradLoading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold mt-4 text-slate-500">{t('loading')}</p>
        </div>
      ) : (
        <>
          {/* 1️⃣ Pick Year */}
          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-sm font-black mb-4 uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
              {t('pick_year')}
                                          </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map(year => (
                <button key={year}
                  onClick={() => { setSelectedYear(year); setSelectedSemester(1); setSelectedSubject('All'); }}
                  disabled={year !== 1}
                  className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                    selectedYear === year ? 'bg-indigo-600 text-white border-indigo-500 scale-105 shadow-lg'
                      : year === 1 ? (isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400')
                        : (isDark ? 'bg-slate-900 border-slate-800 text-slate-600 opacity-40' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-40')
                  }`}
                >{year === 1 ? '1st' : year === 2 ? '2nd' : year === 3 ? '3rd' : `${year}th`} Year</button>
              ))}
            </div>
          </div>

          {/* 2️⃣ Pick Semester */}
          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-sm font-black mb-4 uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
              {t('pick_semester')}
                                          </h3>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map(sem => (
                <button key={sem}
                  onClick={() => { setSelectedSemester(sem); setSelectedSubject('All'); }}
                  disabled={sem !== 1}
                  className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                    selectedSemester === sem ? 'bg-indigo-600 text-white border-indigo-500 scale-105 shadow-lg'
                      : sem === 1 ? (isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400')
                        : (isDark ? 'bg-slate-900 border-slate-800 text-slate-600 opacity-40' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-40')
                  }`}
                >{sem === 1 ? t('1st_semester') : t('2nd_semester')}</button>
              ))}
            </div>
          </div>

          {/* 3️⃣ Pick Subject */}
          <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-sm font-black mb-4 uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">3</span>
              {t('pick_subject')}
                                          </h3>
            {availableSubjects.length === 0 ? (
              <div className={`p-6 text-center rounded-2xl border border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
                <p className="text-sm font-bold">{t('no_subjects_available_yet')}</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSubject('All')}
                  className={`px-5 py-2.5 rounded-full font-black text-xs border-2 transition-all ${
                    selectedSubject === 'All'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg'
                      : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400')
                  }`}
                >
                  {t('all_subjects')}
                                                          </button>
                {availableSubjects.map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubject(subj)}
                    className={`px-5 py-2.5 rounded-full font-black text-xs border-2 transition-all ${
                      selectedSubject === subj
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg'
                        : (isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-400')
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ✅ زرار البدء النهائي */}
          {availableSubjects.length > 0 && (
            <div className="flex justify-center pt-2 pb-8">
              <button
                onClick={onStart}
                disabled={undergradLoading}
                className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-base rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {undergradLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري التحضير...
                  </>
                ) : (
                  <>
                    <Rocket size={18} /> ابدأ الحل
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}