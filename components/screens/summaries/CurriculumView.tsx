import { Activity, HeartPulse, Brain, Dna, Microscope, BookOpen, Lock } from 'lucide-react';
import type { Category } from './data';
import { useTranslations } from "@/stores/languageStore";

const MAPPED_PHARMA = new Set([
  'general', 'ans', 'eye', 'sk ms relaxant', 'autacoids',
  'diuretics', 'cvs', 'anti anginal drugs', 'blood', 'git', 'respiratory',
]);

const MAPPED_PATHO = new Set([
  'cell injury', 'accumulation', 'inflammation', 'repair', 'neoplasia',
  'circulatory', 'tuberculosis', 'infections', 'bacterial', 'viral - fungal',
  'parasitic', 'bilharziasis', 'cvs',
]);

const MAPPED_GENERAL = new Set([
  'blood', 'git', 'git metabolism', 'renal', 'cardio', 'vascular',
  'endocrine', 'male gen.', 'male gen', 'male genital',
  'female gen.', 'female gen', 'female genital', 'respiratory',
  'lymphatic', 'cytogenetics', 'early patient encounter (family medicine)',
  'early patient encounter', 'patient encounter (family medicine)',
  'patient encounter', 'cartilage', 'upper limb', 'general embryology', 'basis',
]);

function isTopicOpen(topicName: string, subjectName?: string, courseCategories?: Category[]): boolean {
  const t = topicName.toLowerCase().trim();
  const s = (subjectName || '').toLowerCase().trim();

  if (s.includes('pharmacology')) return MAPPED_PHARMA.has(t);
  if (s.includes('pathology') || s.includes('patho')) return MAPPED_PATHO.has(t);
  if (MAPPED_GENERAL.has(t)) return true;

  if (courseCategories && courseCategories.length > 0) {
    const matched = courseCategories.some(
      (c) =>
        c.name_en.toLowerCase() === t ||
        c.name_en.toLowerCase().startsWith(t) ||
        c.name_en.toLowerCase().endsWith(t)
    );
    if (matched) return true;
  }
  return false;
}

