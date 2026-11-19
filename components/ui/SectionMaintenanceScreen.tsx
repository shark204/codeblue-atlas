'use client';
import { Wrench, ArrowLeft, RefreshCw } from 'lucide-react';
import { BackButton } from '../ui/BackButton';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  sectionName: string;
  isDark: boolean;
  onBack: () => void;
};

export default function SectionMaintenanceScreen({ sectionName, isDark, onBack }: Props) {
    const t = useTranslations('components_ui_SectionMaintenanceScreen');
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className={`text-center max-w-md p-8 rounded-3xl border shadow-xl ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <Wrench size={64} className="mx-auto mb-4 text-amber-500" />
        <h2 className="text-2xl font-black mb-2">{sectionName} تحت الصيانة</h2>
        <p className="text-sm text-slate-500 mb-6">
          إحنا بنطور القسم ده عشان يبقى أحسن ليك. جرب تاني بعد شوية.
        </p>
        <div className="flex gap-3 justify-center">
<BackButton onClick={onBack} label={t('back')} />
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-xl transition-all flex items-center gap-2"
          >
            <RefreshCw size={16} /> {t('retry')}
                                </button>
        </div>
      </div>
    </div>
  );
}