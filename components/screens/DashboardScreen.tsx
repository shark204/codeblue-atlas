'use client';
import { Bell, Rocket } from 'lucide-react';
import { useProgressStore } from '../../stores/progressStore';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  userName: string;
  panelId?: string;
  questionsCount: number;
  hasSavedSettings: boolean;
  hasSavedSession: boolean;
  examDate: string;
  daysLeft: number | null;
  dailyGoal: number;
  dashboardStep: number;
  setDashboardStep: (n: number | ((p: number) => number)) => void;
  displayMode: 'horizontal' | 'vertical';
  setDisplayMode: (m: 'horizontal' | 'vertical') => void;
  repeatIncorrect: boolean;
  setRepeatIncorrect: (b: boolean) => void;
  skipDuplicates: boolean;
  setSkipDuplicates: (b: boolean) => void;
  spectateMode: boolean;
  setSpectateMode: (b: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedDifficulty: number | 'All';
  setSelectedDifficulty: (d: number | 'All') => void;
  uniqueCategories: string[];
  announcement?: string;
  onLoadSaved: () => void;
  onResumeSession: () => void;
  onGoToSettings: () => void;
  onStartSession: () => void;
};

export default function DashboardScreen({
  isDark, userName, panelId = 'mrcs', questionsCount, hasSavedSettings, hasSavedSession,
  examDate, daysLeft, dailyGoal, dashboardStep, setDashboardStep,
  displayMode, setDisplayMode, repeatIncorrect, setRepeatIncorrect,
  skipDuplicates, setSkipDuplicates, spectateMode, setSpectateMode,
  selectedCategory, setSelectedCategory, selectedDifficulty, setSelectedDifficulty,
  uniqueCategories, announcement, onLoadSaved, onResumeSession, onGoToSettings, onStartSession,
}: Props) {
    const t = useTranslations('components_screens_DashboardScreen');
  const score = useProgressStore(panelId as any, s => s.score);

  return (
    <div className="w-full animate-fade-in space-y-6">

      {announcement && (
        <div className={`relative overflow-hidden p-4 rounded-2xl border flex items-start gap-3 grain-overlay ${
          isDark
            ? 'bg-gradient-to-br from-amber-950/50 to-orange-950/30 border-amber-800/60 text-amber-200'
            : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 text-amber-800'
        }`}>
          <Bell size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">{t('announcement')}</h4>
            <p className="text-xs mt-1 leading-relaxed">{announcement}</p>
          </div>
        </div>
      )}

      {hasSavedSettings && (
        <div className={`relative overflow-hidden mb-6 p-6 rounded-2xl border-2 text-center animate-fade-in grain-overlay ${
          isDark
            ? 'border-sky-500/30 bg-gradient-to-br from-sky-500/10 to-teal-500/10'
            : 'border-sky-300 bg-gradient-to-br from-sky-50 to-teal-50'
        }`}>
          <div className={`absolute -top-12 -end-12 w-40 h-40 rounded-full blur-3xl ${
            isDark ? 'bg-sky-500/20' : 'bg-sky-400/30'
          }`} />
          <div className="relative z-10">
            <h4 className={`text-lg font-black mb-2 flex items-center justify-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Rocket size={20} className={isDark ? 'text-sky-400' : 'text-sky-600'} /> {t('quick_start')}
                                      </h4>
            <p className={`text-xs sm:text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('you_have_a_saved_customization')}
                                      </p>
            <button
              onClick={onLoadSaved}
              className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-black rounded-xl shadow-lg shadow-sky-500/30 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span className="relative z-10">{t('continue_with_previous_customization')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ Steps Section ═══════════ */}
      <div className="w-full">
        <div className={`relative overflow-hidden rounded-3xl shadow-lg border flex flex-col grain-overlay ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>

          {/* Header */}
          <div className={`px-4 lg:px-6 py-4 lg:py-5 border-b flex justify-between items-center relative ${
            isDark ? 'bg-gradient-to-r from-slate-800/70 to-slate-900/70 border-slate-800' : 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200'
          }`}>
            <div className="flex gap-1.5 lg:gap-2">
              {[1, 2, 3].map(n => (
                <div
                  key={n}
                  className={`w-6 lg:w-8 h-2 rounded-full transition-all duration-500 ${
                    dashboardStep >= n
                      ? 'bg-gradient-to-r from-sky-500 to-teal-500 shadow-md shadow-sky-500/40'
                      : (isDark ? 'bg-slate-700' : 'bg-slate-200')
                  }`}
                />
              ))}
            </div>
            <div className={`text-[10px] lg:text-xs font-black tracking-widest uppercase ${
              isDark ? 'text-slate-500' : 'text-slate-500'
            }`}>
              Step {dashboardStep} of 3
            </div>
          </div>

          {/* Content */}
          <div className="p-5 lg:p-10 min-h-[300px]">
            {dashboardStep === 1 && (
              <div className="animate-fade-in">
                <h3 className={`text-lg lg:text-2xl font-black mb-6 lg:mb-8 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {t('1_customize_your_experience')}
                                                  </h3>
                <div className="space-y-6 lg:space-y-8">
                  <div>
                    <h4 className={`text-xs lg:text-sm font-bold mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {t('display_mode')}
                                                              </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                      {(['horizontal', 'vertical'] as const).map(mode => (
                        <button
                          key={mode}
                          onClick={() => setDisplayMode(mode)}
                          className={`group p-3 lg:p-4 rounded-xl lg:rounded-2xl border text-start flex items-center sm:flex-col sm:justify-center gap-3 transition-all duration-300 hover:scale-[1.02] ${
                            displayMode === mode
                              ? isDark
                                ? 'border-sky-500 bg-gradient-to-br from-slate-800 to-slate-900 text-sky-400 ring-2 ring-sky-500/30 shadow-lg shadow-sky-500/20'
                                : 'border-blue-600 bg-gradient-to-br from-blue-50 to-sky-50 text-blue-700 ring-2 ring-blue-600/20 shadow-lg shadow-blue-500/10'
                              : isDark
                                ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                                : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <span className="font-bold text-xs lg:text-sm">
                            {mode === 'horizontal' ? t('horizontal_1_by_1') : t('vertical_list')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className={`text-xs lg:text-sm font-bold mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {t('repeat_errors_in_the_same')}
                                                              </h4>
                    <div className="grid grid-cols-2 gap-3 lg:gap-4">
                      {[false, true].map(val => (
                        <button
                          key={String(val)}
                          onClick={() => setRepeatIncorrect(val)}
                          className={`p-3 lg:p-3.5 rounded-xl border font-bold text-xs lg:text-sm transition-all duration-300 hover:scale-[1.02] ${
                            repeatIncorrect === val
                              ? isDark
                                ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-sky-500 text-sky-400 shadow-md shadow-sky-500/20'
                                : 'bg-gradient-to-br from-blue-50 to-sky-50 border-blue-600 text-blue-700 shadow-md shadow-blue-500/10'
                              : isDark
                                ? 'border-slate-700 text-slate-400 hover:bg-slate-800'
                                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {val ? t('yes') : t('no')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {dashboardStep === 2 && (
              <div className="animate-fade-in">
                <h3 className={`text-lg lg:text-2xl font-black mb-6 lg:mb-8 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {t('2_session_options')}
                                                  </h3>
                <div className="space-y-4 lg:space-y-6">
                  {[
                    { checked: skipDuplicates, setter: setSkipDuplicates, title: t('skip_duplicate_questions'), desc: t('show_only_one_copy_of') },
                    { checked: spectateMode, setter: setSpectateMode, title: t('spectate_mode'), desc: t('show_answers_immediately') },
                  ].map((opt, i) => (
                    <label
                      key={i}
                      className={`flex items-center justify-between p-4 lg:p-6 rounded-xl lg:rounded-2xl border cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                        isDark
                          ? 'bg-gradient-to-r from-slate-800/30 to-slate-900/30 border-slate-700 hover:bg-gradient-to-r hover:from-slate-800/60 hover:to-slate-900/60 hover:border-slate-600'
                          : 'bg-slate-50 border-slate-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-sky-50/50 hover:border-blue-200'
                      }`}
                    >
                      <div>
                        <h4 className={`text-sm lg:text-base font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {opt.title}
                        </h4>
                        <p className="text-[10px] lg:text-sm text-slate-500 mt-1">{opt.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={opt.checked}
                        onChange={() => opt.setter(!opt.checked)}
                        className="w-5 h-5 lg:w-6 lg:h-6 text-sky-500 rounded cursor-pointer border-slate-300 transition-transform duration-200 hover:scale-110"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {dashboardStep === 3 && (
              <div className="animate-fade-in">
                <h3 className={`text-lg lg:text-2xl font-black mb-6 lg:mb-8 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {t('3_filter_start')}
                                                  </h3>
                <div className="space-y-8">
                  <div>
                    <h4 className={`text-xs lg:text-sm font-bold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {t('select_category')}
                                                              </h4>
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className={`w-full p-3 rounded-lg border font-semibold transition-all focus:ring-2 focus:ring-sky-500 focus:outline-none ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-200'
                          : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    >
                      {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <h4 className={`text-xs lg:text-sm font-bold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {t('select_difficulty')}
                                                              </h4>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                      {[
                        { v: 'All' as const, l: t('all_difficulties') },
                        { v: 1, l: t('easy') },
                        { v: 2, l: t('medium') },
                        { v: 3, l: t('hard') },
                      ].map(d => (
                        <label
                          key={String(d.v)}
                          className="flex items-center gap-3 cursor-pointer p-2 border rounded-lg sm:border-none sm:p-0 transition-transform hover:scale-105"
                        >
                          <input
                            type="radio"
                            name="difficultyLevel"
                            checked={selectedDifficulty === d.v}
                            onChange={() => setSelectedDifficulty(d.v)}
                            className="w-5 h-5 text-sky-500 cursor-pointer"
                          />
                          <span className={`text-sm font-bold ${
                            selectedDifficulty === d.v
                              ? (isDark ? 'text-slate-200' : 'text-slate-800')
                              : (isDark ? 'text-slate-500' : 'text-slate-400')
                          }`}>
                            {d.l}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className={`p-4 lg:p-6 border-t flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50/50'
          }`}>
            <button
              onClick={() => setDashboardStep(p => Math.max(1, (typeof p === 'number' ? p : 1) - 1))}
              className={`px-4 lg:px-6 py-2.5 lg:py-3 font-bold text-xs lg:text-sm rounded-xl transition-all duration-300 hover:scale-105 ${
                dashboardStep === 1
                  ? 'opacity-0 pointer-events-none'
                  : isDark
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('back')}
                                      </button>
            {dashboardStep < 3 ? (
              <button
                onClick={() => setDashboardStep(p => Math.min(3, (typeof p === 'number' ? p : 1) + 1))}
                className="group relative overflow-hidden px-6 lg:px-8 py-2.5 lg:py-3 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-black text-xs lg:text-sm rounded-xl shadow-lg shadow-sky-500/30 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t('next_step')} <span>›</span>
                </span>
              </button>
            ) : (
              <button
                onClick={onStartSession}
                className="group relative overflow-hidden px-6 lg:px-8 py-2.5 lg:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs lg:text-sm rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2"
              >
                <span className="relative z-10">{t('save_my_choices_start_practice')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}