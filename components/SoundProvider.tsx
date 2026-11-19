// components/SoundProvider.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cbb-sound');
      if (saved) setIsMuted(saved === 'muted');
    } catch {}
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      try { localStorage.setItem('cbb-sound', next ? 'muted' : 'unmuted'); } catch {}
      return next;
    });
  };

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
}

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSound must be used within SoundProvider');
  return context;
};