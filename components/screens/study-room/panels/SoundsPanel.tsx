'use client';
import { Loader2 } from 'lucide-react';
import { SOUNDS } from '../studyRoomData';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  levels: Record<string, number>;
  loadingIds: Record<string, boolean>;
  setLevel: (id: string, v: number) => void;
};

export default function SoundsPanel({ levels, loadingIds, setLevel }: Props) {
    const t = useTranslations('components_screens_study_room_panels_SoundsPanel');
  return (
    <div className="sr-sounds">
      <p className="sr-note">{t('sounds_play_only_for_you')}</p>
      {SOUNDS.map((s) => {
        const isLoading = !!loadingIds[s.id];
        const Icon = s.Icon;
        return (
          <div key={s.id} className={`sr-sound ${levels[s.id] ? 'on' : ''}`}>
            <button onClick={() => setLevel(s.id, levels[s.id] ? 0 : 0.6)} aria-pressed={!!levels[s.id]} disabled={isLoading} style={{ opacity: isLoading ? 0.6 : 1 }}>
              <span>{isLoading ? <Loader2 size={18} className="animate-spin" /> : <Icon size={18} strokeWidth={1.9} />}</span>
              {isLoading ? t('loading') : s.label}
            </button>
            <input type="range" min="0" max="1" step="0.05" value={levels[s.id] || 0} onChange={(e) => setLevel(s.id, +e.target.value)} disabled={isLoading} aria-label={`${s.label} level`} />
          </div>
        );
      })}
    </div>
  );
}
