'use client';
import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { useCloudState } from '@/lib/useCloudState';
import SaveBadge from '../ui/SaveBadge';
import Tip from '../ui/Tip';
import { useTranslations } from "@/stores/languageStore";

type Parked = { id: number; t: string; done: boolean };
type NotesData = { pad: string; parked: Parked[] };

export default function NotesPanel({ userId }: { userId?: string }) {
    const t = useTranslations('components_screens_study_room_panels_NotesPanel');
  const [data, setData, { status, ready }] = useCloudState<NotesData>(userId, 'notes', { pad: '', parked: [] });
  const [view, setView] = useState<'pad' | 'park'>('pad');
  const [draft, setDraft] = useState('');

  const open = data.parked.filter((p) => !p.done).length;

  const park = () => {
    const t = draft.trim();
    if (!t) return;
    setData((d) => ({ ...d, parked: [{ id: Date.now(), t, done: false }, ...d.parked] }));
    setDraft('');
  };

  return (
    <div className="sr-notes">
      <div className="sr-row-between">
        <div className="sr-seg wide" role="tablist">
          <Tip text="A scratchpad that saves as you type. Use it for anything you want to remember." side="bottom"><button role="tab" aria-selected={view === 'pad'} className={view === 'pad' ? 'on' : ''} onClick={() => setView('pad')}>{t('notes')}</button></Tip>
          <Tip text="A distracting thought? Park it here, get back to focus, and deal with it during your break." side="bottom"><button role="tab" aria-selected={view === 'park'} className={view === 'park' ? 'on' : ''} onClick={() => setView('park')}>
            Parking lot{open > 0 && <b className="sr-count">{open}</b>}
          </button></Tip>
        </div>
        <SaveBadge status={status} />
      </div>

      {!ready ? (
        <div className="sr-skel" />
      ) : view === 'pad' ? (
        <>
          <textarea
            className="sr-pad"
            value={data.pad}
            onChange={(e) => setData((d) => ({ ...d, pad: e.target.value }))}
            placeholder={t('jot_down_anything_you_want')}
            aria-label={t('scratchpad')}
            spellCheck={false}
          />
          <p className="sr-sub">{data.pad.length.toLocaleString()} characters</p>
        </>
      ) : (
        <>
          <div className="sr-add">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && park()}
              placeholder={t('park_a_thought_for_later')}
              aria-label={t('park_a_thought')}
            />
            <Tip text="Save this thought for later and go back to studying." side="bottom"><button onClick={park}>{t('park')}</button></Tip>
          </div>
          <ul className="sr-parked">
            {data.parked.map((p) => (
              <li key={p.id} className={p.done ? 'done' : ''}>
                <button className="chk" aria-label={p.done ? 'Mark as open' : 'Mark as handled'} onClick={() => setData((d) => ({ ...d, parked: d.parked.map((x) => x.id === p.id ? { ...x, done: !x.done } : x) }))}>
                  {p.done && <Check size={12} strokeWidth={3} />}
                </button>
                <span>{p.t}</span>
                <button className="del" aria-label={t('delete')} onClick={() => setData((d) => ({ ...d, parked: d.parked.filter((x) => x.id !== p.id) }))}><Trash2 size={13} /></button>
              </li>
            ))}
            {!data.parked.length && <li className="empty">{t('nothing_parked_when_something_pulls')}</li>}
          </ul>
        </>
      )}
    </div>
  );
}
