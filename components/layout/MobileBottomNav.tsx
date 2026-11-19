'use client';
import { useRouter, usePathname } from 'next/navigation';
import { Home as HomeIcon, Wrench, Settings } from 'lucide-react';
import { IconBrain, IconGraduation, IconTimer, IconChart } from '../ui/Icons';
import { useUIStore } from '../../stores/uiStore';
import { useTranslations } from "@/stores/languageStore";

export default function MobileBottomNav() {
    const t = useTranslations('components_layout_MobileBottomNav');
  const router = useRouter();
  const pathname = usePathname();
  const setShowToolsModal = useUIStore(s => s.setShowToolsModal);
  const showToolsModal = useUIStore(s => s.showToolsModal);
  const theme = useUIStore(s => s.theme);
  const isDark = theme === 'dark';

  if (pathname === '/features') return null;

  return (
    <nav className={`lg:hidden fixed bottom-0 start-0 end-0 z-40 border-t backdrop-blur-2xl pb-[env(safe-area-inset-bottom)] ${isDark ? 'bg-transparent border-slate-700/20' : 'bg-transparent border-white/20'}`}>
      <div className="grid grid-cols-6 max-w-md mx-auto">
        <button onClick={() => router.push('/')} className={`flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${isDark ? 'text-slate-200' : 'text-slate-500'}`}>
          <HomeIcon size={20} /><span className="text-[9px] font-bold">{t('home')}</span>
        </button>

        <button onClick={() => router.push('/dashboard')} className={`flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${pathname === '/dashboard' || pathname === '/practice' ? (isDark ? 'text-sky-400' : 'text-blue-600') : (isDark ? 'text-slate-200' : 'text-slate-500')}`}>
          <IconBrain /><span className="text-[9px] font-bold">{t('bank')}</span>
        </button>

        <button onClick={() => setShowToolsModal(true)} className={`flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${showToolsModal ? (isDark ? 'text-rose-400' : 'text-rose-600') : (isDark ? 'text-slate-200' : 'text-slate-500')}`}>
          <Wrench size={20} /><span className="text-[9px] font-bold">{t('tools')}</span>
        </button>

        <button onClick={() => router.push('/exam')} className={`flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${pathname?.startsWith('/exam') ? (isDark ? 'text-purple-400' : 'text-purple-600') : (isDark ? 'text-slate-200' : 'text-slate-500')}`}>
          <IconTimer /><span className="text-[9px] font-bold">{t('exam')}</span>
        </button>

        <button onClick={() => router.push('/analytics')} className={`flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${pathname === '/analytics' ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-slate-200' : 'text-slate-500')}`}>
          <IconChart /><span className="text-[9px] font-bold">{t('stats')}</span>
        </button>

        <button onClick={() => router.push('/settings')} className={`flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${pathname === '/settings' ? (isDark ? 'text-amber-400' : 'text-amber-600') : (isDark ? 'text-slate-200' : 'text-slate-500')}`}>
          <Settings size={20} /><span className="text-[9px] font-bold">{t('profile')}</span>
        </button>
      </div>
    </nav>
  );
}