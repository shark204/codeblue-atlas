'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Loader2, ChevronRight, FileText, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BackButton } from '../ui/BackButton';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  onBack: () => void;
};

type Category = {
  id: number;
  slug: string;
  name_en: string;
  name_ar: string | null;
  description: string | null;
  icon: string | null;
  display_order: number;
};

type Disease = {
  id: number;
  category_id: number;
  name_en: string;
  name_ar: string | null;
  slug: string;
  display_order: number;
};

type Section = {
  id: number;
  disease_id: number;
  section_key: string;
  section_name_en: string;
  section_name_ar: string | null;
  content: string | null;
  display_order: number;
};

type Subsection = {
  id: number;
  section_id: number;
  slug: string;
  name_en: string;
  name_ar: string | null;
  icon: string | null;
  display_order: number;
};

type Topic = {
  id: number;
  subsection_id: number;
  slug: string;
  name_en: string;
  name_ar: string | null;
  content: string | null;
  display_order: number;
};

export default function CoursesScreen({ isDark, onBack }: Props) {
    const t = useTranslations('components_screens_CoursesScreen');
  const [category, setCategory] = useState<Category | null>(null);
  const [disease, setDisease] = useState<Disease | null>(null);
  const [activeSection, setActiveSection] = useState<Section | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subsections, setSubsections] = useState<Subsection[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // ─── Fetch Categories ─────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('course_categories')
        .select('*')
        .order('display_order', { ascending: true });
      setCategories(data || []);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  // ─── Fetch Diseases ─────────────────────────────
  useEffect(() => {
    if (!category) return;
    const fetchDiseases = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('course_diseases')
        .select('*')
        .eq('category_id', category.id)
        .order('display_order', { ascending: true })
        .order('name_en', { ascending: true });
      setDiseases(data || []);
      setLoading(false);
    };
    fetchDiseases();
  }, [category]);

  // ─── Fetch Sections ─────────────────────────────
  useEffect(() => {
    if (!disease) return;
    const fetchSections = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('course_sections')
        .select('*')
        .eq('disease_id', disease.id)
        .order('display_order', { ascending: true });
      setSections(data || []);
      setActiveSection(data?.[0] || null);
      setLoading(false);
    };
    fetchSections();
  }, [disease]);

  // ─── Fetch Subsections + Topics ─────────────────
  useEffect(() => {
    if (!activeSection) {
      setSubsections([]);
      setTopics([]);
      setActiveTopic(null);
      return;
    }

    const fetchNestedContent = async () => {
      setLoading(true);
      setActiveTopic(null);

      const { data: subs } = await supabase
        .from('course_subsections')
        .select('*')
        .eq('section_id', activeSection.id)
        .order('display_order', { ascending: true });

      setSubsections(subs || []);

      if (subs && subs.length > 0) {
        const { data: tps } = await supabase
          .from('course_topics')
          .select('*')
          .in('subsection_id', subs.map((x) => x.id))
          .order('display_order', { ascending: true });
        setTopics(tps || []);
      } else {
        setTopics([]);
      }

      setLoading(false);
    };

    fetchNestedContent();
  }, [activeSection]);

  // ─── Navigation ─────────────────────────────────
  const goBack = () => {
    if (disease) {
      setDisease(null);
      setSections([]);
      setActiveSection(null);
      setSubsections([]);
      setTopics([]);
      setActiveTopic(null);
    } else if (category) {
      setCategory(null);
      setDiseases([]);
    } else {
      onBack();
    }
  };

  const filteredDiseases = search.trim()
    ? diseases.filter(
        (d) =>
          d.name_en.toLowerCase().includes(search.toLowerCase()) ||
          (d.name_ar && d.name_ar.includes(search))
      )
    : diseases;

  const backBtnClass = `flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all duration-300 shadow-sm hover:scale-[1.03] active:scale-[0.97] ${
    isDark
      ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
  }`;

  // ═══════════════════════════════════════════════════════════
  // VIEW 1: Categories Grid
  // ═══════════════════════════════════════════════════════════
  if (!category) {
    return (
      <div className="w-full animate-fade-in max-w-5xl mx-auto space-y-6 py-4">
        <div className="flex justify-start mb-2">
          <BackButton onClick={onBack} label={t('back')} />
        </div>

        {/* Header */}
        <div
          className={`relative overflow-hidden p-6 lg:p-8 rounded-3xl text-center shadow-xl border grain-overlay ${
            isDark
              ? 'bg-gradient-to-br from-emerald-950/60 to-teal-950/60 border-emerald-800/50'
              : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-emerald-200'
          }`}
        >
          <div
            className={`absolute -top-12 -end-12 w-48 h-48 rounded-full blur-3xl ${
              isDark ? 'bg-emerald-500/20' : 'bg-emerald-400/30'
            }`}
          />
          <div
            className={`absolute -bottom-12 -start-12 w-48 h-48 rounded-full blur-3xl ${
              isDark ? 'bg-teal-500/20' : 'bg-teal-400/30'
            }`}
          />
          <div className="relative z-10">
            <div
              className={`inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-4 shadow-lg ${
                isDark
                  ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/50'
                  : 'bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-300'
              }`}
            >
              <BookOpen size={32} className="text-emerald-500" />
            </div>
            <h2 className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('courses')}
                                    </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('comprehensive_summaries_for_medical_curr')}
                                    </p>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-32 sm:h-40 rounded-2xl animate-pulse ${
                  isDark ? 'bg-slate-800/60' : 'bg-slate-200/60'
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat)}
                className={`group relative overflow-hidden p-3 sm:p-5 rounded-2xl border-2 text-start transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl grain-overlay ${
                  isDark
                    ? 'bg-gradient-to-br from-slate-900 to-slate-800/80 border-slate-800 hover:border-emerald-600 hover:shadow-emerald-500/10'
                    : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:border-emerald-400 hover:shadow-emerald-500/10'
                }`}
              >
                <div
                  className={`absolute -top-10 -end-10 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    isDark ? 'bg-emerald-500/20' : 'bg-emerald-400/30'
                  }`}
                />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="text-2xl sm:text-3xl transition-transform duration-300 group-hover:scale-110">
                      {cat.icon || '📖'}
                    </div>
                    <ChevronRight
                      size={16}
                      className={`ms-auto transition-transform duration-300 group-hover:translate-x-1 ${
                        isDark
                          ? 'text-slate-600 group-hover:text-emerald-500'
                          : 'text-slate-400 group-hover:text-emerald-500'
                      }`}
                    />
                  </div>
                  <h3
                    className={`text-sm sm:text-lg font-black mb-1 leading-tight ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {cat.name_en}
                  </h3>
                  {cat.description && (
                    <p
                      className={`text-[10px] sm:text-[11px] mt-1 sm:mt-2 leading-relaxed line-clamp-2 ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {cat.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // VIEW 2: Diseases List
  // ═══════════════════════════════════════════════════════════
  if (!disease) {
    return (
      <div className="w-full animate-fade-in max-w-5xl mx-auto space-y-6 py-4">
        <div className="flex justify-between items-center gap-2 mb-2">
          <BackButton onClick={goBack} label={t('back')} />
        </div>

        {/* Header */}
        <div
          className={`relative overflow-hidden p-5 rounded-3xl border-2 grain-overlay ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">{category.icon}</div>
              <div>
                <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {category.name_en}
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                  {diseases.length} topics
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className={`absolute start-3 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search_for_a_topic')}
                className={`w-full ps-10 pe-3 py-2.5 rounded-xl text-sm border transition-all focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-600'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Diseases */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-20 rounded-xl animate-pulse ${
                  isDark ? 'bg-slate-800/60' : 'bg-slate-200/60'
                }`}
              />
            ))}
          </div>
        ) : filteredDiseases.length === 0 ? (
          <div
            className={`p-10 text-center rounded-2xl border-2 border-dashed ${
              isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'
            }`}
          >
            <FileText size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm font-bold">{t('no_topics_yet')}</p>
            {search && <p className="text-xs mt-1">{t('try_a_different_search_term')}</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredDiseases.map((d) => (
              <button
                key={d.id}
                onClick={() => setDisease(d)}
                className={`group relative overflow-hidden p-3 sm:p-4 rounded-xl border-2 text-start transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 hover:border-emerald-700 hover:bg-slate-800/80'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 relative z-10">
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs sm:text-sm font-black truncate ${
                        isDark ? 'text-slate-100' : 'text-slate-800'
                      }`}
                    >
                      {d.name_en}
                    </p>
                    {d.name_ar && (
                      <p
                        className={`text-[10px] sm:text-[11px] font-medium mt-0.5 truncate ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {d.name_ar}
                      </p>
                    )}
                  </div>
                  <ChevronRight
                    size={16}
                    className={`shrink-0 transition-transform duration-300 group-hover:translate-x-1 ${
                      isDark
                        ? 'text-slate-600 group-hover:text-emerald-500'
                        : 'text-slate-400 group-hover:text-emerald-500'
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // VIEW 3: Sections + Subsections + Topics
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="w-full animate-fade-in max-w-6xl mx-auto space-y-4 py-4">
      <div className="flex justify-start mb-2">
        <BackButton onClick={onBack} label={t('back')} />
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Loader2 size={40} className="animate-spin text-emerald-500 mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside
            className={`relative overflow-hidden p-5 rounded-2xl border-2 h-fit lg:sticky lg:top-4 grain-overlay ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="relative z-10">
              <p
                className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {t('topic')}
                                                </p>
              <h2
                className={`text-lg font-black mb-5 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {disease.name_en}
              </h2>

              <nav className="space-y-1">
                {sections.map((sec) => {
                  const isActive = activeSection?.id === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => setActiveSection(sec)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-start text-sm font-bold transition-all duration-200 hover:scale-[1.01] ${
                        isActive
                          ? isDark
                            ? 'bg-gradient-to-r from-emerald-950/70 to-teal-950/50 text-emerald-300 border border-emerald-800 shadow-md shadow-emerald-500/10'
                            : 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200 shadow-md shadow-emerald-500/10'
                          : isDark
                            ? 'text-slate-300 hover:bg-slate-800 border border-transparent'
                            : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <span className="truncate">{sec.section_name_en}</span>
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isActive
                            ? 'border-emerald-500 bg-emerald-500 shadow-md shadow-emerald-500/40'
                            : isDark
                              ? 'border-slate-600'
                              : 'border-slate-300'
                        }`}
                      >
                        {isActive && (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2 6L5 9L10 3"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main
            className={`relative overflow-hidden p-6 lg:p-8 rounded-2xl border-2 grain-overlay ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="relative z-10">
              {activeSection ? (
                subsections.length > 0 ? (
                  // ───── 5-LEVEL VIEW ─────
                  <>
                    <h1
                      className={`text-2xl font-black mb-2 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {activeSection.section_name_en}
                    </h1>
                    {activeSection.section_name_ar && (
                      <p
                        className={`text-sm font-bold mb-4 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {activeSection.section_name_ar}
                      </p>
                    )}

                    {activeSection.content && (
                      <div
                        className={`mb-6 p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                          isDark
                            ? 'bg-slate-800/50 text-slate-400 border border-slate-700'
                            : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {activeSection.content}
                      </div>
                    )}

                    <div
                      className={`w-full h-px mb-6 ${
                        isDark ? 'bg-slate-800' : 'bg-slate-200'
                      }`}
                    />

                    {/* Subjects (Subsections) + Topics */}
                    <div className="space-y-5">
                      {subsections.map((sub) => {
                        const subTopics = topics.filter(
                          (t) => t.subsection_id === sub.id
                        );
                        return (
                          <div
                            key={sub.id}
                            className={`rounded-2xl border-2 p-4 ${
                              isDark
                                ? 'bg-slate-800/40 border-slate-700'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-2xl">{sub.icon || '📘'}</span>
                              <h3
                                className={`text-lg font-black ${
                                  isDark ? 'text-white' : 'text-slate-900'
                                }`}
                              >
                                {sub.name_en}
                              </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {subTopics.map((t) => (
                                <button
                                  key={t.id}
                                  onClick={() => setActiveTopic(t)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:scale-[1.03] ${
                                    activeTopic?.id === t.id
                                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/30'
                                      : isDark
                                        ? 'bg-slate-900 text-slate-300 border-slate-700 hover:border-emerald-600'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
                                  }`}
                                >
                                  {t.name_en}
                                </button>
                              ))}
                              {subTopics.length === 0 && (
                                <p
                                  className={`text-xs italic ${
                                    isDark ? 'text-slate-500' : 'text-slate-400'
                                  }`}
                                >
                                  {t('no_topics_yet')}
                                                                            </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Active Topic Content */}
                    {activeTopic && (
                      <div
                        className={`mt-6 p-5 rounded-2xl border-2 ${
                          isDark
                            ? 'bg-slate-950 border-emerald-900/50'
                            : 'bg-emerald-50/50 border-emerald-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <h4
                            className={`text-lg font-black ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {activeTopic.name_en}
                          </h4>
                        </div>
                        {activeTopic.content ? (
                          <div
                            className={`whitespace-pre-wrap text-sm leading-relaxed ${
                              isDark ? 'text-slate-300' : 'text-slate-700'
                            }`}
                          >
                            {activeTopic.content}
                          </div>
                        ) : (
                          <div
                            className={`p-6 text-center rounded-xl border-2 border-dashed ${
                              isDark
                                ? 'border-slate-700 text-slate-500'
                                : 'border-slate-300 text-slate-400'
                            }`}
                          >
                            <FileText size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-xs font-bold">{t('no_content_yet')}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  // ───── 3-LEVEL FALLBACK ─────
                  <>
                    <h1
                      className={`text-2xl font-black mb-2 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {activeSection.section_name_en}
                    </h1>
                    {activeSection.section_name_ar && (
                      <p
                        className={`text-sm font-bold mb-6 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {activeSection.section_name_ar}
                      </p>
                    )}

                    <div
                      className={`w-full h-px mb-6 ${
                        isDark ? 'bg-slate-800' : 'bg-slate-200'
                      }`}
                    />

                    {activeSection.content ? (
                      <div
                        className={`prose prose-sm max-w-none leading-relaxed whitespace-pre-wrap ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        {activeSection.content}
                      </div>
                    ) : (
                      <div
                        className={`p-10 text-center rounded-xl border-2 border-dashed ${
                          isDark
                            ? 'border-slate-700 text-slate-500'
                            : 'border-slate-300 text-slate-400'
                        }`}
                      >
                        <FileText size={40} className="mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-bold">{t('no_content_yet')}</p>
                      </div>
                    )}
                  </>
                )
              ) : (
                <div
                  className={`p-10 text-center ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  <FileText size={40} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-bold">{t('select_a_section_from_the')}</p>
                </div>
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}