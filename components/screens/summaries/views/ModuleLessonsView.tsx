'use client';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  BookOpen,
  LucideIcon,
  Ear,
  Wind,
  Mic2,
  Heart,
  Brain,
  Stethoscope,
  Baby,
  Activity,
  Layers,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { useTranslations } from "@/stores/languageStore";

/* ────────────────────────────────────────────────────────────── */
/*  Icons                                                          */
/* ────────────────────────────────────────────────────────────── */
const ICON_POOL: LucideIcon[] = [
  Ear, Wind, Mic2, Heart, Brain, Stethoscope, Baby, Activity, Layers, BookOpen,
];

/* ────────────────────────────────────────────────────────────── */
/*  Colors                                                         */
/* ────────────────────────────────────────────────────────────── */
const COLORS = [
  { accent: '#38bdf8', soft: 'rgba(56,189,248,0.18)',  subSoft: 'rgba(56,189,248,0.10)', tint: 'rgba(56,189,248,0.06)', glow: 'rgba(56,189,248,0.35)' },
  { accent: '#a78bfa', soft: 'rgba(167,139,250,0.18)', subSoft: 'rgba(167,139,250,0.10)', tint: 'rgba(167,139,250,0.06)', glow: 'rgba(167,139,250,0.35)' },
  { accent: '#fbbf24', soft: 'rgba(251,191,36,0.18)',  subSoft: 'rgba(251,191,36,0.10)',  tint: 'rgba(251,191,36,0.06)',  glow: 'rgba(251,191,36,0.35)' },
  { accent: '#34d399', soft: 'rgba(52,211,153,0.18)',  subSoft: 'rgba(52,211,153,0.10)',  tint: 'rgba(52,211,153,0.06)',  glow: 'rgba(52,211,153,0.35)' },
  { accent: '#f472b6', soft: 'rgba(244,114,182,0.18)', subSoft: 'rgba(244,114,182,0.10)', tint: 'rgba(244,114,182,0.06)', glow: 'rgba(244,114,182,0.35)' },
  { accent: '#fb923c', soft: 'rgba(251,146,60,0.18)',  subSoft: 'rgba(251,146,60,0.10)',  tint: 'rgba(251,146,60,0.06)',  glow: 'rgba(251,146,60,0.35)' },
];

/* ────────────────────────────────────────────────────────────── */
/*  Types                                                          */
/* ────────────────────────────────────────────────────────────── */
type Lesson = string | { name: string; slug?: string; page?: number | null };
type Group  = { name: string; lessons: Lesson[] };
type SubGroup = { name: string; lessons: Lesson[]; startIdx: number };

type Props = {
  isDark: boolean;
  pickedModule: any;
  summariesTopic?: string | null;
  onBack: () => void;
  onSelectLesson: (lessonName: string) => void;
};

/* ────────────────────────────────────────────────────────────── */
/*  Helpers                                                        */
/* ────────────────────────────────────────────────────────────── */
const lessonName = (l: Lesson): string =>
  typeof l === 'string' ? l : l?.name ?? '';

