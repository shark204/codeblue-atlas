'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, BookOpen, Lock } from 'lucide-react';
import { ACADEMIC_YEARS } from '../data';
import { BOARD_EXAMS } from '../constants';
import { BackButton } from '@/components/ui/BackButton';
import { supabase } from '@/lib/supabase';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  onBack: () => void;
  onSelectYear: (slug: string) => void;
  onSelectBoard: (slug: string) => void;
  inactiveSlugs?: Set<string>;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
};

const SUBJECT_TO_DB: Record<string, string> = {
  'First Year': 'Year 1',
  'Second Year': 'Year 2',
  'Third Year': 'Year 3',
  'Fourth Year': 'Year 4',
  'Fifth Year': 'Year 5',
  'USMLE Step 1': 'USMLE Step 1',
  'MRCP Part A': 'MRCP Part A',
  'MRCS Part A': 'MRCS Part A',
};

// السنوات التي تحتوي على محتوى مفتوح بشكل افتراضي (أولى وثانية في CURRICULUM_DATA، ورابعة في Year 4)
const DEFAULT_OPEN_SLUGS = new Set(['First Year', 'Second Year', 'Fourth Year']);

export default function SubjectsView({
  isDark,
  onBack,
  onSelectYear,
  onSelectBoard,
  inactiveSlugs,
  onShowToast,
}: Props) {
    const t = useTranslations('components_screens_summaries_views_SubjectsView');
  const [openSlugs, setOpenSlugs] = useState<Set<string>>(DEFAULT_OPEN_SLUGS);

  // فحص تلقائي من قاعدة البيانات لمعرفة أي سنة أو زمالة تحتوي على دروس مفتوحة فعلياً
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await supabase
          .from('summaries')
          .select('subject, content_json');
        if (!alive || !data) return;

        const activeDbSubjects = new Set<string>();
        for (const row of data) {
          const groups = row?.content_json?.groups;
          const hasLessons =
            Array.isArray(groups) &&
            groups.some((g: any) => Array.isArray(g?.lessons) && g.lessons.length > 0);
          if (hasLessons && row.subject) {
            activeDbSubjects.add(row.subject);
          }
        }

        const nextOpen = new Set<string>(DEFAULT_OPEN_SLUGS);
        for (const [slug, dbSub] of Object.entries(SUBJECT_TO_DB)) {
          if (activeDbSubjects.has(dbSub)) {
            nextOpen.add(slug);
          }
        }
        setOpenSlugs(nextOpen);
      } catch {
        // fallback to DEFAULT_OPEN_SLUGS
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const isItemActive = (slug: string) => {
    if (inactiveSlugs) return !inactiveSlugs.has(slug);
    return openSlugs.has(slug);
  };

  const titleCls = isDark ? 'text-white' : 'text-slate-900';
  const mutedCls = isDark ? 'text-slate-300' : 'text-slate-700';

  return (
    <div className="w-full animate-fade-in max-w-6xl mx-auto py-2 sm:py-4 relative min-h-screen px-0">
      <div className="flex items-center justify-start gap-2 mb-6 sm:mb-8 flex-wrap">
        <BackButton onClick={onBack} label={t('back')} />
      </div>

      {/* ═══ البانل العلوي: شفاف في الوضع النهاري وزجاجي داكن في الليلي ═══ */}
      <div
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border p-5 sm:p-8 lg:p-10 mb-8 sm:mb-10 backdrop-blur-2xl transition-all duration-300 ${
          isDark
            ? 'bg-slate-900/60 border-slate-800 shadow-xl'
            : 'bg-white/25 border-white/55 shadow-[0_20px_45px_-18px_rgba(14,116,144,0.18),inset_0_1px_0_rgba(255,255,255,0.65)]'
        }`}
      >
        <div
          className={`absolute -top-24 -end-24 w-48 sm:w-72 h-48 sm:h-72 rounded-full blur-3xl pointer-events-none ${
            isDark ? 'bg-cyan-500/10' : 'bg-cyan-400/15'
          }`}
        />
        <div
          className={`absolute -bottom-24 -start-24 w-48 sm:w-72 h-48 sm:h-72 rounded-full blur-3xl pointer-events-none ${
            isDark ? 'bg-blue-500/10' : 'bg-blue-400/15'
          }`}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <BookOpen size={24} className="text-white" />
            </div>
            <span
              className={`text-[10px] sm:text-[11px] font-black uppercase tracking-widest ${
                isDark ? 'text-cyan-400' : 'text-sky-800'
              }`}
            >
              {t('code_blue_revision')}
                                      </span>
          </div>
          <h1
            className={`text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-2 sm:mb-3 ${titleCls}`}
          >
            {t('medical_curricula')}
                                </h1>
          <p className={`text-xs sm:text-base max-w-2xl leading-relaxed font-semibold ${mutedCls}`}>
            {t('revive_your_knowledge_ace_the')}
                                </p>
        </div>
      </div>

      {/* ═══ Academic Years ═══ */}
      <section className="mb-8 sm:mb-12">
        <div className="flex items-end justify-between mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1">
              <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
              <h2 className={`text-lg sm:text-2xl font-black tracking-tight ${titleCls}`}>
                {t('academic_years')}
                                            </h2>
            </div>
            <p className={`text-[10px] sm:text-xs ms-3 sm:ms-4 font-semibold ${mutedCls}`}>
              {t('select_your_year_to_explore')}
                                      </p>
          </div>
          <span
            className={`text-[10px] sm:text-xs font-black px-2.5 sm:px-3 py-1 rounded-full backdrop-blur-md border ${
              isDark
                ? 'bg-slate-800/75 border-slate-700 text-slate-200'
                : 'bg-white/30 border-white/60 text-slate-900'
            }`}
          >
            {ACADEMIC_YEARS.length} Years
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {ACADEMIC_YEARS.map((s) => {
            const active = isItemActive(s.slug);
            return (
              <button
                key={s.slug}
                onClick={() => {
                  if (active) {
                    onSelectYear(s.slug);
                  } else if (onShowToast) {
                    onShowToast(`Content for "${s.name}" is coming soon!`, 'info');
                  } else {
                    onSelectYear(s.slug);
                  }
                }}
                className={`group relative overflow-hidden flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border text-start transition-all duration-300 ${
                  active
                    ? 'border-white/35 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98] cursor-pointer'
                    : 'border-slate-800/80 opacity-80 cursor-not-allowed'
                }`}
              >
                {/* الخلفية المصورة: ساطعة وبدون أي ثيم أو تعتيم للبانل النشط، ومظلمة للبانل الخامل */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={s.image}
                    alt={s.name}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      active
                        ? 'opacity-100 group-hover:scale-110'
                        : 'opacity-60 brightness-[0.38] saturate-[0.3] grayscale-[35%]'
                    }`}
                  />
                  {!active && <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[1px]" />}
                </div>

                <div
                  className={`relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 border backdrop-blur-md transition-transform duration-300 ${
                    active
                      ? `group-hover:scale-110 ${s.color}`
                      : 'bg-slate-900/80 border-slate-700/70 text-slate-400'
                  }`}
                >
                  <s.icon size={26} strokeWidth={1.5} className={active ? '!text-white' : '!text-slate-400'} />
                </div>

                <div className="relative z-10 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      style={{
                        color: active ? '#ffffff' : '#cbd5e1',
                        textShadow: active ? '0 2px 10px rgba(0,0,0,0.85)' : 'none',
                      }}
                      className={`text-sm sm:text-base font-black tracking-tight mb-0.5 truncate ${
                        active ? '!text-white' : '!text-slate-300'
                      }`}
                    >
                      {s.name}
                    </h3>
                  </div>
                  {active ? (
                    <p
                      style={{ color: '#f8fafc', textShadow: '0 1px 8px rgba(0,0,0,0.85)' }}
                      className="text-[10px] sm:text-[11px] font-bold !text-slate-100"
                    >
                      {s.badge}
                    </p>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900/90 text-amber-300 border border-amber-500/30 mt-0.5">
                      <Lock size={10} /> {t('coming_soon')}
                                                        </span>
                  )}
                </div>

                {active ? (
                  <ChevronRight
                    size={16}
                    style={{ filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.85))' }}
                    className="relative z-10 shrink-0 transition-all duration-300 group-hover:translate-x-1 !text-white"
                  />
                ) : (
                  <Lock size={15} className="relative z-10 shrink-0 !text-slate-400" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ═══ Board Exams ═══ */}
      <section className="mb-8 sm:mb-12">
        <div className="flex items-end justify-between mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1">
              <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-rose-400 to-pink-500 rounded-full" />
              <h2 className={`text-lg sm:text-2xl font-black tracking-tight ${titleCls}`}>
                {t('board_exams')}
                                            </h2>
            </div>
            <p className={`text-[10px] sm:text-xs ms-3 sm:ms-4 font-semibold ${mutedCls}`}>
              {t('specialized_preparation_for_postgraduate')}
                                      </p>
          </div>
          <span
            className={`text-[10px] sm:text-xs font-black px-2.5 sm:px-3 py-1 rounded-full backdrop-blur-md border ${
              isDark
                ? 'bg-slate-800/75 border-slate-700 text-slate-200'
                : 'bg-white/30 border-white/60 text-slate-900'
            }`}
          >
            {BOARD_EXAMS.length} Exams
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {BOARD_EXAMS.map((s) => {
            const active = isItemActive(s.slug);
            return (
              <button
                key={s.slug}
                onClick={() => {
                  if (active) {
                    onSelectBoard(s.slug);
                  } else if (onShowToast) {
                    onShowToast(`Content for "${s.name}" is coming soon!`, 'info');
                  } else {
                    onSelectBoard(s.slug);
                  }
                }}
                className={`group relative overflow-hidden flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border text-start transition-all duration-300 ${
                  active
                    ? 'border-white/35 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98] cursor-pointer'
                    : 'border-slate-800/80 opacity-80 cursor-not-allowed'
                }`}
              >
                {/* الخلفية المصورة: ساطعة للبانل النشط، ومظلمة للبانل الخامل */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={s.image}
                    alt={s.name}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      active
                        ? 'opacity-100 group-hover:scale-110'
                        : 'opacity-60 brightness-[0.38] saturate-[0.3] grayscale-[35%]'
                    }`}
                  />
                  {!active && <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[1px]" />}
                </div>

                <div
                  className={`relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 border backdrop-blur-md transition-transform duration-300 ${
                    active
                      ? `group-hover:scale-110 ${s.color}`
                      : 'bg-slate-900/80 border-slate-700/70 text-slate-400'
                  }`}
                >
                  <s.icon size={26} strokeWidth={1.5} className={active ? '!text-white' : '!text-slate-400'} />
                </div>

                <div className="relative z-10 flex-1 min-w-0">
                  <h3
                    style={{
                      color: active ? '#ffffff' : '#cbd5e1',
                      textShadow: active ? '0 2px 10px rgba(0,0,0,0.85)' : 'none',
                    }}
                    className={`text-sm sm:text-base font-black tracking-tight mb-0.5 truncate ${
                      active ? '!text-white' : '!text-slate-300'
                    }`}
                  >
                    {s.name}
                  </h3>
                  {active ? (
                    <p
                      style={{ color: '#f8fafc', textShadow: '0 1px 8px rgba(0,0,0,0.85)' }}
                      className="text-[10px] sm:text-[11px] font-bold !text-slate-100"
                    >
                      {s.badge}
                    </p>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900/90 text-amber-300 border border-amber-500/30 mt-0.5">
                      <Lock size={10} /> {t('coming_soon')}
                                                        </span>
                  )}
                </div>

                {active ? (
                  <ChevronRight
                    size={16}
                    style={{ filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.85))' }}
                    className="relative z-10 shrink-0 transition-all duration-300 group-hover:translate-x-1 !text-white"
                  />
                ) : (
                  <Lock size={15} className="relative z-10 shrink-0 !text-slate-400" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      <div
        className={`pt-6 sm:pt-8 border-t text-center ${
          isDark ? 'border-slate-800/70' : 'border-white/40'
        }`}
      >
        <p className={`text-[10px] sm:text-[11px] font-bold ${mutedCls}`}>
          {t('2026_code_blue_bank_all')}
                          </p>
      </div>
    </div>
  );
}