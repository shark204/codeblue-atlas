'use client';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Maximize2, X, Images } from 'lucide-react';
import type { Slide } from '../useLessonSlides';
import { useTranslations } from "@/stores/languageStore";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export default function LessonVisuals({
  slides, activeSection, isDark,
}: { slides: Slide[]; activeSection?: string; isDark: boolean }) {
    const t = useTranslations('components_screens_summaries_smart_LessonVisuals');
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(true);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (!activeSection) return;
    const target = norm(activeSection);
    const hit = slides.findIndex((s) => s.section && (norm(s.section).includes(target) || target.includes(norm(s.section))));
    if (hit >= 0) setIdx(hit);
  }, [activeSection, slides]);

  useEffect(() => {
    try { setOpen(localStorage.getItem('cb-visuals-open') !== '0'); } catch {}
  }, []);
  const toggleOpen = () => setOpen((o) => { try { localStorage.setItem('cb-visuals-open', o ? '0' : '1'); } catch {} return !o; });

  const go = (d: number) => setIdx((i) => (i + d + slides.length) % slides.length);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(false);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [zoom, slides.length]);

  const cur = slides[idx];
  const matched = useMemo(() => (activeSection ? slides.filter((s) => s.section && norm(activeSection).includes(norm(s.section))).length : 0), [slides, activeSection]);
  if (!slides.length || !cur) return null;

  const frame = isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <section aria-label={t('visual_summary')} className={`mb-6 overflow-hidden rounded-2xl border-2 ${frame}`}>
      <button onClick={toggleOpen} aria-expanded={open} className={`flex w-full items-center gap-2.5 px-4 py-3 text-start ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500"><Images size={15} /></span>
        <span className={`flex-1 text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('visual_summary')}</span>
        <span className={`text-xs font-bold tabular-nums ${muted}`}>{idx + 1} / {slides.length}</span>
        <ChevronDown size={16} className={`text-emerald-500 transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>

      {open && (
        <div className="px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="group relative overflow-hidden rounded-xl bg-slate-950/5 ring-1 ring-black/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={cur.src}
              src={cur.src}
              alt={cur.caption}
              width={cur.w}
              height={cur.h}
              loading="lazy"
              onClick={() => setZoom(true)}
              className="aspect-video w-full cursor-zoom-in object-contain"
            />
            <button onClick={() => go(-1)} aria-label={t('previous_slide')} className="absolute start-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white opacity-90 hover:bg-black/75 sm:opacity-0 sm:group-hover:opacity-100"><ChevronLeft size={18} /></button>
            <button onClick={() => go(1)} aria-label={t('next_slide')} className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white opacity-90 hover:bg-black/75 sm:opacity-0 sm:group-hover:opacity-100"><ChevronRight size={18} /></button>
            <button onClick={() => setZoom(true)} aria-label={t('zoom')} className="absolute end-2 top-2 rounded-lg bg-black/55 p-1.5 text-white hover:bg-black/75"><Maximize2 size={14} /></button>
          </div>

          <p className={`mt-2 text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {cur.caption}
            {matched > 0 && cur.section && <span className="ms-2 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-500">{t('matches_this_section')}</span>}
          </p>

          <div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={t('slides')}>
            {slides.map((s, i) => (
              <button
                key={s.n}
                role="tab"
                aria-selected={i === idx}
                aria-label={`Slide ${s.n}: ${s.caption}`}
                onClick={() => setIdx(i)}
                className={`relative h-12 w-[86px] shrink-0 overflow-hidden rounded-lg border-2 transition ${i === idx ? 'border-emerald-500' : isDark ? 'border-slate-700 opacity-70 hover:opacity-100' : 'border-slate-200 opacity-70 hover:opacity-100'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {zoom && (
        <div role="dialog" aria-modal="true" aria-label={cur.caption} className="fixed inset-0 z-[100] flex flex-col bg-black/92 p-3 sm:p-6" onClick={() => setZoom(false)}>
          <div className="mb-2 flex items-center justify-between text-white" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-bold">{cur.caption}</p>
            <button onClick={() => setZoom(false)} aria-label={t('close')} className="rounded-full bg-white/10 p-2 hover:bg-white/20"><X size={18} /></button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cur.src} alt={cur.caption} className="max-h-full max-w-full rounded-lg object-contain" />
            <button onClick={() => go(-1)} aria-label={t('previous')} className="absolute start-0 rounded-full bg-white/10 p-2 text-white hover:bg-white/25"><ChevronLeft size={22} /></button>
            <button onClick={() => go(1)} aria-label={t('next')} className="absolute end-0 rounded-full bg-white/10 p-2 text-white hover:bg-white/25"><ChevronRight size={22} /></button>
          </div>
        </div>
      )}
    </section>
  );
}