'use client';
import { Ear, Wind, Mic2, ChevronDown, LucideIcon } from 'lucide-react';

/* ──────────────────────────────────────────────────────────────── */
/*  Data                                                            */
/* ──────────────────────────────────────────────────────────────── */

type Column = {
  id: string;
  title: string;
  titleAr: string;
  Icon: LucideIcon;
  accent: string;       // hex color
  accentSoft: string;   // rgba
  lessons: string[];
};

const ROOT_TITLE = 'PHARYNX, LARYNX & ESOPHAGUS';

const COLUMNS: Column[] = [
  {
    id: 'pharynx',
    title: 'Pharynx',
    titleAr: 'البلعوم',
    Icon: Ear,
    accent: '#38bdf8',      // sky-400
    accentSoft: 'rgba(56,189,248,0.15)',
    lessons: [
      'Anatomy of the Pharynx',
      'Adenoids',
      'Nasopharyngeal Tumors',
      'Acute Tonsillitis',
      'Chronic Tonsillitis',
      'Tonsillectomy',
      'Diphtheria',
      "Vincent's Angina",
      'Scarlet Fever',
      'Infectious Mononucleosis',
      'Agranulocytosis & Leukemia',
      'Fungal Infections of the Pharynx',
      'Ulcers of the Pharynx',
      'Peritonsillar Abscess (Quinsy)',
      'Parapharyngeal Abscess',
      'Retropharyngeal Abscess',
      "Ludwig's Angina",
      'Pharyngeal Pouch',
      'Plummer-Vinson Syndrome',
      'Hypopharyngeal Carcinoma',
    ],
  },
  {
    id: 'larynx',
    title: 'Larynx',
    titleAr: 'الحنجرة',
    Icon: Wind,
    accent: '#a78bfa',      // violet-400
    accentSoft: 'rgba(167,139,250,0.15)',
    lessons: [
      'Surgical Anatomy of the Larynx',
      'Functions of the Larynx',
      'History, Examination & Investigations',
      'Stridor',
      'Congenital Diseases of the Larynx',
      'Trauma to the Larynx',
      'Inflammations of the Larynx',
      'Laryngeal Stenosis',
      'Vocal Cord Paralysis',
      'Tumors of the Larynx',
      'Laryngofissure',
      'Tracheostomy',
      'Foreign Body Inhalation',
      'Phoniatrics',
    ],
  },
  {
    id: 'esophagus',
    title: 'Esophagus',
    titleAr: 'المرئ',
    Icon: Mic2,
    accent: '#fbbf24',      // amber-400
    accentSoft: 'rgba(251,191,36,0.15)',
    lessons: [
      'Anatomy & Diagnosis of the Esophagus',
      'Dysphagia',
      'Congenital Diseases of the Esophagus',
      'Trauma to the Esophagus (FB & Rupture)',
      'Corrosive Esophagitis & Stricture',
      'Inflammation of the Esophagus',
      'Neuromuscular Disorders (Achalasia)',
      'Neoplasms of the Esophagus',
    ],
  },
];

/* ──────────────────────────────────────────────────────────────── */
/*  Component                                                       */
/* ──────────────────────────────────────────────────────────────── */

type Props = {
  isDark: boolean;
  onLessonClick?: (columnId: string, lesson: string, idx: number) => void;
};

export default function MindMapPLT({ isDark, onLessonClick }: Props) {
  const strong   = isDark ? 'text-slate-100' : 'text-slate-900';
  const muted    = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardBg   = isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200';
  const arrowClr = isDark ? 'rgba(148,163,184,0.35)' : 'rgba(100,116,139,0.35)';

  const totalLessons = COLUMNS.reduce((s, c) => s + c.lessons.length, 0);

  return (
    <div className="w-full animate-fade-in space-y-6 py-4">
      {/* ═══════ ROOT NODE ═══════ */}
      <div className="flex flex-col items-center gap-3">
        <div
          className={`relative px-6 py-4 rounded-2xl border-2 text-center ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
          }`}
          style={{
            boxShadow: isDark
              ? '0 0 40px rgba(56,189,248,0.08), inset 0 0 40px rgba(167,139,250,0.04)'
              : '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <h2
            className={`text-sm sm:text-base font-black tracking-wider ${strong}`}
            style={{ letterSpacing: '0.05em' }}
          >
            {ROOT_TITLE}
          </h2>
          <p className={`text-[10px] sm:text-[11px] font-bold mt-1.5 ${muted}`}>
            3 branches · {totalLessons} lessons
          </p>
        </div>

        {/* Arrow down from root */}
        <ChevronDown size={20} className={muted} />
      </div>

      {/* ═══════ BRANCH ARROWS (desktop only) ═══════ */}
      <div className="hidden md:block relative h-16">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {/* Left curve (to Pharynx) */}
          <path
            d="M 50 0 C 50 40, 16 40, 16 100"
            stroke={arrowClr}
            strokeWidth="0.4"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
          {/* Middle straight (to Larynx) */}
          <line
            x1="50" y1="0" x2="50" y2="100"
            stroke={arrowClr}
            strokeWidth="0.4"
            vectorEffect="non-scaling-stroke"
          />
          {/* Right curve (to Esophagus) */}
          <path
            d="M 50 0 C 50 40, 84 40, 84 100"
            stroke={arrowClr}
            strokeWidth="0.4"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Arrow tips */}
        <div className="absolute top-full start-[16%]  -translate-x-1/2 -translate-y-1">
          <ChevronDown size={16} style={{ color: COLUMNS[0].accent }} />
        </div>
        <div className="absolute top-full start-1/2  -translate-x-1/2 -translate-y-1">
          <ChevronDown size={16} style={{ color: COLUMNS[1].accent }} />
        </div>
        <div className="absolute top-full start-[84%] -translate-x-1/2 -translate-y-1">
          <ChevronDown size={16} style={{ color: COLUMNS[2].accent }} />
        </div>
      </div>

      {/* ═══════ 3 COLUMNS ═══════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const Icon = col.Icon;
          return (
            <div
              key={col.id}
              className={`rounded-3xl border p-4 ${cardBg}`}
              style={{ borderTopColor: col.accent, borderTopWidth: 2 }}
            >
              {/* Column header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b"
                   style={{ borderColor: isDark ? 'rgba(148,163,184,0.15)' : 'rgba(100,116,139,0.15)' }}>
                <div
                  className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
                  style={{ background: col.accentSoft, color: col.accent }}
                >
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-sm font-black truncate ${strong}`}>{col.title}</h3>
                  <p className={`text-[10px] ${muted}`}>
                    {col.titleAr} · {col.lessons.length} lessons
                  </p>
                </div>
              </div>

              {/* Lessons list */}
              <ul className="space-y-1">
                {col.lessons.map((lesson, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => onLessonClick?.(col.id, lesson, idx)}
                      className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-start transition-all group ${
                        isDark
                          ? 'hover:bg-slate-800/60'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="shrink-0 w-5 h-5 rounded-md grid place-items-center text-[9px] font-black mt-0.5"
                        style={{ background: col.accentSoft, color: col.accent }}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className={`text-[12px] font-medium leading-snug ${
                          isDark ? 'text-slate-300 group-hover:text-slate-100' : 'text-slate-700 group-hover:text-slate-900'
                        }`}
                      >
                        {lesson}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}