function autoSplitGroup(group: Group): SubGroup[] | null {
  const name = group.name.toLowerCase();

  /* CASE 1: General Microbiology & Immunology */
  if (name.includes('general microbiology') && name.includes('immunology')) {
    const isImmuno = (s: string) =>
      /immune|immunity|antigen|t-?cell|cytokines|humoral|complement|tumour|hypersensitivity|transplantation|tolerance|autoimmunity|immunodefic/i.test(s);
    let split = group.lessons.findIndex((l, i) => i >= 5 && isImmuno(lessonName(l)));
    if (split < 5) split = 10;
    return [
      { name: 'General Microbiology', startIdx: 0,     lessons: group.lessons.slice(0, split) },
      { name: 'Immunology',           startIdx: split, lessons: group.lessons.slice(split) },
    ];
  }

  /* CASE 2: Bacteriology & Mycology */
  if (name.includes('bacteriology') && name.includes('mycology')) {
    let split = group.lessons.findIndex(l => /enterobacteriaceae/i.test(lessonName(l)));
    if (split < 5) split = Math.ceil(group.lessons.length / 2);
    return [
      { name: 'General & Gram-Positive Bacteriology', startIdx: 0,     lessons: group.lessons.slice(0, split) },
      { name: 'Gram-Negative, Atypical & Mycology',   startIdx: split, lessons: group.lessons.slice(split) },
    ];
  }

  /* CASE 3: Virology & Infectious Diseases */
  if (name.includes('virology') && name.includes('infectious')) {
    let split = group.lessons.findIndex(l => /herpesvirus/i.test(lessonName(l)));
    if (split < 5) split = Math.ceil(group.lessons.length / 2);
    return [
      { name: 'General & RNA Viruses', startIdx: 0,     lessons: group.lessons.slice(0, split) },
      { name: 'DNA Viruses & Infectious Diseases', startIdx: split, lessons: group.lessons.slice(split) },
    ];
  }

  /* CASE 4: Nose & Paranasal Sinuses */
  const isNose = name.includes('nose') && name.includes('paranasal');
  if (isNose && group.lessons.length >= 10) {
    const isSinus = (s: string) => /sinusitis|rhinoscleroma|fungal/i.test(s);
    let split = group.lessons.findIndex((l, i) => i >= 10 && isSinus(lessonName(l)));
    if (split === -1) split = Math.ceil(group.lessons.length / 2);
    return [
      { name: 'Nose',              startIdx: 0,     lessons: group.lessons.slice(0, split) },
      { name: 'Paranasal Sinuses', startIdx: split, lessons: group.lessons.slice(split) },
    ];
  }

  /* CASE 5: Pharynx + Larynx + Esophagus */
  const isPLT =
    (name.includes('pharynx') && name.includes('larynx')) ||
    (name.includes('larynx') && name.includes('esophagus'));

  if (isPLT && group.lessons.length >= 15) {
    const isLarynx    = (s: string) => /larynx|laryng|stridor|vocal|tracheo|phoniatr|foreign body|laryngofiss/i.test(s);
    const isEsophagus = (s: string) => /esophag|dysphagia|achalasia/i.test(s);
    let firstLx: number | null = null;
    let firstEs: number | null = null;
    group.lessons.forEach((l, i) => {
      const t = lessonName(l);
      if (firstLx === null && isLarynx(t)) firstLx = i;
      if (firstEs === null && isEsophagus(t) && (firstLx === null || i > firstLx)) firstEs = i;
    });
    if (firstLx === null || firstLx === 0) return null;

    const out: SubGroup[] = [];
    out.push({ name: 'Pharynx', startIdx: 0, lessons: group.lessons.slice(0, firstLx) });
    if (firstEs !== null && firstEs > firstLx) {
      out.push({ name: 'Larynx', startIdx: firstLx, lessons: group.lessons.slice(firstLx, firstEs) });
      out.push({ name: 'Esophagus', startIdx: firstEs, lessons: group.lessons.slice(firstEs) });
    } else {
      out.push({ name: 'Larynx', startIdx: firstLx, lessons: group.lessons.slice(firstLx) });
    }
    return out;
  }

  return null;
}

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                      */
/* ────────────────────────────────────────────────────────────── */
export default function ModuleLessonsView({
  isDark,
  pickedModule,
  summariesTopic,
  onBack,
  onSelectLesson,
}: Props) {
    const t = useTranslations('components_screens_summaries_views_ModuleLessonsView');
  const data = useMemo(() => {
    const raw = pickedModule?.content_json ?? pickedModule?.content ?? pickedModule;
    const groups: Group[] = (() => {
      if (!raw) return [];
      if (typeof raw === 'string') {
        try { return JSON.parse(raw)?.groups ?? []; } catch { return []; }
      }
      if (raw?.groups) return raw.groups;
      if (Array.isArray(raw?.lessons)) return [{ name: 'Lessons', lessons: raw.lessons }];
      return [];
    })();
    const title = pickedModule?.subsection ?? pickedModule?.title ?? 'Module';
    const totalLessons = groups.reduce((s, g) => s + (g.lessons?.length ?? 0), 0);
    return { groups, title, totalLessons };
  }, [pickedModule]);

  const { groups, title, totalLessons } = data;

  const [openSub, setOpenSub] = useState<string | null>(null);
  const toggleSub = (key: string) => setOpenSub(prev => (prev === key ? null : key));

  const strong  = isDark ? 'text-slate-100' : 'text-slate-900';
  const muted   = isDark ? 'text-slate-400' : 'text-slate-500';

  const backBtn = `inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all duration-300 shadow-sm hover:scale-[1.03] active:scale-[0.97] ${
    isDark
      ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
  }`;

  if (!groups.length || totalLessons === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-4 py-2 sm:py-4">
        <BackButton onClick={onBack} label={t('back')} />
        <div className={`text-center py-16 px-4 rounded-3xl border-2 border-dashed ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <BookOpen size={40} className={`mx-auto mb-3 ${muted}`} />
          <p className={`text-sm font-bold ${strong}`}>
            Content for "{title}" is coming soon!
          </p>
        </div>
      </div>
    );
  }

  const colCount = groups.length;

  /* Each column's horizontal center (%).
     Match exactly what the grid produces:
     - 1 column  → 50%
     - 2 columns → 25%, 75%
     - 3 columns → 16.66%, 50%, 83.33%
     - 4+ columns (2 rows of 3) → treat first 3 */
const arrowTargets =
  colCount === 1 ? [50]
  : colCount === 2 ? [25, 75]
  : [16.666, 50, 83.333];

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in space-y-3 sm:space-y-5 py-2 sm:py-4">
      {/* Back */}
     <BackButton onClick={onBack} label={t('back')} />

      {/* ══ ROOT ══ */}
      <div className="flex flex-col items-center gap-1.5 sm:gap-2">
        <div
          className={`relative px-4 sm:px-8 py-3 sm:py-4 rounded-2xl border-2 text-center ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}
          style={{
            borderColor: isDark ? 'rgba(148,163,184,0.25)' : 'rgba(100,116,139,0.25)',
            boxShadow: isDark
              ? '0 0 60px rgba(56,189,248,0.08), inset 0 0 40px rgba(167,139,250,0.05)'
              : '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <h1
            className={`text-xs sm:text-base font-black tracking-wider uppercase ${strong}`}
            style={{ letterSpacing: '0.06em' }}
          >
            {title}
          </h1>
          <p className={`text-[9px] sm:text-[11px] font-bold mt-1 sm:mt-1.5 ${muted}`}>
            {colCount} branches · {totalLessons} lessons
          </p>
        </div>

        {/* Root down chevron */}
        <ChevronDown size={14} className={`sm:hidden ${muted}`} strokeWidth={2.5} />
        <ChevronDown size={18} className={`hidden sm:block ${muted}`} strokeWidth={2.5} />
      </div>

      {/* ══════════════════════════════════════════════════════════
          ARROWS — mind-map branches
          Each line goes straight down to its column.
          ══════════════════════════════════════════════════════════ */}
      {colCount > 1 && (
        <div className="relative h-12 sm:h-16 md:h-20 -mt-2">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            {arrowTargets.map((x, i) => {
              const c = COLORS[i % COLORS.length].accent;
              const isMiddle = Math.abs(x - 50) < 0.1;

              /* Middle branch → perfectly straight vertical stem
                 Side branches → straight drop from root, then smooth curve to target */
              const d = isMiddle
                ? `M 50 0 L 50 100`
                : `M 50 0 C 50 55, ${x} 45, ${x} 100`;

              return (
                <path
                  key={i}
                  d={d}
                  stroke={c}
                  strokeWidth="0.6"
                  strokeOpacity="0.7"
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Arrow tips — one per column, aligned to its center */}
          {arrowTargets.map((x, i) => (
            <div
              key={`tip-${i}`}
              className="absolute -bottom-1.5 -translate-x-1/2"
              style={{ left: `${x}%`, color: COLORS[i % COLORS.length].accent }}
            >
              <ChevronDown size={12} className="sm:hidden" strokeWidth={2.8} />
              <ChevronDown size={16} className="hidden sm:block" strokeWidth={2.8} />
            </div>
          ))}
        </div>
      )}

      {/* ══ COLUMNS — always 3 on all screens ══ */}
      <div className={`grid gap-1.5 sm:gap-3 md:gap-4 items-start ${
  colCount === 1 ? 'grid-cols-1'
  : colCount === 2 ? 'grid-cols-2'
  : 'grid-cols-3'
}`}>
        {groups.map((group, gi) => {
          const Icon = ICON_POOL[gi % ICON_POOL.length];
          const color = COLORS[gi % COLORS.length];
          const subGroups = autoSplitGroup(group);

          return (
            <div
              key={gi}
              className={`rounded-2xl sm:rounded-3xl border overflow-hidden transition-all ${
                isDark ? 'bg-slate-900/70' : 'bg-white'
              }`}
              style={{
                borderColor: color.accent,
                borderWidth: 2,
                boxShadow: `0 0 24px ${color.glow}, 0 4px 16px rgba(0,0,0,0.08)`,
                background: isDark
                  ? `linear-gradient(180deg, ${color.tint} 0%, rgba(15,23,42,0.4) 40%, rgba(15,23,42,0.2) 100%)`
                  : `linear-gradient(180deg, ${color.tint} 0%, #ffffff 40%)`,
              }}
            >
              {/* Colored top bar */}
              <div
                className="h-1 sm:h-1.5 w-full"
                style={{ background: `linear-gradient(90deg, ${color.accent}, transparent)` }}
              />

              <div className="p-2 sm:p-3 md:p-4">
                {/* ── Column header ── */}
                <div
                  className="flex items-center gap-1.5 sm:gap-3 mb-2 sm:mb-4 pb-1.5 sm:pb-3 border-b"
                  style={{
                    borderColor: isDark
                      ? 'rgba(148,163,184,0.15)'
                      : 'rgba(100,116,139,0.15)',
                  }}
                >
                  <div
                    className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl grid place-items-center shrink-0"
                    style={{
                      background: color.soft,
                      color: color.accent,
                      boxShadow: `0 0 12px ${color.glow}`,
                    }}
                  >
                    <Icon size={13} className="sm:hidden" strokeWidth={2.5} />
                    <Icon size={20} className="hidden sm:block" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="text-[10px] sm:text-sm font-black leading-tight"
                      style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
                    >
                      {group.name}
                    </h3>
                    <p className={`text-[8px] sm:text-[10px] font-bold ${muted}`}>
                      {group.lessons.length} lessons
                      {subGroups && ` · ${subGroups.length} parts`}
                    </p>
                  </div>
                </div>

                {/* ── Lessons: sub-accordion OR flat ── */}
                {subGroups ? (
                  <div className="space-y-1 sm:space-y-2">
                    {subGroups.map((sub, si) => {
                      const key = `${gi}-${si}`;
                      const isOpen = openSub === key;

                      return (
                        <div key={si} className="space-y-0">
                          {/* Sub-group BUTTON */}
                          <button
                            onClick={() => toggleSub(key)}
                            className={`w-full flex items-center gap-1 sm:gap-2.5 px-1.5 sm:px-3 py-1.5 sm:py-2.5 rounded-md sm:rounded-lg text-start transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                              isOpen ? 'shadow-md' : ''
                            }`}
                            style={{
                              background: isOpen
                                ? color.soft
                                : (isDark ? 'rgba(148,163,184,0.06)' : 'rgba(100,116,139,0.04)'),
                              borderLeft: `2px solid ${color.accent}`,
                            }}
                          >
                            <span
                              className="text-[8px] sm:text-[11px] font-black uppercase tracking-wide sm:tracking-wider flex-1 leading-tight"
                              style={{ color: color.accent }}
                            >
                              {sub.name}
                            </span>
                            <span className={`text-[8px] sm:text-[10px] font-bold shrink-0 ${muted}`}>
                              {sub.lessons.length}
                            </span>
                            <ChevronDown
                              size={10}
                              className={`shrink-0 sm:hidden transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                              style={{ color: color.accent }}
                            />
                            <ChevronDown
                              size={14}
                              className={`hidden sm:block shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                              style={{ color: color.accent }}
                            />
                          </button>

                          {/* Sub-lessons (collapsible) */}
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-out ${
                              isOpen
                                ? 'max-h-[3000px] opacity-100 mt-1 sm:mt-1.5'
                                : 'max-h-0 opacity-0 mt-0'
                            }`}
                          >
                            <ul className="space-y-0.5 sm:ps-1">
                              {sub.lessons.map((lesson, li) => {
                                const name = lessonName(lesson);
                                const page = typeof lesson === 'object' ? lesson?.page : null;
                                const num = sub.startIdx + li + 1;

                                return (
                                  <li key={li}>
                                    <button
                                      onClick={() => onSelectLesson(name)}
                                      className={`w-full flex items-start gap-1 sm:gap-2.5 p-1 sm:p-2 rounded-md sm:rounded-lg text-start transition-all group ${
                                        isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
                                      }`}
                                    >
                                      <span
                                        className="shrink-0 w-3.5 h-3.5 sm:w-5 sm:h-5 rounded sm:rounded-md grid place-items-center text-[7px] sm:text-[9px] font-black mt-0.5"
                                        style={{ background: color.soft, color: color.accent }}
                                      >
                                        {num}
                                      </span>
                                      <span
                                        className={`flex-1 text-[9px] sm:text-[12px] font-medium leading-tight sm:leading-snug ${
                                          isDark
                                            ? 'text-slate-300 group-hover:text-slate-100'
                                            : 'text-slate-700 group-hover:text-slate-900'
                                        }`}
                                      >
                                        {name}
                                      </span>
                                      {page != null && (
                                        <span className={`hidden sm:inline text-[10px] font-bold shrink-0 ${muted}`}>
                                          p.{page}
                                        </span>
                                      )}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <ul className="space-y-0.5 sm:space-y-1">
                    {group.lessons.map((lesson, li) => {
                      const name = lessonName(lesson);
                      const page = typeof lesson === 'object' ? lesson?.page : null;

                      return (
                        <li key={li}>
                          <button
                            onClick={() => onSelectLesson(name)}
                            className={`w-full flex items-start gap-1 sm:gap-2.5 p-1 sm:p-2.5 rounded-md sm:rounded-lg text-start transition-all group ${
                              isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className="shrink-0 w-3.5 h-3.5 sm:w-5 sm:h-5 rounded sm:rounded-md grid place-items-center text-[7px] sm:text-[9px] font-black mt-0.5"
                              style={{ background: color.soft, color: color.accent }}
                            >
                              {li + 1}
                            </span>
                            <span
                              className={`flex-1 text-[9px] sm:text-[12px] font-medium leading-tight sm:leading-snug ${
                                isDark
                                  ? 'text-slate-300 group-hover:text-slate-100'
                                  : 'text-slate-700 group-hover:text-slate-900'
                              }`}
                            >
                              {name}
                            </span>
                            {page != null && (
                              <span className={`hidden sm:inline text-[10px] font-bold shrink-0 ${muted}`}>
                                p.{page}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}