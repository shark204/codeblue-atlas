'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { useTranslations } from "@/stores/languageStore";

export function SoundSwitch() {
    const t = useTranslations('components_SoundSwitch');
  const [mounted, setMounted] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const theme = useUIStore(s => s.theme);
  const isDark = theme === 'dark';

  useEffect(() => {
    setMounted(true);
    try { setSoundOn(localStorage.getItem('sky:rain-sound') !== '0'); } catch {}
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    try { localStorage.setItem('sky:rain-sound', next ? '1' : '0'); } catch {}
    window.dispatchEvent(new CustomEvent('sky:sound', { detail: next ? 'on' : 'off' }));
    try { localStorage.setItem('sky:rain-override', next ? 'on' : 'off'); } catch {}
    window.dispatchEvent(new CustomEvent('sky:rain', { detail: next ? 'on' : 'off' }));
  };

  if (!mounted) return null;

  return (
    <div onClick={(e) => { e.stopPropagation(); toggleSound(); }} className={`flex items-center justify-between px-3 transition-colors rounded-lg cursor-pointer ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`} style={{ height: 40 }}>
      <div className={`flex items-center gap-3 text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} className="text-rose-500" />}
        <span>{t('sound_rain')}</span>
      </div>
      <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${soundOn ? 'bg-cyan-500' : (isDark ? 'bg-slate-600' : 'bg-slate-300')}`}>
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${soundOn ? 'translate-x-5' : 'translate-x-1'}`} />
      </div>
    </div>
  );
}