'use client';
import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import type { CustomSession } from '../studyRoomData';
import Tip from '../ui/Tip';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  focusSetting: number;
  isTracking: boolean;
  isUnlimited: boolean;
  config: any;
  showHours: boolean;
  custom: CustomSession;
  onSaveCustom: (c: CustomSession) => void;
  onToggleHours: (v: boolean) => void;
  onChangeFocus: (v: number) => void;
  onLeave: () => void;
};

function Step({ label, tip, value, min, max, unit, onChange }: { label: string; tip: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void }) {
  return (
    <Tip text={tip} side="top">
      <div className="sr-step-row">
        <span>{label}</span>
        <div className="sr-stepper">
          <button aria-label={`Decrease ${label}`} onClick={() => onChange(Math.max(min, value - (unit === 'min' && value > 10 ? 5 : 1)))}><Minus size={14} /></button>
          <span>{value} {unit}</span>
          <button aria-label={`Increase ${label}`} onClick={() => onChange(Math.min(max, value + (unit === 'min' && value >= 10 ? 5 : 1)))}><Plus size={14} /></button>
        </div>
      </div>
    </Tip>
  );
}

export default function SettingsPanel({
  isDark, focusSetting, isTracking, isUnlimited, config, showHours, custom, onSaveCustom, onToggleHours, onChangeFocus, onLeave,
}: Props) {
    const t = useTranslations('components_screens_study_room_panels_SettingsPanel');
  const [draft, setDraft] = useState<CustomSession>(custom);
  useEffect(() => setDraft(custom), [custom]);
  const isCustom = focusSetting === 0;
  const dirty = draft.focus !== custom.focus || draft.brk !== custom.brk || draft.rounds !== custom.rounds;
  const total = draft.focus * draft.rounds + draft.brk * Math.max(0, draft.rounds - 1);

  return (
    <div className="sr-settings">
      <label className="sr-set">
        {t('focus_duration')}
                      <select value={String(focusSetting)} onChange={(e) => onChangeFocus(parseInt(e.target.value, 10))}>
          <option value="25">{t('25_min')}</option>
          <option value="50">{t('50_min')}</option>
          <option value="90">{t('90_min')}</option>
          <option value="0">{t('custom')}</option>
          <option value="-1">{t('unlimited')}</option>
          <option value="-2">{t('study_tracking_no_breaks')}</option>
        </select>
      </label>

      {isCustom && (
        <div className="sr-card sr-custom">
          <Step label={t('focus')} tip="How long each focus block lasts." value={draft.focus} min={5} max={180} unit="min" onChange={(v) => setDraft((d) => ({ ...d, focus: v }))} />
          <Step label={t('break')} tip="How long each break lasts between focus blocks." value={draft.brk} min={1} max={30} unit="min" onChange={(v) => setDraft((d) => ({ ...d, brk: v }))} />
          <Step label={t('rounds')} tip="How many focus blocks make up one full session. There is a break between each round." value={draft.rounds} min={1} max={8} unit={draft.rounds === 1 ? 'round' : 'rounds'} onChange={(v) => setDraft((d) => ({ ...d, rounds: v }))} />
          <p className="sr-sub">{draft.rounds} × {draft.focus} min focus · about {Math.floor(total / 60)}h {total % 60}m in total</p>
          <Tip text="Saves your custom session and restarts the timer with these lengths." side="top"><button className="sr-apply" disabled={!dirty} onClick={() => { onSaveCustom(draft); }}>
            {dirty ? t('apply_and_reset_timer') : t('applied')}
          </button></Tip>
        </div>
      )}

      <label className="sr-set row">
        {t('breaks')}
                      <span style={{ fontWeight: 700, color: 'var(--txt)' }}>
          {isTracking ? t('disabled') : isUnlimited ? `Every 30 min · ${config.breakDur / 60} min` : config.chunks === 1 ? 'None' : `${config.chunks - 1} breaks × ${config.breakDur / 60} min`}
        </span>
      </label>
      <label className="sr-set row">
        {t('show_others_hours')}
                      <input type="checkbox" className="sr-switch" checked={showHours} onChange={(e) => onToggleHours(e.target.checked)} />
      </label>
      <button className="sr-danger" onClick={onLeave}>{t('leave_room')}</button>
    </div>
  );
}
