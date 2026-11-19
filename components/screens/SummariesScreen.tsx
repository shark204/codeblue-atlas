// components/screens/SummariesScreen.tsx
'use client';

import LoadingHeart from '../ui/LoadingHeart';
import { useState, useEffect, useRef } from 'react';
import { ChevronRight, BookOpen, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

import {
  ACADEMIC_YEARS, CURRICULUM_DATA,
  type Category, type Lesson, type Section, type Subsection, type Topic,
} from './summaries/data';
import CurriculumView from './summaries/CurriculumView';
import { handleTopicClick as handleTopicClickImpl } from './summaries/useSummariesHandlers';
import { toSlug, normalizeTitle } from './summaries/utils';
import type { SummariesProps, SummariesView } from './summaries/types';

import { useYear4Content } from './summaries/year4';
import LessonReader from './summaries/LessonReader';
import { useLessonSlides } from './summaries/useLessonSlides';

import SubjectsView from './summaries/views/SubjectsView';
import LessonsView from './summaries/views/LessonsView';
import ReaderView from './summaries/views/ReaderView';
import SummariesTopicView from './summaries/views/SummariesTopicView';
import ModuleLessonsView from './summaries/views/ModuleLessonsView';
import { useTranslations } from "@/stores/languageStore";
import { BackButton } from '../ui/BackButton';

export default function SummariesScreen({
  isDark, onBack, showToast,
}: SummariesProps) {
    const t = useTranslations('components_screens_SummariesScreen');
  const [view, setView] = useState<SummariesView>('subjects');

  const [courseCategories, setCourseCategories] = useState<Category[]>([]);
  const [pickedCategory, setPickedCategory] = useState<Category | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [subsections, setSubsections] = useState<Subsection[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [openTopics, setOpenTopics] = useState<Set<number>>(new Set());
  const [done, setDone] = useState<Set<number>>(new Set());
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const [summariesSubject, setSummariesSubject] = useState<string | null>(null);
  const [summariesTopic, setSummariesTopic] = useState<string | null>(null);
  const [summariesTopics, setSummariesTopics] = useState<{ name: string; count: number }[]>([]);
  const [summariesRows, setSummariesRows] = useState<any[]>([]);
  const [pickedModule, setPickedModule] = useState<any>(null);

  const [pickedLessonName, setPickedLessonName] = useState<string | null>(null);
  const [studyBlocks, setStudyBlocks] = useState<any[]>([]);
  const [studyLoading, setStudyLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [restored, setRestored] = useState(false);
  const isFirstRender = useRef(true);

  const { modules: year4Modules, loading: year4Loading, error: year4Error } = useYear4Content();
  const isYear4 = summariesSubject === 'Fourth Year';

  const slides = useLessonSlides(pickedModule?.subsection, pickedLessonName);

  // ✅ بانل زجاجي شفاف في الوضع النهاري، وداكن أنيق في الوضع الليلي
  const activeCardCls = isDark
    ? 'bg-slate-900/65 border-slate-800 backdrop-blur-xl hover:border-emerald-500 hover:shadow-emerald-500/10'
    : 'bg-white/28 border-white/55 backdrop-blur-xl hover:bg-white/40 hover:border-emerald-400 shadow-[0_12px_32px_-14px_rgba(14,116,144,0.16)]';

  // ✅ بانل خامل (أغمق وبشكل خامل واضح عندما لا يوجد محتوى مفتوح)
  const inactiveCardCls = isDark
    ? 'bg-slate-950/85 border-slate-800/50 opacity-65 cursor-not-allowed'
    : 'bg-slate-900/42 border-slate-600/35 opacity-80 cursor-not-allowed backdrop-blur-md';

  const titleCls = isDark ? 'text-white' : 'text-slate-900';
  const mutedCls = isDark ? 'text-slate-400' : 'text-slate-700';

  // ═══ Global Back Handler ═══
  const handleGlobalBack = () => {
    if (view === 'study-reader') {
      setView('module-lessons');
      setPickedLessonName(null);
      setStudyBlocks([]);
    } else if (view === 'module-lessons') {
      setView('summaries-reader');
      setPickedModule(null);
    } else if (view === 'reader') {
      if (pickedCategory) setView('lessons');
      else if (summariesSubject && summariesTopic) setView('summaries-reader');
      else setView('subjects');
      setLesson(null);
    } else if (view === 'lessons') {
      if (summariesSubject && summariesTopic) setView('summaries-reader');
      else if (summariesSubject) setView('summaries-topic');
      else setView('subjects');
      setPickedCategory(null);
    } else if (view === 'summaries-topic') {
      setView('subjects');
      setSummariesSubject(null);
    } else if (view === 'summaries-reader') {
      if (summariesTopic && !['Third Year', 'Fourth Year', 'Fifth Year'].includes(summariesSubject || '')) {
        setView('summaries-topic');
      } else {
        setView('subjects');
        setSummariesSubject(null);
        setSummariesTopic(null);
      }
    } else if (view === 'subjects') {
      try { localStorage.removeItem('cb_summaries_state'); } catch {}
      onBack();
    }
  };

  // ═══ Effects ═══
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    window.scrollTo({ top: 0, behavior: 'auto' });
    const main = document.querySelector('main');
    if (main) main.scrollTo({ top: 0, behavior: 'auto' });
  }, [view, summariesSubject, summariesTopic]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('course_categories').select('*').order('display_order', { ascending: true });
      setCourseCategories(data || []);
    })();
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem('cb_summaries_state', JSON.stringify({
        view, summariesSubject, summariesTopic,
        pickedCategoryId: pickedCategory?.id || null,
        lessonId: lesson?.id || null,
      }));
    } catch {}
  }, [view, summariesSubject, summariesTopic, pickedCategory, lesson, restored]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cb_summaries_state');
      if (!raw) { setRestored(true); return; }
      const s = JSON.parse(raw);
      if (s.summariesSubject) setSummariesSubject(s.summariesSubject);
      if (s.summariesTopic) setSummariesTopic(s.summariesTopic);
      if (s.view) setView(s.view);
    } catch {}
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!courseCategories.length || !restored) return;
    try {
      const raw = localStorage.getItem('cb_summaries_state');
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.pickedCategoryId && !pickedCategory) {
        const cat = courseCategories.find((c) => c.id === s.pickedCategoryId);
        if (cat) setPickedCategory(cat);
      }
    } catch {}
  }, [courseCategories, restored]);

  useEffect(() => {
    if (!lesson) return;
    (async () => {
      setLoading(true);
      setOpenTopics(new Set());
      setSections([]); setSubsections([]); setTopics([]);
      const { data: secs } = await supabase.from('course_sections').select('*').eq('disease_id', lesson.id).order('display_order', { ascending: true });
      const secList = (secs || []) as Section[];
      setSections(secList);
      if (secList.length) {
        const { data: subs } = await supabase.from('course_subsections').select('*').in('section_id', secList.map(s => s.id)).order('display_order', { ascending: true });
        const subList = (subs || []) as Subsection[];
        setSubsections(subList);
        if (subList.length) {
          const { data: tps } = await supabase.from('course_topics').select('*').in('subsection_id', subList.map(s => s.id)).order('display_order', { ascending: true });
          setTopics((tps || []) as Topic[]);
        }
      }
      try {
        const saved = localStorage.getItem(`course-done:${lesson.id}`);
        setDone(new Set(saved ? JSON.parse(saved) : []));
      } catch { setDone(new Set()); }
      setLoading(false);
    })();
  }, [lesson]);

  useEffect(() => {
    if (!restored || !pickedCategory || lesson) return;
    try {
      const raw = localStorage.getItem('cb_summaries_state');
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.lessonId) {
        (async () => {
          const { data } = await supabase.from('course_diseases').select('*').eq('id', s.lessonId).maybeSingle();
          if (data) setLesson(data);
        })();
      }
    } catch {}
  }, [pickedCategory, restored, lesson]);

  useEffect(() => {
    if (!pickedCategory) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('course_diseases').select('*').eq('category_id', pickedCategory.id).order('display_order', { ascending: true });
      setLessons(data || []);
      setLoading(false);
    })();
  }, [pickedCategory]);

  useEffect(() => {
    if (!summariesSubject) return;
    (async () => {
      setLoading(true);
      const dbSubject =
        summariesSubject === 'First Year' ? 'Year 1' :
        summariesSubject === 'Second Year' ? 'Year 2' :
        summariesSubject === 'Third Year' ? 'Year 3' :
        summariesSubject === 'Fourth Year' ? 'Year 4' :
        summariesSubject === 'Fifth Year' ? 'Year 5' : summariesSubject;

      const { data } = await supabase.from('summaries').select('topic').eq('subject', dbSubject);
      const map = new Map<string, number>();
      (data || []).forEach((r: any) => {
        let topicName = r.topic;
        if (topicName === 'Term 1') topicName = 'First Term';
        if (topicName === 'Term 2') topicName = 'Second Term';
        map.set(topicName, (map.get(topicName) || 0) + 1);
      });
      let list = [...map].map(([name, count]) => ({ name, count }));
      if (summariesSubject === 'First Year' || summariesSubject === 'Second Year') {
        const existing = new Set(list.map(t => t.name));
        ['First Term', 'Second Term'].forEach(term => {
          if (!existing.has(term)) list.push({ name: term, count: 0 });
        });
        list.sort((a, b) => a.name.localeCompare(b.name));
      }
      setSummariesTopics(list);
      setLoading(false);
    })();
  }, [summariesSubject]);

  useEffect(() => {
    if (!summariesSubject || !summariesTopic) return;
    if (summariesSubject === 'Fourth Year') return;

    (async () => {
      setLoading(true);
      const dbSubject =
        summariesSubject === 'First Year' ? 'Year 1' :
        summariesSubject === 'Second Year' ? 'Year 2' :
        summariesSubject === 'Third Year' ? 'Year 3' :
        summariesSubject === 'Fifth Year' ? 'Year 5' : summariesSubject;
      const dbTopic =
        summariesTopic === 'First Term' ? 'Term 1' :
        summariesTopic === 'Second Term' ? 'Term 2' : summariesTopic;
      const { data } = await supabase.from('summaries').select('*').eq('subject', dbSubject).eq('topic', dbTopic).order('id', { ascending: true });
      setSummariesRows(data || []);
      setLoading(false);
    })();
  }, [summariesSubject, summariesTopic]);

  // ═══ Study content fetching (Year 4) ═══
  useEffect(() => {
    if (!pickedLessonName || !pickedModule) return;
    (async () => {
      setStudyLoading(true);
      setStudyBlocks([]);

      const parentSlug = `year4-${toSlug(pickedModule.subsection)}`;
      const { data: parent } = await supabase
        .from('study_content').select('id')
        .eq('slug', parentSlug).eq('is_visible', true).maybeSingle();
      if (!parent) { setStudyLoading(false); return; }

      const { data: chapters } = await supabase
        .from('study_content').select('id, title, order_index')
        .eq('parent_id', parent.id).eq('node_type', 'section').eq('is_visible', true);

      const targetNorm = normalizeTitle(pickedLessonName);
      let chapter = (chapters || []).find((c: any) => normalizeTitle(c.title) === targetNorm);

      if (!chapter && chapters?.length) {
        const sig = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length >= 4);
        const stem = (w: string) => w.substring(0, Math.min(5, w.length));
        const targetStems = sig(pickedLessonName).map(stem);
        let bestScore = 0; let bestMatch: any = null;
        for (const c of chapters) {
          const cStems = sig(c.title).map(stem);
          let score = 0;
          for (const tStem of targetStems) if (cStems.includes(tStem)) score++;
          if (score > bestScore) { bestScore = score; bestMatch = c; }
        }
        if (bestScore >= 1 && bestMatch) chapter = bestMatch;
      }
      if (!chapter) { setStudyLoading(false); return; }

      const { data: blocks } = await supabase
        .from('study_content').select('*')
        .eq('parent_id', chapter.id).eq('node_type', 'block').eq('is_visible', true)
        .order('order_index', { ascending: true });

      setStudyBlocks(blocks || []);
      setStudyLoading(false);
    })();
  }, [pickedLessonName, pickedModule]);

  // ═══ Handlers ═══
  const handleTopicClick = (topicName: string, subjectName?: string) =>
    handleTopicClickImpl(topicName, subjectName, {
      courseCategories, showToast, setLoading, setPickedCategory, setLesson, setView,
    });

  const toggleTopic = (id: number) =>
    setOpenTopics(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleDone = (id: number) => {
    if (!lesson) return;
    setDone(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      try { localStorage.setItem(`course-done:${lesson.id}`, JSON.stringify([...n])); } catch {}
      return n;
    });
  };

  // ═══ VIEWS ═══

  if (view === 'subjects') {
    return (
      <div className="w-full max-w-6xl mx-auto p-2 sm:p-4">
        <SubjectsView
          isDark={isDark}
          onBack={handleGlobalBack}
          onShowToast={(msg, type = 'info') => showToast?.(msg, type)}
          onSelectYear={(slug) => {
            setSummariesSubject(slug);
            const skipTopic = ['Third Year', 'Fourth Year', 'Fifth Year'].includes(slug);
            if (skipTopic) { setSummariesTopic('Modules'); setView('summaries-reader'); }
            else { setSummariesTopic(null); setView('summaries-topic'); }
          }}
          onSelectBoard={(slug) => {
            setSummariesSubject(slug);
            setSummariesTopic(null);
            setView('summaries-topic');
          }}
        />
      </div>
    );
  }

  if (view === 'lessons' && pickedCategory) {
    return (
      <div className="w-full max-w-6xl mx-auto p-2 sm:p-4">
        <LessonsView
          isDark={isDark}
          onBack={handleGlobalBack}
          pickedCategory={pickedCategory}
          lessons={lessons}
          loading={loading}
          onSelectLesson={(l) => { setLesson(l); setView('reader'); }}
        />
      </div>
    );
  }

  if (view === 'reader' && lesson && pickedCategory) {
    return (
      <div className="w-full max-w-6xl mx-auto p-2 sm:p-4">
        <ReaderView
          isDark={isDark}
          onBack={handleGlobalBack}
          lesson={lesson}
          pickedCategory={pickedCategory}
          sections={sections}
          subsections={subsections}
          topics={topics}
          openTopics={openTopics}
          done={done}
          zoomedImage={zoomedImage}
          onToggleTopic={toggleTopic}
          onToggleDone={toggleDone}
          onZoomImage={setZoomedImage}
        />
      </div>
    );
  }

  if (view === 'summaries-topic' && summariesSubject) {
    return (
      <div className="w-full max-w-6xl mx-auto p-2 sm:p-4">
        <SummariesTopicView
          isDark={isDark}
          onBack={handleGlobalBack}
          subject={summariesSubject}
          topics={summariesTopics}
          loading={loading}
          onSelectTopic={(name) => { setSummariesTopic(name); setView('summaries-reader'); }}
        />
      </div>
    );
  }

  if (view === 'module-lessons' && pickedModule) {
    return (
      <div className="w-full max-w-6xl mx-auto p-2 sm:p-4">
        <ModuleLessonsView
          isDark={isDark}
          onBack={handleGlobalBack}
          pickedModule={pickedModule}
          summariesTopic={summariesTopic}
          onSelectLesson={(name) => { setPickedLessonName(name); setView('study-reader'); }}
        />
      </div>
    );
  }

  if (view === 'study-reader' && pickedLessonName && pickedModule) {
    return (
      <div className="w-full max-w-6xl mx-auto p-2 sm:p-4">
        <LessonReader
          isDark={isDark}
          onBack={handleGlobalBack}
          lessonName={pickedLessonName}
          blocks={studyBlocks}
          loading={studyLoading}
          slides={slides}
        />
      </div>
    );
  }

  // ═══ Fallback: Summaries Reader (Modules list / Curriculum view) ═══
  const isYear1Term1 = summariesSubject === 'First Year' && summariesTopic === 'First Term';
  const featuredCategories = isYear1Term1
    ? courseCategories.filter(c => ['human-anatomy', 'upper-limb-anatomy', 'general-embryology'].includes(c.slug))
    : [];
  const curriculumData = CURRICULUM_DATA[summariesSubject as string]?.[summariesTopic as string];

  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-4">
      <BackButton onClick={handleGlobalBack} label={t('back')} />

      {(loading || (isYear4 && year4Loading)) ? (
        <div className="text-center py-20">
          <LoadingHeart isDark={isDark} size={90} label={t('loading')} />
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          <h1 className={`text-lg sm:text-2xl font-black ${titleCls}`}>{summariesTopic}</h1>

          {curriculumData ? (
            <CurriculumView
              data={curriculumData}
              isDark={isDark}
              onTopicClick={handleTopicClick}
              courseCategories={courseCategories}
            />
          ) : (
            <>
              {featuredCategories.length > 0 && (
                <div className="space-y-2.5 sm:space-y-3">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${mutedCls}`}>{t('featured_curricula')}</p>
                  {featuredCategories.map(cat => (
                    <button key={cat.id} onClick={() => { setPickedCategory(cat); setLesson(null); setView('lessons'); }}
                      className={`w-full group relative overflow-hidden p-4 sm:p-5 rounded-xl sm:rounded-2xl border text-start transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] ${activeCardCls}`}>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <span className="text-2xl sm:text-4xl shrink-0">{cat.icon || '🦴'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <BookOpen size={14} className="text-emerald-500 shrink-0" />
                            <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{t('featured_curriculum')}</span>
                          </div>
                          <h3 className={`text-sm sm:text-lg font-black truncate ${titleCls}`}>{cat.name_en}</h3>
                          {cat.description && (
                            <p className={`text-[10px] sm:text-xs mt-1 ${mutedCls} line-clamp-2`}>{cat.description}</p>
                          )}
                        </div>
                        <ChevronRight size={18} className="shrink-0 text-emerald-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {isYear4 && year4Error && (
                <div className={`p-4 rounded-xl border-2 border-dashed text-center ${isDark ? 'border-red-900 text-red-400' : 'border-red-300 text-red-600 bg-white/25 backdrop-blur-md'}`}>
                  <p className="text-sm font-bold">حدث خطأ في تحميل محتوى رابعة</p>
                  <p className="text-xs mt-1 opacity-70">{year4Error}</p>
                </div>
              )}

              {isYear4 && year4Modules.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {year4Modules.map((mod) => {
                    const isOpen = mod.totalLessons > 0;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => {
                          if (isOpen) {
                            setPickedModule(mod.raw);
                            setView('module-lessons');
                          } else {
                            showToast?.(`Content for "${mod.subsection}" is coming soon!`, 'info');
                          }
                        }}
                        className={`w-full group p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border text-start transition-all duration-300 ${
                          isOpen
                            ? `${activeCardCls} hover:-translate-y-0.5 hover:shadow-xl cursor-pointer`
                            : inactiveCardCls
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`text-sm sm:text-lg font-black truncate ${
                                isOpen ? titleCls : (isDark ? 'text-slate-400' : 'text-slate-200')
                              }`}>
                                {mod.subsection}
                              </h3>
                              {!isOpen && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900/80 text-amber-300 border border-amber-500/30 shrink-0">
                                  <Lock size={9} /> {t('coming_soon')}
                                                                                </span>
                              )}
                            </div>
                            <p className={`text-[10px] sm:text-xs font-semibold ${
                              isOpen ? mutedCls : (isDark ? 'text-slate-500' : 'text-slate-300')
                            }`}>
                              {isOpen
                                ? `${mod.groups.length} groups · ${mod.totalLessons} lessons`
                                : t('no_open_lessons_yet')}
                            </p>
                          </div>
                          {isOpen ? (
                            <ChevronRight size={18} className="shrink-0 transition-transform group-hover:translate-x-1 text-emerald-500" />
                          ) : (
                            <Lock size={16} className="shrink-0 text-slate-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {!isYear4 && summariesRows.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {summariesRows.map((r: any) => {
                    const groups = r.content_json?.groups;
                    const hasLessons = Array.isArray(groups) && groups.length > 0;
                    const totalLessons = hasLessons
                      ? groups.reduce((sum: number, g: any) => sum + (g.lessons?.length || 0), 0)
                      : 0;
                    const isOpen = hasLessons && totalLessons > 0;

                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          if (isOpen) {
                            setPickedModule(r);
                            setView('module-lessons');
                          } else {
                            showToast?.(`Content for "${r.subsection}" is coming soon!`, 'info');
                          }
                        }}
                        className={`w-full group p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border text-start transition-all duration-300 ${
                          isOpen
                            ? `${activeCardCls} hover:-translate-y-0.5 hover:shadow-xl cursor-pointer`
                            : inactiveCardCls
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`text-sm sm:text-lg font-black truncate ${
                                isOpen ? titleCls : (isDark ? 'text-slate-400' : 'text-slate-200')
                              }`}>
                                {r.subsection}
                              </h3>
                              {!isOpen && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900/80 text-amber-300 border border-amber-500/30 shrink-0">
                                  <Lock size={9} /> {t('coming_soon')}
                                                                                </span>
                              )}
                            </div>
                            <p className={`text-[10px] sm:text-xs font-semibold ${
                              isOpen ? mutedCls : (isDark ? 'text-slate-500' : 'text-slate-300')
                            }`}>
                              {r.topic} · {r.subsection}
                            </p>
                            {isOpen ? (
                              <p className={`text-[10px] sm:text-xs font-bold mt-1.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                {totalLessons} lessons →
                              </p>
                            ) : (
                              <p className={`text-[10px] font-bold mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-300'}`}>
                                {t('no_open_content_yet')}
                                                                              </p>
                            )}
                          </div>
                          {isOpen ? (
                            <ChevronRight size={18} className="shrink-0 transition-transform group-hover:translate-x-1 text-emerald-500" />
                          ) : (
                            <Lock size={16} className="shrink-0 text-slate-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {!isYear4 && summariesRows.length === 0 && (
                <div className={`p-8 rounded-2xl border text-center ${inactiveCardCls}`}>
                  <Lock size={28} className="mx-auto mb-2 text-amber-400" />
                  <p className="text-sm font-black text-white">{t('content_is_coming_soon')}</p>
                  <p className="text-xs mt-1 text-slate-300">{t('this_curriculum_section_does_not')}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}