export default function CurriculumView({
  data,
  isDark,
  onTopicClick,
  courseCategories,
}: {
  data: any[];
  isDark: boolean;
  onTopicClick: (name: string, subjectName?: string) => void;
  courseCategories?: Category[];
}) {
    const t = useTranslations('components_screens_summaries_CurriculumView');
  const activeCardCls = isDark
    ? 'bg-slate-900/65 border-slate-800 backdrop-blur-xl'
    : 'bg-white/25 border-white/55 backdrop-blur-xl shadow-[0_14px_34px_-16px_rgba(14,116,144,0.16)]';

  const inactiveCardCls = isDark
    ? 'bg-slate-950/85 border-slate-800/50 opacity-70'
    : 'bg-slate-900/42 border-slate-600/35 opacity-80 backdrop-blur-md';

  const titleCls = isDark ? 'text-white' : 'text-slate-900';

  return (
    <div className="space-y-5 sm:space-y-6">
      {data.map((mod, idx) => {
        const modHasAnyOpen = mod.subjects.some((sub: any) =>
          sub.topics.length > 0
            ? sub.topics.some((tp: string) => isTopicOpen(tp, sub.name, courseCategories))
            : isTopicOpen(sub.name, sub.name, courseCategories)
        );

        return (
          <div
            key={idx}
            className={`rounded-2xl border overflow-hidden transition-all ${
              modHasAnyOpen ? activeCardCls : inactiveCardCls
            }`}
          >
            <div
              className={`px-3 sm:px-4 py-2.5 sm:py-3 border-b flex items-center justify-between ${
                modHasAnyOpen
                  ? isDark
                    ? 'bg-sky-950/55 border-slate-700/80'
                    : 'bg-sky-900/75 border-white/40 backdrop-blur-md'
                  : 'bg-slate-950/80 border-slate-800/60'
              }`}
            >
              <h3 className="text-white font-black text-sm sm:text-base">{mod.code}</h3>
              {!modHasAnyOpen && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 border border-amber-500/30">
                  <Lock size={10} /> {t('coming_soon')}
                                            </span>
              )}
            </div>

            <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {mod.subjects.map((sub: any, sIdx: number) => {
                const subHasOpen =
                  sub.topics.length > 0
                    ? sub.topics.some((tp: string) => isTopicOpen(tp, sub.name, courseCategories))
                    : isTopicOpen(sub.name, sub.name, courseCategories);

                return (
                  <div
                    key={sIdx}
                    className={`flex flex-col gap-2 p-3 rounded-xl border transition-all duration-200 ${
                      subHasOpen
                        ? isDark
                          ? 'bg-slate-800/35 border-slate-700/50'
                          : 'bg-white/28 border-white/50 backdrop-blur-md'
                        : isDark
                          ? 'bg-slate-950/75 border-slate-800/50 opacity-65'
                          : 'bg-slate-900/35 border-slate-600/30 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
                          subHasOpen
                            ? isDark
                              ? 'bg-slate-800 text-emerald-400'
                              : 'bg-white/60 text-emerald-700 shadow-xs'
                            : 'bg-slate-900/80 text-slate-400'
                        }`}
                      >
                        {sub.name.includes('Anatomy') ? (
                          <Activity size={18} />
                        ) : sub.name.includes('Histology') ? (
                          <Microscope size={18} />
                        ) : sub.name.includes('Physiology') ? (
                          <HeartPulse size={18} />
                        ) : sub.name.includes('Biochemistry') ? (
                          <Dna size={18} />
                        ) : sub.name.includes('Pathology') ? (
                          <Brain size={18} />
                        ) : (
                          <BookOpen size={18} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                        <h4
                          className={`text-xs sm:text-sm font-black ${
                            subHasOpen ? titleCls : isDark ? 'text-slate-400' : 'text-slate-200'
                          }`}
                        >
                          {sub.name}
                        </h4>
                        {!subHasOpen && <Lock size={12} className="text-slate-400 shrink-0" />}
                      </div>
                    </div>

                    {sub.topics.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 ps-12 sm:ps-13">
                        {sub.topics.map((topic: string, tIdx: number) => {
                          const open = isTopicOpen(topic, sub.name, courseCategories);
                          return (
                            <button
                              key={tIdx}
                              onClick={() => onTopicClick(topic, sub.name)}
                              className={`text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-md transition-all inline-flex items-center gap-1 ${
                                open
                                  ? isDark
                                    ? 'bg-slate-800 text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-400 border border-slate-700 hover:scale-105 active:scale-95 cursor-pointer'
                                  : 'bg-white/55 text-slate-900 hover:bg-emerald-500/20 hover:text-emerald-900 border border-white/70 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs'
                                  : isDark
                                    ? 'bg-slate-950/90 text-slate-500 border border-slate-800/70 opacity-65 cursor-not-allowed'
                                    : 'bg-slate-900/45 text-slate-200 border border-slate-600/40 opacity-75 cursor-not-allowed'
                              }`}
                            >
                              {!open && <Lock size={9} className="opacity-75" />}
                              {topic}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <button
                        onClick={() => onTopicClick(sub.name, sub.name)}
                        className={`ms-12 sm:ms-13 text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded-md transition-all inline-flex items-center gap-1.5 w-fit ${
                          subHasOpen
                            ? isDark
                              ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 hover:scale-105 cursor-pointer'
                              : 'bg-emerald-500/20 text-emerald-900 hover:bg-emerald-500/30 border border-emerald-600/30 hover:scale-105 cursor-pointer'
                            : isDark
                              ? 'bg-slate-950/90 text-slate-500 border border-slate-800/70 opacity-65 cursor-not-allowed'
                              : 'bg-slate-900/45 text-slate-200 border border-slate-600/40 opacity-75 cursor-not-allowed'
                        }`}
                      >
                        {subHasOpen ? <BookOpen size={11} /> : <Lock size={11} />}
                        {subHasOpen ? t('open_content') : t('coming_soon')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}