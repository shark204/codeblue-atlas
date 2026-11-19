'use client';
import { UserCog } from 'lucide-react';
import { VibeIcon, VIBE_KEYS } from '../../../../lib/vibeIcons';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  roomAlias: string;
  setRoomAlias: (v: string) => void;
  roomEmoji: string;
  setRoomEmoji: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
};

export default function StatusModal({
  isDark, roomAlias, setRoomAlias, roomEmoji, setRoomEmoji, onSave, onClose,
}: Props) {
    const t = useTranslations('components_screens_study_room_modals_StatusModal');
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className={`w-full max-w-md p-6 rounded-3xl shadow-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className={`text-lg font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <UserCog size={16} className="inline me-1" /> {t('update_your_status')}
                          </h3>
        <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('display_name')}</label>
        <input type="text" value={roomAlias} onChange={(e) => setRoomAlias(e.target.value)} className={`w-full p-3 rounded-xl border text-sm mb-4 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
        <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('your_vibe')}</label>
        <div className="mb-4 max-h-64 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-7 gap-2 p-1">
            {VIBE_KEYS.map((key) => {
              const isActive = roomEmoji === key;
              return (
                <button key={key} onClick={() => setRoomEmoji(key)} aria-label={key} className={`aspect-square flex items-center justify-center rounded-xl transition-all ${isActive ? 'bg-orange-500 text-white scale-110 shadow-lg shadow-orange-500/30' : (isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}`}>
                  <VibeIcon name={key} size={20} strokeWidth={2} />
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className={`flex-1 py-3 font-bold rounded-xl text-sm ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{t('cancel')}</button>
          <button onClick={onSave} className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl text-sm">{t('save')}</button>
        </div>
      </div>
    </div>
  );
}