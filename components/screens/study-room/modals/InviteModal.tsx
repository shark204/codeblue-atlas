'use client';
import { Share2, Copy } from 'lucide-react';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  code: string;
  onCopy: () => void;
  onClose: () => void;
};

export default function InviteModal({ isDark, code, onCopy, onClose }: Props) {
    const t = useTranslations('components_screens_study_room_modals_InviteModal');
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className={`w-full max-w-sm p-6 rounded-3xl shadow-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className={`text-lg font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Share2 size={16} className="inline me-1" /> {t('invite_friends')}
                          </h3>
        <p className="text-xs text-slate-500 mb-4">{t('share_this_code_with_your')}</p>
        <div className={`p-4 rounded-2xl text-center mb-4 ${isDark ? 'bg-black' : 'bg-slate-100'}`}>
          <p className={`text-3xl font-black font-mono tracking-widest ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{code}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCopy} className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm">
            <Copy size={14} className="inline me-1" /> {t('copy_code')}
                                </button>
          <button onClick={onClose} className={`flex-1 py-3 font-bold rounded-xl text-sm ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{t('close')}</button>
        </div>
      </div>
    </div>
  );
}