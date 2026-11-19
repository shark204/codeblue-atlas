'use client';
import { Sparkles, ArrowLeft, Check } from 'lucide-react';
import { IconBrain, IconTarget, IconChart, IconGallery, IconTimer, IconMobile } from '../ui/Icons';
import { BackButton } from '../ui/BackButton';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  onBack: () => void;
};

export default function FeaturesScreen({ isDark, onBack }: Props) {
    const t = useTranslations('components_screens_FeaturesScreen');
  const features = [
    { icon: <IconBrain size={22} />, title: t('smart_spaced_repetition'), desc: t('anki_style_algorithm_schedules_your'), color: 'sky' },
    { icon: <IconTarget size={22} />, title: t('target_goal_tracker'), desc: t('set_exam_date_and_get'), color: 'emerald' },
    { icon: <IconChart size={22} />, title: t('weakness_radar'), desc: t('analytics_that_pinpoint_your_lowest'), color: 'rose' },
    { icon: <IconGallery size={22} />, title: t('visual_review_gallery'), desc: t('browse_flagged_and_incorrect_questions'), color: 'amber' },
    { icon: <IconTimer size={22} />, title: t('realistic_mock_exams'), desc: '60 questions in 60 minutes - simulate the real exam environment.', color: 'purple' },
    { icon: <IconMobile size={22} />, title: t('mobile_first_premium_ui'), desc: t('buttery_smooth_performance_optimized_for'), color: 'teal' },
  ];

  return (
    <div className="w-full animate-fade-in max-w-2xl mx-auto space-y-4 py-4">
      <div className="flex justify-start">
        <BackButton onClick={onBack} label={t('back')} />
      </div>

      <div className="text-center mb-6">
        <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center ${isDark ? 'bg-sky-500/20 text-sky-400' : 'bg-sky-100 text-sky-600'}`}>
          <Sparkles size={28} />
        </div>
        <h1 className={`text-2xl font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('why_code_blue_bank')}</h1>
        <p className={`text-sm max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('all_the_powerful_features_in')}</p>
      </div>

      {features.map((f, i) => (
        <div key={i} className={`p-4 rounded-2xl border shadow-sm flex items-start gap-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            f.color === 'sky' ? (isDark ? 'bg-sky-900/40 text-sky-400' : 'bg-sky-100 text-sky-600') :
            f.color === 'emerald' ? (isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-600') :
            f.color === 'rose' ? (isDark ? 'bg-rose-900/40 text-rose-400' : 'bg-rose-100 text-rose-600') :
            f.color === 'amber' ? (isDark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-100 text-amber-600') :
            f.color === 'purple' ? (isDark ? 'bg-purple-900/40 text-purple-400' : 'bg-purple-100 text-purple-600') :
            (isDark ? 'bg-teal-900/40 text-teal-400' : 'bg-teal-100 text-teal-600')
          }`}>
            {f.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Check size={16} className="text-emerald-500 shrink-0" />
              <h3 className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{f.title}</h3>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{f.desc}</p>
          </div>
        </div>
      ))}

      <div className="text-center pt-4 pb-8">
        <BackButton onClick={onBack} label={t('back_to_home')} />
      </div>
    </div>
  );
}