import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { Category, Lesson } from '../data';
import { BackButton } from '@/components/ui/BackButton';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  pickedCategory: Category;
  lessons: Lesson[];
  loading: boolean;
  onBack: () => void;
  onSelectLesson: (l: Lesson) => void;
};

export default function LessonsView({
  isDark, pickedCategory, lessons, loading, onBack, onSelectLesson,
}: Props) {
    const t = useTranslations('components_screens_summaries_views_LessonsView');
  const backBtnClass = `flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all duration-300 shadow-sm hover:scale-[1.03] active:scale-[0.97] ${
    isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
           : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
  }`;
  const cardCls = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const titleCls = isDark ? 'text-white' : 'text-slate-900';
  const mutedCls = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="w-full animate-fade-in max-w-6xl mx-auto space-y-4 sm:space-y-5 py-2 sm:py-4">
      <BackButton onClick={onBack} label={t('back')} />

      <div className={`relative overflow-hidden p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 grain-overlay ${
        isDark ? 'bg-gradient-to-br from-emerald-950/60 to-teal-950/60 border-emerald-800/50'
               : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-emerald-200'
      }`}>
        <div className={`absolute -top-12 -end-12 w-48 h-48 rounded-full blur-3xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-400/30'}`} />
        <div className="relative z-10 flex items-center gap-3 sm:gap-4">
          <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl shrink-0 ${isDark ? 'bg-slate-900 border border-emerald-500/40' : 'bg-white border border-emerald-300'}`}>
            {pickedCategory.icon || '📖'}
          </div>
          <div className="min-w-0">
            <h2 className={`text-base sm:text-2xl font-black truncate ${titleCls}`}>{pickedCategory.name_en}</h2>
            <p className={`text-[10px] sm:text-xs ${mutedCls}`}>{lessons.length} lessons</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20"><Loader2 size={36} className="animate-spin text-emerald-500 mx-auto" /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {lessons.map((l, idx) => (
            <button key={l.id} onClick={() => onSelectLesson(l)}
              className={`group rounded-xl sm:rounded-2xl border-2 text-start transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98] overflow-hidden ${cardCls} ${
                isDark ? 'hover:border-emerald-600' : 'hover:border-emerald-400'
              }`}>
              {l.image_url && (
                <div className="w-full h-24 sm:h-36 overflow-hidden">
                  <img src={l.image_url} alt={l.name_en} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              )}
              <div className="p-3 sm:p-5">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <span className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-[10px] sm:text-sm ${isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>{idx + 1}</span>
                  <ChevronRight size={14} className="ms-auto text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className={`text-xs sm:text-base font-black mb-1 leading-tight ${titleCls}`}>{l.name_en}</h3>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}