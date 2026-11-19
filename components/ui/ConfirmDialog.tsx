'use client';
import { AlertCircle } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useTranslations } from "@/stores/languageStore";

export default function ConfirmDialog() {
    const t = useTranslations('components_ui_ConfirmDialog');
  const dialog = useUIStore(s => s.confirmDialog);
  const setConfirmDialog = useUIStore(s => s.setConfirmDialog);
  const theme = useUIStore(s => s.theme);
  const isDark = theme === 'dark';

  if (!dialog?.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div
        className={`w-full max-w-md p-6 lg:p-8 rounded-3xl shadow-2xl border ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-center mb-5">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-100 text-amber-600'
            }`}
          >
            <AlertCircle size={32} />
          </div>
        </div>

        <p
          className={`text-center text-base font-bold mb-8 leading-relaxed ${
            isDark ? 'text-slate-200' : 'text-slate-800'
          }`}
        >
          {dialog.text}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setConfirmDialog(null)}
            className={`flex-1 py-3 font-bold rounded-xl text-sm transition-all ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {t('cancel')}
                                </button>
          <button
            onClick={() => dialog.action()}
            className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-sm shadow-lg transition-transform active:scale-95"
          >
            {t('confirm')}
                                </button>
        </div>
      </div>
    </div>
  );
}