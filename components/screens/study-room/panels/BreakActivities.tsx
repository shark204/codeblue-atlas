'use client';
import { useEffect, useState } from 'react';
import Tip from '../ui/Tip';
import { useTranslations } from "@/stores/languageStore";

const IDEAS = [
  { e: '👀', t: '20-20-20 for your eyes', d: 'Look at something 20 feet away for 20 seconds. Blink slowly a few times.' },
  { e: '💧', t: 'Drink a full glass of water', d: 'Dehydration quietly drains focus. Finish the glass before you sit back down.' },
  { e: '🧍', t: 'Stand up and reach high', d: 'Interlace your fingers, push your palms to the ceiling, and hold for 15 seconds.' },
  { e: '🔄', t: 'Neck and shoulder rolls', d: 'Five slow circles each way. Keep your jaw loose and your shoulders low.' },
  { e: '🚶', t: 'Walk for two minutes', d: 'Leave the desk. Movement clears the mental fog better than scrolling.' },
  { e: '🫶', t: 'Palm your eyes', d: 'Rub your hands warm, cup them over closed eyes, and rest in the dark for 30 seconds.' },
];
const PHASES = ['Breathe in', 'Hold', 'Breathe out', 'Hold'];

export default function BreakActivities() {
    const t = useTranslations('components_screens_study_room_panels_BreakActivities');
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % 4), 4000);
    return () => clearInterval(t);
  }, []);

  const idea = IDEAS[idx];
  const next = () => setIdx((i) => (i + 1) % IDEAS.length);

  return (
    <section className="sr-break" aria-label={t('break_activities')}>
      <Tip text="Box breathing: breathe in for 4 seconds, hold for 4, breathe out for 4, hold for 4. Follow the circle as it grows and shrinks." side="bottom"><div className="sr-breathe-wrap" aria-hidden="true">
        <div className="sr-breathe"><span>{PHASES[phase]}</span></div>
      </div></Tip>

      <div className="sr-break-body">
        <small>{done.size} of {IDEAS.length} done</small>
        <h4>{idea.e} {idea.t}</h4>
        <p>{idea.d}</p>
        <div className="sr-break-actions">
          <Tip text="Mark this activity as done and see the next idea." side="top"><button className="primary" onClick={() => { setDone((s) => new Set(s).add(idx)); next(); }}>
            {done.has(idx) ? t('done_again') : t('done')}
          </button></Tip>
          <Tip text="Show a different break suggestion." side="top"><button onClick={next}>{t('another_idea')}</button></Tip>
        </div>
        <div className="sr-break-dots">
          {IDEAS.map((x, i) => (
            <button key={i} className={`${i === idx ? 'cur' : ''} ${done.has(i) ? 'ok' : ''}`} aria-label={x.t} title={x.t} onClick={() => setIdx(i)}>{x.e}</button>
          ))}
        </div>
      </div>
    </section>
  );
}
