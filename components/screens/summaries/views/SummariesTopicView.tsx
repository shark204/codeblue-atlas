import { BackButton } from '@/components/ui/BackButton';
import { ChevronRight, Loader2, Lock } from 'lucide-react';
import { CURRICULUM_DATA } from '../data';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  subject: string;
  topics: { name: string; count: number }[];
  loading: boolean;
  onBack: () => void;
  onSelectTopic: (name: string) => void;
};

export default function SummariesTopicView({
  isDark, subject, topics, loading, onBack, onSelectTopic,
}: Props) {
  const t = useTranslations('components_screens_summaries_views_SummariesTopicView');
  const activeCardCls = isDark
    ? 'bg-slate-900/65 border-slate-800 backdrop-blur-xl hover:border-emerald-500'
    : 'bg-white/25 border-white/55 backdrop-blur-xl hover:bg-white/40 hover:border-emerald-400 shadow-[0_12px_30px_-14px_rgba(14,116,144,0.16)]';

  const inactiveCardCls = isDark
    ? 'bg-slate-950/85 border-slate-800/50 opacity-65 cursor-not-allowed'
    : 'bg-slate-900/42 border-slate-600/35 opacity-80 cursor-not-allowed backdrop-blur-md';

  const titleCls = isDark ? 'text-white' : 'text-slate-900';
  const mutedCls = isDark ? 'text-slate-400' : 'text-slate-700';

  return (
    <div className="w-full animate-fade-in max-w-5xl mx-auto space-y-4 sm:space-y-6 py-2 sm:py-4">
      <BackButton onClick={onBack} label={t('back')} />
      <div className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border ${activeCardCls}`}>
        <h2 className={`text-base sm:text-xl font-black ${titleCls}`}>{subject}</h2>
        <p className={`text-[10px] sm:text-xs font-semibold ${mutedCls}`}>{topics.length} topics</p>
      </div>
      {loading ? (
        <div className="text-center py-20">
          <Loader2 size={36} className="animate-spin text-emerald-500 mx-auto" />
        </div>
      ) : topics.length === 0 ? (
        <div className={`p-8 rounded-2xl border text-center ${inactiveCardCls}`}>
          <Lock size={28} className="mx-auto mb-2 text-amber-400" />
          <p className="text-sm font-black text-white">{t('content_is_coming_soon')}</p>
          <p className="text-xs mt-1 text-slate-300">{t('no_open_topics_available_in')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {topics.map((topicItem) => {
            const hasStaticCurriculum = Boolean(CURRICULUM_DATA[subject]?.[topicItem.name]);
            const isOpen = topicItem.count > 0 || hasStaticCurriculum;
            const displayCount = hasStaticCurriculum
              ? CURRICULUM_DATA[subject][topicItem.name].length
              : topicItem.count;

            return (
              <button
                key={topicItem.name}
                onClick={() => onSelectTopic(topicItem.name)}
                className={`group p-3.5 sm:p-4 rounded-lg sm:rounded-xl border text-start transition-all ${
                  isOpen
                    ? `${activeCardCls} hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer`
                    : inactiveCardCls
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p
                      className={`text-xs sm:text-sm font-black truncate ${
                        isOpen ? titleCls : isDark ? 'text-slate-400' : 'text-slate-200'
                      }`}
                    >
                      {topicItem.name}
                    </p>
                    <p
                      className={`text-[10px] sm:text-[11px] font-semibold mt-0.5 ${
                        isOpen ? mutedCls : isDark ? 'text-slate-500' : 'text-slate-300'
                      }`}
                    >
                      {isOpen ? `${displayCount} modules` : t('coming_soon')}
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronRight
                      size={16}
                      className="shrink-0 text-emerald-500 group-hover:translate-x-1 transition-all"
                    />
                  ) : (
                    <Lock size={15} className="shrink-0 text-slate-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}