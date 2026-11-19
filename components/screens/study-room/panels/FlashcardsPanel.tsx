'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useCloudState } from '@/lib/useCloudState';
import { fetchQuestionsByIds, type DeckQ } from '@/lib/studyDeck';
import SaveBadge from '../ui/SaveBadge';
import Tip from '../ui/Tip';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  userId?: string;
  panelId: string;
  mistakes: number[];
  flagged: number[];
  notes: Record<string, string>;
  due: number[];
};
type Src = 'due' | 'mistakes' | 'flagged' | 'notes';
type Deck = Record<string, { box: number; due: number }>;

const DAY = 86400000;
const GAPS = [1, 3, 7, 14, 30];       // بالأيام: كل مرة تقول "Got it" الكارت يتباعد أكتر

const LABEL: Record<Src, string> = { due: 'Due', mistakes: 'Mistakes', flagged: 'Flagged', notes: 'Notes' };
const TIPS: Record<Src, string> = {
  due: 'Questions the main bank scheduled for review today, based on spaced repetition.',
  mistakes: 'Questions you answered wrong and have not corrected yet.',
  flagged: 'Questions you flagged in the main bank.',
  notes: 'Questions where you wrote a personal note. The note shows on the back of the card.',
};

export default function FlashcardsPanel({ userId, panelId, mistakes, flagged, notes, due }: Props) {
    const t = useTranslations('components_screens_study_room_panels_FlashcardsPanel');
  const noteIds = useMemo(() => Object.keys(notes || {}).map(Number).filter((n) => !isNaN(n)), [notes]);
  const bySrc: Record<Src, number[]> = { due, mistakes, flagged, notes: noteIds };

  const [src, setSrc] = useState<Src>(due.length ? 'due' : 'mistakes');
  const [includeAll, setIncludeAll] = useState(false);
  const [deck, setDeck, { ready, status }] = useCloudState<Deck>(userId, `deck:${panelId}`, {});
  const deckRef = useRef(deck);
  deckRef.current = deck;

  const [cards, setCards] = useState<Record<number, DeckQ>>({});
  const [queue, setQueue] = useState<number[]>([]);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(0);
  const [later, setLater] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  const ids = bySrc[src];
  const idsKey = ids.join(',');

  // بناء الطابور: بس عند تغيير المصدر أو القايمة (مش مع كل تقييم)
  useEffect(() => {
    if (!ready) return;
    let alive = true;
    setLoading(true);
    (async () => {
      const list = await fetchQuestionsByIds(panelId, ids);
      if (!alive) return;
      const map: Record<number, DeckQ> = {};
      list.forEach((c) => (map[c.id] = c));
      const now = Date.now();
      const q = list.filter((c) => includeAll || !(deckRef.current[c.id] && deckRef.current[c.id].due > now)).map((c) => c.id);
      setCards(map); setQueue(q); setTotal(q.length); setDone(0);
      setLater(list.length - q.length); setFlipped(false); setLoading(false);
    })();
    return () => { alive = false; };
  }, [src, idsKey, includeAll, ready, panelId]); // eslint-disable-line

  const rate = (good: boolean) => {
    const id = queue[0];
    if (id == null) return;
    if (good) {
      const box = Math.min(5, (deckRef.current[id]?.box ?? 0) + 1);
      setDeck((d) => ({ ...d, [id]: { box, due: Date.now() + GAPS[box - 1] * DAY } }));
      setQueue((q) => q.slice(1));
      setDone((n) => n + 1);
    } else {
      setDeck((d) => ({ ...d, [id]: { box: 1, due: Date.now() } }));
      setQueue((q) => [...q.slice(1), id]);               // يرجع في آخر الطابور
    }
    setFlipped(false);
  };

  // كيبورد: Space = قلب، 1 = Again، 2 = Got it
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.code === 'Space' && tag !== 'BUTTON') { e.preventDefault(); setFlipped((f) => !f); }
      else if (flipped && e.key === '1') rate(false);
      else if (flipped && e.key === '2') rate(true);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [flipped, queue]); // eslint-disable-line

  const card = queue.length ? cards[queue[0]] : null;
  const note = card ? notes?.[String(card.id)] : '';
  const correctOpt = card?.opts.find((o) => o.letter === card.correct);

  return (
    <div className="sr-fc">
      <div className="sr-row-between">
        <p className="sr-sub" style={{ margin: 0 }}>{t('cards_come_from_your_main')}</p>
        <SaveBadge status={status} />
      </div>

      <div className="sr-fc-src" role="tablist">
        {(Object.keys(LABEL) as Src[]).map((k) => (
          <Tip key={k} text={TIPS[k]} side="bottom"><button role="tab" aria-selected={src === k} className={src === k ? 'on' : ''} onClick={() => setSrc(k)}>
            <b>{bySrc[k].length}</b>{LABEL[k]}
          </button></Tip>
        ))}
      </div>

      {loading || !ready ? (
        <div className="sr-skel tall" />
      ) : ids.length === 0 ? (
        <p className="sr-history-empty">
          {src === 'due' && 'Nothing due. Questions you miss in the main bank are scheduled here automatically.'}
          {src === 'mistakes' && 'No mistakes right now. Wrong answers in the main bank will appear here.'}
          {src === 'flagged' && 'No flagged questions. Flag a question in the main bank to review it here.'}
          {src === 'notes' && 'No notes yet. Add a note to a question in the main bank and it shows up here.'}
        </p>
      ) : !card ? (
        <div className="sr-card sr-fc-done">
          <div className="sr-ring-mini full" style={{ ['--p' as any]: 100 }}><b>✓</b></div>
          <h3>{done > 0 ? `${done} card${done === 1 ? '' : 's'} reviewed` : t('all_caught_up')}</h3>
          <p className="sr-sub">{later > 0 ? `${later} more scheduled for later days.` : t('nothing_left_in_this_group')}</p>
          {!includeAll && later > 0 && <button className="sr-apply" onClick={() => setIncludeAll(true)}>{t('review_them_anyway')}</button>}
          {includeAll && <button className="sr-apply" onClick={() => setIncludeAll(false)}>{t('back_to_due_only')}</button>}
        </div>
      ) : (
        <>
          <div className="sr-fc-top">
            <div className="sr-bar"><i style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
            <span>{done}/{total}</span>
          </div>

          <div className={`sr-card3d ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped((f) => !f)} role="button" tabIndex={0}
            aria-label={flipped ? 'Show question' : 'Show answer'}
            onKeyDown={(e) => { if (e.key === 'Enter') setFlipped((f) => !f); }}>
            <div className="sr-card3d-in">
              <div className="sr-face front" aria-hidden={flipped}>
                <span className="sr-cat">{card.cat}</span>
                <p className="sr-q">{card.q}</p>
                <ul className="sr-opts">
                  {card.opts.map((o) => <li key={o.letter}><span>{o.letter}</span>{o.text}</li>)}
                </ul>
                <p className="sr-flip-hint">{t('tap_to_flip_space')}</p>
              </div>

              <div className="sr-face back" aria-hidden={!flipped}>
                <span className="sr-cat">{card.cat}</span>
                <div className="sr-ans"><span>{card.correct}</span><b>{correctOpt?.text}</b></div>
                {card.explanation && <p className="sr-expl">{card.explanation}</p>}
                {note && <div className="sr-note-box"><small>{t('your_note')}</small>{note}</div>}
              </div>
            </div>
          </div>

          {flipped ? (
            <div className="sr-rate">
              <Tip text="Not yet. The card comes back at the end of this round. Shortcut: 1." side="top"><button className="again" onClick={() => rate(false)}>{t('again')} <kbd>1</kbd></button></Tip>
              <Tip text="You remembered it. The card returns after 1 day, then 3, 7, 14 and 30 days. Shortcut: 2." side="top"><button className="good" onClick={() => rate(true)}>{t('got_it')} <kbd>2</kbd></button></Tip>
            </div>
          ) : (
            <Tip text="Flip the card to see the answer and the explanation. Shortcut: Space." side="top"><button className="sr-apply" onClick={() => setFlipped(true)}>{t('show_answer')}</button></Tip>
          )}
        </>
      )}
    </div>
  );
}
