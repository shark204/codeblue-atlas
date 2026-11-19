'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2, Circle, ChevronDown, ChevronLeft, ChevronRight,
  Layers, Loader2, FileText,
} from 'lucide-react';
import SmartContent from './smart/SmartContent';
import LessonVisuals from './smart/LessonVisuals';
import { splitContentByHeadings } from './smart/splitSections';
import type { Slide } from './useLessonSlides';
import { BackButton } from '@/components/ui/BackButton';
import { useTranslations, useTranslation } from '@/stores/languageStore';

type Block = { id: string; title: string; content: string | null };
type Step = { id: string; blockId: string; blockTitle: string; title: string; body: string };

type Props = {
  isDark: boolean;
  lessonName: string;
  blocks: Block[];
  loading: boolean;
  slides: Slide[];
  onBack: () => void;
};

function buildSteps(blocks: Block[]): Step[] {
  const steps: Step[] = [];
  for (const b of blocks) {
    const secs = splitContentByHeadings(b.content || '');
    if (!secs.length) {
      if (b.content?.trim()) steps.push({ id: `${b.id}::all`, blockId: b.id, blockTitle: b.title, title: b.title, body: b.content });
      continue;
    }
    for (const s of secs) {
      const title = secs.length === 1 && blocks.length > 1 ? b.title : s.title;
      steps.push({ id: `${b.id}::${s.id}`, blockId: b.id, blockTitle: b.title, title, body: s.body });
    }
  }
  return steps;
}

