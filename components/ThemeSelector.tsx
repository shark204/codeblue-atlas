'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Check } from 'lucide-react';
import { TOPBAR_CONFIG } from '@/config/topbar';
import { useUIStore } from '../stores/uiStore';
import { useTranslations } from "@/stores/languageStore";

export function ThemeSelector() {
    const t = useTranslations('components_ThemeSelector');
  const [mounted, setMounted] = useState(false);
  const theme = useUIStore(s => s.theme);
  const isDark = theme === 'dark';
  const toggleTheme = useUIStore(s => s.toggleTheme);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    if (theme === newTheme) return;
    
    // 1. تغيير الستور
    toggleTheme();
    
    // 2. تغيير كلاس الـ HTML
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.dataset.theme = 'dark';
    } else {
      root.classList.remove('dark');
      root.dataset.theme = 'light';
    }
    
    // 3. حفظ في المتصفح
    try { localStorage.setItem('codeblue_theme', newTheme); } catch {}
    
    // 4. تغيير السما
    window.dispatchEvent(new CustomEvent('sky:mode', { detail: newTheme === 'dark' ? 'night' : 'day' }));
    try { localStorage.setItem('sky:manual-mode', newTheme === 'dark' ? 'night' : 'day'); } catch {}
  };

  if (!mounted) return null;

  const options = [
    { value: 'light', label: t('light'), icon: Sun },
    { value: 'dark', label: t('dark'), icon: Moon },
  ] as const;

  return (
    <div className="flex flex-col gap-1">
      <span className={`text-xs font-semibold px-3 py-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('theme')}</span>
      <div className="flex items-center gap-1 px-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={(e) => {
              e.stopPropagation();
              handleThemeChange(opt.value);
            }}
            className={`relative flex flex-1 items-center justify-center rounded-lg transition-colors ${
              theme === opt.value 
                ? (isDark ? 'bg-white/10 text-cyan-400' : 'bg-slate-100 text-blue-600') 
                : (isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-500')
            }`}
            style={{ height: TOPBAR_CONFIG.themeSelector.height }}
          >
            <opt.icon size={16} />
            {theme === opt.value && (
              <Check size={12} className={`absolute top-1 end-1 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}