'use client';
import { ArrowLeft } from 'lucide-react';
import { useUIStore, type PanelId } from '../../stores/uiStore';
import XPBadges from '../engagement/XPBadges';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  session: any;
  onBack: () => void;
};

export default function BadgesScreen({ isDark, session, onBack }: Props) {
    const t = useTranslations('components_screens_BadgesScreen');
  const currentPanel = useUIStore(s => s.currentPanel) as PanelId;

  return (
    <div className="w-full animate-fade-in space-y-6">
      <div className="flex justify-start mb-2">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all shadow-sm ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ArrowLeft size={16} className="inline me-1" /> {t('back_to_dashboard')}
                          </button>
      </div>

      <h2 className={`text-2xl lg:text-3xl font-black tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
        {t('badges_xp')}
                    </h2>

      <XPBadges isDark={isDark} session={session} panelId={currentPanel} />
    </div>
  );
}