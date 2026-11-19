'use client';

import { ChevronLeft, ChevronRight, NotebookPen } from 'lucide-react';
import NotesPanel from './NotesPanel';
import { useTranslations } from "@/stores/languageStore";

/* Always-open Notes dock, left of the timer.
 * Reuses your existing NotesPanel (same saved data), just framed as a dock.
 * The arrow on top hides / shows this dock together with DayBoard. */

type Props = { isDark: boolean; userId?: string; open: boolean; onToggle: () => void };

export default function NotesDock({ isDark, userId, open, onToggle }: Props) {
    const t = useTranslations('components_screens_study_room_panels_NotesDock');
  if (!open) {
    return (
      <aside className={`nd closed ${isDark ? 'dark' : 'light'}`} aria-label={t('notes_hidden')}>
        <style>{css}</style>
        <button className="nd-fold" onClick={onToggle} aria-label={t('show_side_panels')} title={t('show_notes_and_plan')}>
          <ChevronRight size={16} />
        </button>
        <NotebookPen size={18} className="rail-ic" />
        <span className="rail-lb">{t('notes')}</span>
      </aside>
    );
  }

  return (
    <aside className={`nd ${isDark ? 'dark' : 'light'}`} aria-label={t('notes')}>
      <style>{css}</style>
      <header className="nd-head">
        <button className="nd-fold" onClick={onToggle} aria-label={t('hide_side_panels')} title={t('hide_notes_and_plan')}>
          <ChevronLeft size={16} />
        </button>
        <NotebookPen size={16} />
        <h3>{t('notes')}</h3>
        <small>{t('saves_as_you_type')}</small>
      </header>
      <div className="nd-body">
        <NotesPanel userId={userId} />
      </div>
    </aside>
  );
}

const css = `
.nd{
  --line:rgba(255,255,255,.1); --ink:#eef2ff; --mut:#9aa7cf; --cy:#38d6f5; --fld:rgba(255,255,255,.06); --warn:#fbbf24;
  position:sticky; top:12px; display:flex; flex-direction:column;
  height:clamp(520px, calc(100vh - 150px), 760px); padding:14px; border-radius:24px; color:var(--ink);
  background:linear-gradient(180deg, rgba(20,28,66,.62), rgba(10,15,40,.68));
  border:1px solid var(--line); backdrop-filter:blur(22px); -webkit-backdrop-filter:blur(22px);
  box-shadow:0 30px 80px -30px rgba(0,0,0,.7), 0 0 60px -30px rgba(167,139,250,.3);
}
.nd.light{
  --line:rgba(15,23,42,.12); --ink:#0f172a; --mut:#475569; --cy:#0284c7; --fld:rgba(15,23,42,.05); --warn:#b45309;
  background:linear-gradient(180deg, rgba(255,255,255,.86), rgba(240,249,255,.8));
  box-shadow:0 24px 60px -24px rgba(14,116,144,.3);
}
.nd *{box-sizing:border-box}
:where(.nd) button{font:inherit; color:inherit; cursor:pointer; border:0; background:none}
.nd :focus-visible{outline:2px solid var(--cy); outline-offset:2px}
.nd-head{display:flex; align-items:center; gap:8px; margin-bottom:12px}
.nd-head > svg{color:#a78bfa}
.nd-head h3{margin:0; font-size:15px; font-weight:800}
.nd-head small{margin-inline-start:auto; font-size:11.5px; color:var(--mut)}
.nd-fold{flex:none; width:30px; height:30px; display:grid; place-items:center; border-radius:50%; background:var(--fld); border:1px solid var(--line); transition:border-color .2s, background .2s}
.nd-fold:hover{border-color:var(--cy); background:rgba(56,214,245,.14)}
.nd-body{flex:1; min-height:0; overflow-y:auto; overflow-x:hidden; overscroll-behavior:contain; scrollbar-width:thin; scrollbar-color:rgba(148,163,184,.3) transparent}

.nd.closed{height:auto; padding:10px 0; align-items:center; gap:12px}
.nd.closed .rail-ic{color:#a78bfa}
.nd .rail-lb{writing-mode:vertical-rl; transform:rotate(180deg); font-size:12px; font-weight:700; color:var(--mut); letter-spacing:.03em}
@media (max-width:1100px){
  .nd{height:auto !important}
  .nd.closed{flex-direction:row; justify-content:center; padding:10px 14px}
  .nd .rail-lb{writing-mode:horizontal-tb; transform:none}
}

.nd-body{padding:0}
/* keep whatever NotesPanel renders inside the dock's width */
.nd-body > *{width:100%; max-width:100%; min-width:0; margin-inline:0}
.nd-body *{max-width:100%; min-width:0}
.nd-body [role="tablist"]{flex-wrap:wrap}
/* fallbacks only (zero specificity): your NotesPanel styles win if they exist */
:where(.nd-body) textarea, :where(.nd-body) input[type="text"], :where(.nd-body) input:not([type]){
  width:100%; padding:10px 12px; border-radius:12px; font:inherit; font-size:14px; color:var(--ink);
  background:var(--fld); border:1px solid var(--line);
}
:where(.nd-body) textarea{min-height:200px; resize:vertical; line-height:1.7}
:where(.nd-body) textarea:focus, :where(.nd-body) input:focus{outline:none; border-color:var(--cy); box-shadow:0 0 0 3px rgba(56,214,245,.14)}
`;