export default function LessonReader({ isDark, lessonName, blocks, loading, slides, onBack }: Props) {
  const t = useTranslations('components_screens_summaries_LessonReader');
  const { isRTL } = useTranslation();

  // 🔬 تشغيل سكربت تلوين المصطلحات الطبية والأرقام داخل محتوى الدرس فقط
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).StudyHighlighterConfig = { fallbackToBody: false };
    }
    const s = document.createElement('script');
    s.src = '/study-highlighter-auto.js';
    s.defer = true;
    document.body.appendChild(s);

    return () => {
      s.remove();
    };
  }, []);

  const steps = useMemo(() => buildSteps(blocks), [blocks]);
  const grouped = blocks.length > 1;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [outlineOpen, setOutlineOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const doneKey = `cb-steps-done:${lessonName}`;
  useEffect(() => {
    try { setDone(new Set(JSON.parse(localStorage.getItem(doneKey) || '[]'))); } catch { setDone(new Set()); }
  }, [doneKey]);
  const persist = (n: Set<string>) => { try { localStorage.setItem(doneKey, JSON.stringify([...n])); } catch {} };

  useEffect(() => {
    if (steps.length && !steps.some((s) => s.id === activeId)) setActiveId(steps[0].id);
  }, [steps, activeId]);

  const idx = steps.findIndex((s) => s.id === activeId);
  const step = idx >= 0 ? steps[idx] : null;
  const canPrev = idx > 0;
  const canNext = idx >= 0 && idx < steps.length - 1;

  const select = (id: string) => {
    setActiveId(id);
    setOutlineOpen(false);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const toggleDone = (id: string) =>
    setDone((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); persist(n); return n; });
  const goNext = () => {
    if (!step || !canNext) return;
    setDone((p) => { const n = new Set(p).add(step.id); persist(n); return n; });
    select(steps[idx + 1].id);
  };
  const goPrev = () => canPrev && select(steps[idx - 1].id);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, [contenteditable], [role="dialog"]')) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const doneCount = steps.filter((s) => done.has(s.id)).length;
  const pct = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;

  const card = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const title = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  const groups = useMemo(() => {
    const map = new Map<string, { title: string; steps: Step[] }>();
    for (const s of steps) {
      if (!map.has(s.blockId)) map.set(s.blockId, { title: s.blockTitle, steps: [] });
      map.get(s.blockId)!.steps.push(s);
    }
    return [...map.values()];
  }, [steps]);

  const Outline = ({ compact }: { compact?: boolean }) => (
    <nav aria-label="Lesson outline" className="space-y-4">
      {groups.map((g, gi) => (
        <div key={gi}>
          {grouped && (
            <div className={`mb-2 flex items-center gap-2 rounded-lg border-s-4 px-2.5 py-2 ${
              isDark
                ? 'border-emerald-400 bg-emerald-500/10'
                : 'border-emerald-500 bg-emerald-50'
            }`}>
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                isDark ? 'bg-emerald-500/25 text-emerald-300' : 'bg-emerald-500 text-white'
              }`}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </span>
              <span dir="auto" className={`flex-1 text-[11px] font-black uppercase tracking-wider leading-tight ${
                isDark ? 'text-emerald-300' : 'text-emerald-700'
              }`}>
                {g.title}
              </span>
            </div>
          )}
          <ul className="space-y-1">
            {g.steps.map((s) => {
              const n = steps.indexOf(s) + 1;
              const active = s.id === activeId;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => select(s.id)}
                    aria-current={active ? 'step' : undefined}
                    className={`flex w-full items-start gap-2.5 rounded-xl border-2 px-2.5 py-2 text-start text-xs font-bold transition-colors ${
                      active
                        ? isDark
                          ? 'border-indigo-400/30 bg-indigo-500/[0.08] text-indigo-200'
                          : 'border-indigo-300/60 bg-indigo-50/60 text-indigo-700'
                        : isDark
                          ? 'border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-indigo-300'
                          : 'border-transparent text-slate-500 hover:bg-indigo-50/40 hover:text-indigo-600'
                    }`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-black ${
                      active
                        ? isDark ? 'bg-indigo-400/20 text-indigo-200' : 'bg-indigo-100 text-indigo-700'
                        : isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-500'
                    }`}>{n}</span>
                    <span dir="auto" className={`flex-1 leading-snug ${compact ? '' : 'line-clamp-2'}`}><bdi>{s.title}</bdi></span>
                    {done.has(s.id) && <CheckCircle2 size={14} className={`mt-0.5 shrink-0 ${active ? 'text-indigo-400' : 'text-emerald-500'}`} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div ref={topRef} className="mx-auto mt-2 w-full max-w-7xl scroll-mt-24 px-3 pb-20 sm:px-5 lg:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[290px_1fr] lg:gap-8">
        {/* ✅ السايد بار (يحتوي على زر الرجوع + اسم الدرس + شريط التقدم + فهرس العناصر) */}
        <aside className="hidden lg:block">
          <div className={`sticky top-[84px] flex max-h-[calc(100vh-104px)] flex-col rounded-2xl border-2 p-3.5 shadow-sm backdrop-blur-xl ${
            isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/85'
          }`}>
            <div className={`mb-3 border-b-2 border-dashed pb-3.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <BackButton onClick={onBack} label={t('back')} />
                <span dir="ltr" className={`rounded-lg px-2 py-0.5 text-[11px] font-black tabular-nums ${
                  isDark ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {doneCount}/{steps.length}
                </span>
              </div>
              <p dir="auto" className={`text-xs font-black leading-snug sm:text-sm ${title}`}>
                <bdi>{lessonName}</bdi>
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className={`h-1.5 flex-1 overflow-hidden rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span dir="ltr" className={`text-[10px] font-black tabular-nums ${muted}`}>{pct}%</span>
              </div>
            </div>
            <div className="custom-scrollbar flex-1 overflow-y-auto pe-1">
              <Outline />
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          {/* ✅ نسخة الموبايل من السايد بار (تظهر فقط على الشاشات الصغيرة) */}
          <div className={`overflow-hidden rounded-2xl border-2 lg:hidden ${card}`}>
            <div className={`flex items-center gap-2.5 border-b border-dashed px-3 py-2.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <BackButton onClick={onBack} label={t('back')} />
              <div className="min-w-0 flex-1">
                <p dir="auto" className={`truncate text-xs font-black ${title}`}><bdi>{lessonName}</bdi></p>
                <div className="mt-1 flex items-center gap-2">
                  <div className={`h-1.5 flex-1 overflow-hidden rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span dir="ltr" className={`text-[10px] font-black tabular-nums ${muted}`}>{doneCount}/{steps.length}</span>
                </div>
              </div>
            </div>
            {steps.length > 0 && (
              <>
                <button onClick={() => setOutlineOpen((o) => !o)} aria-expanded={outlineOpen} className="flex w-full items-center gap-3 px-4 py-2.5 text-start">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-500"><Layers size={14} /></span>
                  <span className="min-w-0 flex-1">
                    <span dir="ltr" className={`block text-xs font-black ${title}`}>{idx + 1} / {steps.length}</span>
                    <span dir="auto" className={`block truncate text-[11px] ${muted}`}><bdi>{step?.title}</bdi></span>
                  </span>
                  <ChevronDown size={16} className={`text-emerald-500 transition-transform ${outlineOpen ? '' : '-rotate-90'}`} />
                </button>
                {outlineOpen && <div className={`max-h-[60vh] overflow-y-auto border-t-2 border-dashed p-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}><Outline compact /></div>}
              </>
            )}
          </div>

          {loading ? (
            <div className="py-20 text-center"><Loader2 size={36} className="mx-auto animate-spin text-emerald-500" /></div>
          ) : !steps.length ? (
            <div className={`rounded-2xl border-2 border-dashed p-10 text-center ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
              <FileText size={40} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm font-bold">{t('no_content_yet_for_this')}</p>
            </div>
          ) : (
            <>

            <LessonVisuals slides={slides} activeSection={step?.title} isDark={isDark} />

            {step && (
              <article className={`rounded-2xl border-2 ${card}`}>
                <header className={`flex items-center gap-3 border-b-2 border-dashed px-5 py-4 sm:px-8 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div className="w-1.5 self-stretch rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
                  <div className="min-w-0 flex-1" dir="auto">
                    {grouped && <p className={`truncate text-[11px] font-bold ${muted}`}><bdi>{step.blockTitle}</bdi></p>}
                    <h2 className={`text-base font-black tracking-tight sm:text-lg ${title}`}><bdi>{step.title}</bdi></h2>
                  </div>
                  <button onClick={() => toggleDone(step.id)} aria-pressed={done.has(step.id)} aria-label={done.has(step.id) ? 'Mark as not read' : 'Mark as read'} className="shrink-0 transition hover:scale-110 active:scale-95">
                    {done.has(step.id) ? <CheckCircle2 size={22} className="text-emerald-500" /> : <Circle size={22} className={isDark ? 'text-slate-600 hover:text-emerald-500' : 'text-slate-300 hover:text-emerald-500'} />}
                  </button>
                </header>

                {/* ✅ عزل محتوى الدرس الطبي فقط بـ dir="ltr" للحفاظ على الأرقام وعلامات الترقيم بينما تتبع الأزرار والهيكل لغة الواجهة */}
                <div dir="ltr" className="lesson-body px-5 py-6 text-left sm:px-8 sm:py-8" data-study-highlight>
                  <SmartContent key={step.id} text={step.body} isDark={isDark} stepTitle={step.title} />
                </div>

                <footer className={`flex items-center justify-between gap-3 border-t-2 border-dashed px-5 py-4 sm:px-8 ${isDark ? 'border-slate-800 bg-slate-950/30' : 'border-slate-200 bg-slate-50/50'}`}>
                  <button onClick={goPrev} disabled={!canPrev} className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-xs font-bold sm:px-4 ${canPrev ? (isDark ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50') : 'cursor-not-allowed opacity-40 ' + (isDark ? 'border-slate-800 text-slate-600' : 'border-slate-200 text-slate-400')}`}>
                    <ChevronLeft size={14} className={isRTL ? 'rotate-180' : ''} /> {t('previous')}
                  </button>
                  <span dir="ltr" className={`text-[11px] font-black tabular-nums ${muted}`}>{idx + 1} / {steps.length}</span>
                  <button onClick={goNext} disabled={!canNext} className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-xs font-bold sm:px-4 ${canNext ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600' : 'cursor-not-allowed opacity-40 ' + (isDark ? 'border-slate-800 text-slate-600' : 'border-slate-200 text-slate-400')}`}>
                    {t('next')} <ChevronRight size={14} className={isRTL ? 'rotate-180' : ''} />
                  </button>
                </footer>
              </article>
            )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}