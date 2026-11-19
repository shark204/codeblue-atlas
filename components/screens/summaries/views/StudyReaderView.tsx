import { useState, useEffect, useMemo } from 'react';
import {
  Loader2, ChevronRight, ChevronDown, ChevronLeft,
  CheckCircle2, Circle, FileText, Layers,
} from 'lucide-react';
import RichText from '../RichText';
import { markHeadings, splitContentByHeadings } from '../utils';
import { BackButton } from '@/components/ui/BackButton';
import { useTranslations, useTranslation } from '@/stores/languageStore';

type Props = {
  isDark: boolean;
  pickedLessonName: string;
  pickedModule: any;
  studyBlocks: any[];
  studyLoading: boolean;
  doneBlocks: Set<string>;
  onToggleBlockDone: (id: string) => void;
  onBack: () => void;
};

export default function StudyReaderView({
  isDark, pickedLessonName, pickedModule, studyBlocks, studyLoading,
  doneBlocks, onToggleBlockDone, onBack,
}: Props) {
  const t = useTranslations('components_screens_summaries_views_StudyReaderView');
  const { isRTL } = useTranslation();
  const [showMobileSections, setShowMobileSections] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  const cardCls = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const titleCls = isDark ? 'text-white' : 'text-slate-900';
  const mutedCls = isDark ? 'text-slate-400' : 'text-slate-500';

  const doneCount = studyBlocks.filter(b => doneBlocks.has(b.id)).length;
  const pct = studyBlocks.length ? Math.round((doneCount / studyBlocks.length) * 100) : 0;

  const activeBlock = useMemo(
    () => studyBlocks.find(b => b.id === activeBlockId),
    [studyBlocks, activeBlockId]
  );

  const contentSections = useMemo(() => {
    if (!activeBlock?.content) return [];
    return splitContentByHeadings(activeBlock.content);
  }, [activeBlock?.content]);

  const isSingleBlockMode = studyBlocks.length === 1;
  const isMultiBlockMode = studyBlocks.length > 1;

  useEffect(() => {
    if (studyBlocks.length === 1 && !activeBlockId) {
      setActiveBlockId(studyBlocks[0].id);
    }
  }, [studyBlocks, activeBlockId]);

  useEffect(() => {
    if (isSingleBlockMode && contentSections.length > 0) {
      setActiveHeadingId(contentSections[0].id);
    } else {
      setActiveHeadingId(null);
    }
  }, [activeBlockId, contentSections, isSingleBlockMode]);

  const activeContentSection = useMemo(() => {
    if (!isSingleBlockMode) return null;
    if (!activeHeadingId) return contentSections[0] || null;
    return contentSections.find(s => s.id === activeHeadingId) || contentSections[0] || null;
  }, [isSingleBlockMode, activeHeadingId, contentSections]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkScroll = () => {
      const main = document.querySelector('main');
      const mainScroll = main?.scrollTop || 0;
      const windowScroll = window.scrollY || document.documentElement.scrollTop || 0;
      setShowScrollTop(Math.max(mainScroll, windowScroll) > 300);
    };
    window.addEventListener('scroll', checkScroll, { passive: true, capture: true });
    document.addEventListener('scroll', checkScroll, { passive: true, capture: true });
    const main = document.querySelector('main');
    if (main) main.addEventListener('scroll', checkScroll, { passive: true });
    setTimeout(checkScroll, 500);
    return () => {
      window.removeEventListener('scroll', checkScroll, { capture: true } as any);
      document.removeEventListener('scroll', checkScroll, { capture: true } as any);
      if (main) main.removeEventListener('scroll', checkScroll);
    };
  }, [activeBlockId, activeHeadingId]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const main = document.querySelector('main');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
  };

  const sidebarItems = isSingleBlockMode
    ? contentSections.map((s, i) => ({ id: s.id, title: s.title, index: i + 1, complete: false }))
    : studyBlocks.map((b, i) => ({ id: b.id, title: b.title, index: i + 1, complete: doneBlocks.has(b.id) }));

  const activeId = isSingleBlockMode ? activeHeadingId : activeBlockId;

  const handleSidebarClick = (id: string) => {
    if (isSingleBlockMode) setActiveHeadingId(id);
    else setActiveBlockId(id);
    const main = document.querySelector('main');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentIdx = sidebarItems.findIndex(it => it.id === activeId);
  const canPrev = currentIdx > 0;
  const canNext = currentIdx >= 0 && currentIdx < sidebarItems.length - 1;
  const goPrev = () => canPrev && handleSidebarClick(sidebarItems[currentIdx - 1].id);
  const goNext = () => canNext && handleSidebarClick(sidebarItems[currentIdx + 1].id);

  return (
    <>
      <div className="w-full animate-fade-in max-w-7xl mx-auto mt-2 pb-16 sm:pb-20 px-3 sm:px-5 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-6 lg:gap-8">
          <aside className="hidden lg:block">
            <div className={`sticky top-[84px] rounded-2xl border-2 p-3.5 max-h-[calc(100vh-104px)] overflow-y-auto custom-scrollbar shadow-sm backdrop-blur-xl ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/85 border-slate-200'}`}>
              <div className={`mb-3 pb-3.5 border-b-2 border-dashed ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <BackButton onClick={onBack} label={t('back')} />
                  <span dir="ltr" className={`text-[11px] font-black px-2 py-0.5 rounded-lg tabular-nums ${isDark ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                    {doneCount}/{studyBlocks.length}
                  </span>
                </div>
                <p dir="auto" className={`text-xs sm:text-sm font-black leading-snug ${titleCls}`}><bdi>{pickedLessonName}</bdi></p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span dir="ltr" className={`text-[10px] font-black tabular-nums ${mutedCls}`}>{pct}%</span>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-2 mb-3 pb-3 border-b-2 border-dashed ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>
                <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
                <p className={`text-[10px] font-black uppercase tracking-widest ${titleCls}`}>
                  {isSingleBlockMode ? t('contents') : t('sections')}
                </p>
                <span className={`ms-auto text-[10px] font-black px-2 py-0.5 rounded-md tabular-nums ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500 border border-slate-200'}`}>
                  {sidebarItems.length}
                </span>
              </div>
              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const isActive = item.id === activeId;
                  return (
                    <button key={item.id} onClick={() => handleSidebarClick(item.id)}
                      className={`w-full text-start group flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border-2 ${
                        isActive
                          ? isDark ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/60 shadow-md shadow-emerald-500/10'
                                   : 'bg-emerald-50 text-emerald-700 border-emerald-400 shadow-md shadow-emerald-500/10'
                          : isDark ? 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/60 border-transparent hover:border-slate-700'
                                   : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/50 border-transparent hover:border-slate-200'
                      }`}>
                      <span className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                        isActive
                          ? isDark ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-500 text-white'
                          : isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.index}
                      </span>
                      <span dir="auto" className="flex-1 line-clamp-2 leading-snug mt-0.5"><bdi>{item.title}</bdi></span>
                      {item.complete && <CheckCircle2 size={14} className="shrink-0 text-emerald-500 mt-0.5" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <main className="space-y-6 min-w-0">
            <div className={`lg:hidden rounded-2xl border-2 overflow-hidden ${cardCls}`}>
              <div className={`flex items-center gap-2.5 px-3 py-2.5 border-b border-dashed ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <BackButton onClick={onBack} label={t('back')} />
                <div className="flex-1 min-w-0">
                  <p dir="auto" className={`text-xs font-black truncate ${titleCls}`}><bdi>{pickedLessonName}</bdi></p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span dir="ltr" className={`text-[10px] font-black tabular-nums ${mutedCls}`}>{doneCount}/{studyBlocks.length}</span>
                  </div>
                </div>
              </div>
              {sidebarItems.length > 1 && (
                <>
                <button onClick={() => setShowMobileSections(prev => !prev)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                  <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
                  <div className="w-7 h-7 rounded-md flex items-center justify-center bg-emerald-500/15 border border-emerald-500/30">
                    <Layers size={14} className="text-emerald-500" />
                  </div>
                  <div className="flex-1 text-start min-w-0">
                    <p className={`text-xs font-black uppercase tracking-wider ${titleCls}`}>
                      {isSingleBlockMode ? t('contents') : t('sections')}
                    </p>
                    <p dir="auto" className={`text-[10px] truncate ${mutedCls}`}>
                      <bdi>{currentIdx >= 0 ? `${currentIdx + 1}/${sidebarItems.length} · ${sidebarItems[currentIdx].title}` : `${sidebarItems.length} items`}</bdi>
                    </p>
                  </div>
                  <ChevronDown size={16} className={`shrink-0 text-emerald-500 transition-transform duration-300 ${showMobileSections ? '' : '-rotate-90'}`} />
                </button>
                {showMobileSections && (
                  <div className={`border-t-2 border-dashed p-2 max-h-[60vh] overflow-y-auto ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <nav className="space-y-1">
                      {sidebarItems.map((item) => {
                        const isActive = item.id === activeId;
                        return (
                          <button key={item.id} onClick={() => { handleSidebarClick(item.id); setShowMobileSections(false); }}
                            className={`w-full text-start flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 border-2 ${
                              isActive
                                ? isDark ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/60'
                                         : 'bg-emerald-50 text-emerald-700 border-emerald-400'
                                : isDark ? 'text-slate-400 active:bg-slate-800/60 border-transparent'
                                         : 'text-slate-500 active:bg-emerald-50 border-transparent'
                            }`}>
                            <span className={`shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-black ${
                              isActive ? 'bg-emerald-500 text-white' : isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {item.index}
                            </span>
                            <span dir="auto" className="flex-1 line-clamp-2 leading-snug"><bdi>{item.title}</bdi></span>
                            {item.complete && <CheckCircle2 size={12} className="shrink-0 text-emerald-500" />}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                )}
                </>
              )}
            </div>

            {studyLoading ? (
              <div className="text-center py-20"><Loader2 size={36} className="animate-spin text-emerald-500 mx-auto" /></div>
            ) : studyBlocks.length === 0 ? (
              <div className={`p-10 text-center rounded-2xl border-2 border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
                <FileText size={40} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm font-bold">{t('no_content_yet_for_this')}</p>
              </div>
            ) : isMultiBlockMode ? (
              !activeBlock ? (
                <div className={`p-10 text-center rounded-2xl border-2 border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
                  <Layers size={40} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-black mb-1">{t('select_a_section')}</p>
                  <p className="text-xs">{t('choose_one_from_the_sidebar')}</p>
                </div>
              ) : (
                <article className={`rounded-2xl border-2 ${cardCls}`}>
                  <div className={`flex items-center gap-3 px-5 sm:px-8 py-5 border-b-2 border-dashed ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div className="w-1.5 h-8 rounded-full shrink-0 bg-gradient-to-b from-emerald-400 to-teal-500" />
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border bg-emerald-500/15 text-emerald-500 border-emerald-500/30">
                      <FileText size={16} />
                    </div>
                    <h2 dir="auto" className={`flex-1 text-base sm:text-lg font-black tracking-tight ${titleCls}`}><bdi>{activeBlock.title}</bdi></h2>
                    <button onClick={() => onToggleBlockDone(activeBlock.id)} className="shrink-0 transition-transform hover:scale-110 active:scale-95">
                      {doneBlocks.has(activeBlock.id)
                        ? <CheckCircle2 size={20} className="text-emerald-500" />
                        : <Circle size={20} className={isDark ? 'text-slate-600 hover:text-emerald-500' : 'text-slate-300 hover:text-emerald-500'} />}
                    </button>
                  </div>
                  <div dir="ltr" className="px-5 sm:px-8 py-6 sm:py-8 text-left">
                    <div className="lesson-prose">
                      <RichText text={markHeadings(activeBlock.content || '')} isDark={isDark} />
                    </div>
                  </div>
                </article>
              )
            ) : (
              !activeContentSection ? (
                <div className={`p-10 text-center rounded-2xl border-2 border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
                  <FileText size={40} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-bold">{t('no_content_yet')}</p>
                </div>
              ) : (
                <article className={`rounded-2xl border-2 overflow-hidden ${cardCls}`}>
                  <div className={`flex items-center gap-3 px-5 sm:px-8 py-4 border-b-2 border-dashed ${isDark ? 'border-slate-800 bg-slate-950/30' : 'border-slate-200 bg-slate-50/50'}`}>
                    <div className="w-1.5 h-8 rounded-full shrink-0 bg-gradient-to-b from-emerald-400 to-teal-500" />
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-xs font-black">
                      {currentIdx + 1}
                    </div>
                    <h2 dir="auto" className={`flex-1 text-base sm:text-lg font-black tracking-tight ${titleCls}`}>
                      <bdi>{activeContentSection.title || 'Overview'}</bdi>
                    </h2>
                    <button onClick={() => onToggleBlockDone(activeBlock!.id)} className="shrink-0 transition-transform hover:scale-110 active:scale-95">
                      {doneBlocks.has(activeBlock!.id)
                        ? <CheckCircle2 size={20} className="text-emerald-500" />
                        : <Circle size={20} className={isDark ? 'text-slate-600 hover:text-emerald-500' : 'text-slate-300 hover:text-emerald-500'} />}
                    </button>
                  </div>
                  <div dir="ltr" className="px-5 sm:px-8 py-6 sm:py-8 text-left">
                    <div className="lesson-prose">
                      <RichText text={markHeadings(activeContentSection.body)} isDark={isDark} />
                    </div>
                  </div>
                  {sidebarItems.length > 1 && (
                    <div className={`flex items-center justify-between gap-3 px-5 sm:px-8 py-4 border-t-2 border-dashed ${isDark ? 'border-slate-800 bg-slate-950/30' : 'border-slate-200 bg-slate-50/50'}`}>
                      <button onClick={goPrev} disabled={!canPrev}
                        className={`group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border-2 text-xs font-bold transition-all ${
                          canPrev
                            ? isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-emerald-500/50'
                                     : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-emerald-400'
                            : isDark ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                                     : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                        }`}>
                        <ChevronLeft size={14} className={isRTL ? 'rotate-180' : ''} />
                        <span className="hidden sm:inline">{t('previous')}</span>
                        <span className="sm:hidden">{t('prev')}</span>
                      </button>
                      <span dir="ltr" className={`text-[10px] font-black uppercase tracking-widest tabular-nums ${mutedCls}`}>
                        {currentIdx + 1} / {sidebarItems.length}
                      </span>
                      <button onClick={goNext} disabled={!canNext}
                        className={`group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border-2 text-xs font-bold transition-all ${
                          canNext
                            ? isDark ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 shadow-md shadow-emerald-500/20'
                                     : 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20'
                            : isDark ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                                     : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                        }`}>
                        <span>{t('next')}</span>
                        <ChevronRight size={14} className={isRTL ? 'rotate-180' : ''} />
                      </button>
                    </div>
                  )}
                </article>
              )
            )}
          </main>
        </div>
      </div>

      {showScrollTop && (
        <button onClick={scrollToTop}
          className={`fixed bottom-20 sm:bottom-6 end-4 sm:end-6 z-[60] w-12 h-12 rounded-full flex items-center justify-center shadow-2xl border-2 transition-all duration-300 hover:scale-110 active:scale-95 ${
            isDark ? 'bg-slate-900 border-emerald-500/50 text-emerald-400 hover:bg-slate-800'
                   : 'bg-white border-emerald-500/40 text-emerald-600 hover:bg-emerald-50'
          }`} title={t('back_to_top')}>
          <ChevronDown size={22} className="rotate-180" />
        </button>
      )}
    </>
  );
}