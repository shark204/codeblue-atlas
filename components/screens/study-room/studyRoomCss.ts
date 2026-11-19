export const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Manrope:wght@400;500;600;700&display=swap');

.sr-root{
  --topbar-h:64px;
  --bg:#050816; --glass:rgba(255,255,255,.07); --glass2:rgba(255,255,255,.12); --line:rgba(255,255,255,.12);
  --txt:#eef1ff; --mut:#98a2c8; --cyan:#22d3ee; --violet:#a78bfa; --green:#34d399; --amber:#fbbf24;
  position:fixed; top:var(--topbar-h, 64px); left:0; right:0; bottom:0; z-index:30; display:flex; color:var(--txt); overflow:hidden;
  touch-action: pan-y; font-family:'Manrope',system-ui,sans-serif;
  background:radial-gradient(1100px 700px at 65% -10%, #16255a 0%, var(--bg) 62%);
}
/* ضبط ارتفاع الـ Docks (NotesDock & DayBoard) ليتناسب مع خصم --topbar-h دون قطع في الأسفل */
.sr-root .nd,
.sr-root .db-dock{
  height:clamp(460px, calc(100vh - var(--topbar-h, 64px) - 110px), 740px) !important;
}
.sr-root .nd.closed,
.sr-root .db-dock.closed{
  height:auto !important;
}
.sr-root.light{
  --bg:#f0f7ff; --glass:rgba(255,255,255,.72); --glass2:rgba(255,255,255,.92); --line:rgba(14,165,233,.18);
  --txt:#0f172a; --mut:#475569; --cyan:#0284c7; --violet:#7c3aed; --green:#059669; --amber:#d97706;
  background:radial-gradient(1100px 700px at 65% -10%, #bae6fd 0%, var(--bg) 62%);
}
.sr-root.break{--cyan:#34d399; --violet:#fbbf24}
.sr-root *{box-sizing:border-box}
.sr-root button{font-family:inherit; cursor:pointer; color:inherit}
.sr-root :focus-visible{outline:3px solid var(--cyan); outline-offset:2px}
.sr-bg{position:absolute; inset:0; pointer-events:none}
.sr-bg i{position:absolute; width:55vw; height:55vw; border-radius:50%; filter:blur(120px); opacity:.22; transition:background 1s}
.sr-bg i:first-child{background:var(--violet); top:-25vw; left:-10vw}
.sr-bg i:last-child{background:var(--cyan); bottom:-30vw; right:-15vw}

.sr-side{
  position:relative; z-index:6; width:84px; flex:none; display:flex; flex-direction:column; align-items:center; gap:6px;
  padding:16px 8px; background:rgba(8,12,34,.7); backdrop-filter:blur(20px); border-right:1px solid var(--line);
  height:100%; overflow-y:auto;
}
.sr-root.light .sr-side{background:rgba(255,255,255,.82); box-shadow:4px 0 24px -10px rgba(14,116,144,.15)}
.sr-brand{width:46px; height:46px; display:grid; place-items:center; font-size:22px; border-radius:15px; margin-bottom:12px;
  background:linear-gradient(140deg,var(--cyan),#2563eb 60%,var(--violet)); box-shadow:0 10px 24px -8px rgba(37,99,235,.7)}

/* ═══ Sidebar Buttons ═══ */
.sr-side button{
  width:68px; padding:12px 4px 10px; border:0; background:transparent; border-radius:16px; color:var(--mut);
  display:flex; flex-direction:column; align-items:center; gap:8px; font-size:11px; font-weight:600; 
  transition:all .2s; position:relative;
}
.sr-side button:hover{background:var(--glass); color:var(--txt)}
.sr-side button.on{background:var(--glass2); color:#fff; box-shadow:inset 0 0 0 1px var(--line), 0 8px 20px -10px var(--cyan)}
.sr-root.light .sr-side button.on{color:var(--txt)}
.sr-side button.on svg{color:var(--cyan)}
.sr-side .leave{margin-top:auto; color:#fda4af}
.sr-root.light .sr-side .leave{color:#e11d48}
.sr-side .leave:hover{background:rgba(244,63,94,.15)}

/* ═══ Disabled tab (Stickers when alone) ═══ */
.sr-side button.sr-tab-disabled{
  opacity:.35;
  cursor:not-allowed;
}
.sr-side button.sr-tab-disabled:hover{
  background:transparent;
  color:var(--mut);
}

/* ═══ Badge (Lock + 1) ═══ */
.sr-tab-badge {
  position: absolute;
  top: 2px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 999px;
  background: #1e293b;
  border: 1px solid #334155;
  color: #e2e8f0;
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
  pointer-events: none;
  box-shadow: 0 2px 6px rgba(0,0,0,.5);
  white-space: nowrap;
}

.sr-panel{
  position:relative; z-index:5; width:0; flex:none; overflow:hidden;
  background:rgba(10,15,40,.82); backdrop-filter:blur(24px); border-right:0 solid var(--line);
  transition:width .35s cubic-bezier(.2,.8,.2,1); height:100%;
}
.sr-root.light .sr-panel{background:rgba(255,255,255,.88); box-shadow:12px 0 36px -14px rgba(14,116,144,.2)}
.sr-panel.open{width:344px; border-right-width:1px}
.sr-panel-in{width:344px; height:100%; overflow-y:auto; padding:22px 20px 32px; animation:sr-fade .3s both}
@keyframes sr-fade{from{opacity:0; transform:translateX(12px)}to{opacity:1; transform:none}}
.sr-ph{display:flex; justify-content:space-between; align-items:center; margin-bottom:6px}
.sr-ph h2{margin:0; font-size:19px; font-weight:600}
.sr-ph button{width:34px; height:34px; border-radius:11px; border:0; background:var(--glass)}
.sr-ph button:hover{background:var(--glass2)}
.sr-note{color:var(--mut); font-size:13px; line-height:1.7; margin:4px 0 14px}

.sr-list{display:flex; flex-direction:column; gap:8px}
.sr-person{display:grid; grid-template-columns:22px 44px 1fr auto; gap:10px; align-items:center; padding:10px 12px; border-radius:16px; background:var(--glass); border:1px solid transparent}
.sr-person.me{border-color:rgba(34,211,238,.45); background:rgba(34,211,238,.08)}
.sr-person .rank{color:var(--mut); font-size:12px; text-align:center}
.sr-person .av{position:relative; width:44px; height:44px; display:grid; place-items:center; color:var(--txt); border-radius:14px; background:var(--glass2)}
.sr-person .av i{position:absolute; bottom:-2px; right:-2px; width:12px; height:12px; border-radius:50%; border:2px solid #0a0f28; background:#64748b}
.sr-root.light .sr-person .av i{border-color:#ffffff}
.sr-person .av i.focus{background:var(--green)}
.sr-person b{display:block; font-size:14px; font-weight:600}
.sr-person small{color:var(--mut); font-size:12px}
.sr-person em{font-style:normal; font-weight:600; font-size:13px; color:var(--cyan)}

.sr-chips{display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px}
.sr-chips button{border:1px solid var(--line); background:transparent; padding:6px 13px; border-radius:999px; font-size:13px; color:var(--mut)}
.sr-chips button.on{background:var(--cyan); border-color:var(--cyan); color:#04202a; font-weight:600}
.sr-stickers{display:grid; grid-template-columns:repeat(4,1fr); gap:8px}
.sr-stickers button{aspect-ratio:1; font-size:30px; border:1px solid var(--line); background:var(--glass); border-radius:18px; transition:transform .18s cubic-bezier(.3,1.6,.5,1), background .2s}
.sr-stickers button:hover:not(:disabled){transform:scale(1.14) rotate(-4deg); background:var(--glass2)}
.sr-stickers button:active:not(:disabled){transform:scale(.92)}
.sr-stickers button:disabled{opacity:.45; cursor:default}

.sr-sounds{display:flex; flex-direction:column; gap:10px}
.sr-sound{padding:12px; border-radius:18px; background:var(--glass); border:1px solid transparent; display:flex; flex-direction:column; gap:10px}
.sr-sound.on{border-color:rgba(34,211,238,.5)}
.sr-sound > button{display:flex; align-items:center; gap:10px; border:0; background:none; font-size:15px; font-weight:500; padding:0}
.sr-sound > button span{width:38px; height:38px; display:grid; place-items:center; border-radius:12px; background:var(--glass2); font-size:19px}
.sr-sound-hint{
  display:block; font-size:10.5px; font-weight:600; color:var(--amber);
  letter-spacing:.02em; margin-top:-4px; padding-inline-start:48px; opacity:.85;
  animation:sr-hint-fade 0.4s ease-out;
}
@keyframes sr-hint-fade{from{opacity:0; transform:translateY(-3px)}to{opacity:.85; transform:none}}
.sr-root input[type=range]{width:100%; accent-color:var(--cyan); height:4px}

.sr-add{display:flex; gap:8px; margin-bottom:14px}
.sr-add input, .sr-set select{flex:1; height:44px; border-radius:13px; border:1px solid var(--line); background:var(--glass); color:var(--txt); padding:0 12px; font:inherit; font-size:14px}
.sr-add input:focus, .sr-set select:focus{outline:none; border-color:var(--cyan)}
.sr-add button{padding:0 16px; border:0; border-radius:13px; background:var(--cyan); color:#04202a; font-weight:600}
.sr-goals{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px}
.sr-goals li{display:flex; align-items:center; justify-content:space-between; padding:11px 12px; border-radius:14px; background:var(--glass)}
.sr-goals label{display:flex; gap:10px; align-items:center; flex:1; font-size:14px; cursor:pointer}
.sr-goals li.done span{text-decoration:line-through; color:var(--mut)}
.sr-goals input[type=checkbox]{width:18px; height:18px; accent-color:var(--green)}
.sr-goals li > button{border:0; background:none; color:var(--mut)}
.sr-goals li > button:hover{color:#fda4af}
.sr-goals .empty{color:var(--mut); font-size:13px; justify-content:center; background:none; border:1px dashed var(--line)}

/* ═══════════════════════════════════════════════════════ */
/*  SESSION HISTORY                                        */
/* ═══════════════════════════════════════════════════════ */
.sr-history{margin-top:24px; padding-top:18px; border-top:1px solid var(--line)}
.sr-history-head{display:flex; justify-content:space-between; align-items:center; margin-bottom:12px}
.sr-history-head h3{margin:0; font-size:13.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--mut)}
.sr-history-head button{border:0; background:transparent; color:var(--mut); font-size:11.5px; font-weight:600; cursor:pointer; padding:4px 8px; border-radius:8px}
.sr-history-head button:hover{background:var(--glass); color:#fda4af}
.sr-history-empty{color:var(--mut); font-size:12.5px; line-height:1.6; margin:0; padding:14px; text-align:center; border:1px dashed var(--line); border-radius:12px}
.sr-history-list{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; max-height:320px; overflow-y:auto}
.sr-history-item{padding:11px 13px; border-radius:14px; background:var(--glass); border:1px solid transparent; transition:border-color .2s}
.sr-history-item:hover{border-color:rgba(34,211,238,.3)}

.sr-history-row{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:6px;
  margin-bottom:4px;
}

.sr-history-date{font-size:12.5px; font-weight:600; color:var(--mut); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
.sr-history-time{font-size:14px; font-weight:800; color:var(--cyan); font-variant-numeric:tabular-nums; flex:none}

.sr-history-del{
  background: transparent;
  border: 0;
  color: var(--mut);
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  padding: 3px 7px;
  border-radius: 7px;
  transition: all 0.15s;
  flex: none;
  font-family: inherit;
}
.sr-history-del:hover{
  background: rgba(244,63,94,.18);
  color: #fda4af;
}
.sr-history-del:active{
  transform: scale(.9);
}

.sr-history-meta{display:flex; flex-wrap:wrap; gap:8px; font-size:11px; color:var(--mut)}
.sr-history-config{padding:2px 8px; border-radius:6px; background:var(--glass2); font-weight:600}
.sr-history-goals{padding:2px 8px; border-radius:6px; background:rgba(251,191,36,.1); color:var(--amber); font-weight:600}
.sr-history-goals.all{background:rgba(52,211,153,.12); color:var(--green)}
.sr-history-achievements{list-style:none; margin:8px 0 0; padding:0; display:flex; flex-direction:column; gap:3px}
.sr-history-achievements li{font-size:11.5px; color:var(--txt); opacity:.85; padding-inline-start:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}

.sr-kpis{display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:18px}
.sr-kpis div{padding:12px 8px; border-radius:16px; background:var(--glass); text-align:center}
.sr-kpis b{display:block; font-size:17px; font-family:'Bricolage Grotesque',sans-serif; color:var(--cyan)}
.sr-kpis small{color:var(--mut); font-size:11.5px}
.sr-bars{display:flex; gap:8px; align-items:flex-end; justify-content:center; height:170px; padding:14px 10px 8px; border-radius:18px; background:var(--glass)}
.sr-bars div{flex:0 1 60px; max-width:60px; height:100%; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; gap:6px}
.sr-bars span{width:100%; border-radius:8px 8px 4px 4px; background:linear-gradient(180deg,var(--violet),rgba(167,139,250,.25)); transition:height .5s}
.sr-bars .today span{background:linear-gradient(180deg,var(--cyan),rgba(34,211,238,.3))}
.sr-bars small{color:var(--mut); font-size:12px}
.sr-bars em{color:var(--mut); font-size:9px; font-style:normal; opacity:.7}

.sr-settings{display:flex; flex-direction:column; gap:12px}
.sr-code{padding:16px; border-radius:18px; background:var(--glass); text-align:center; display:flex; flex-direction:column; gap:6px}
.sr-code small{color:var(--mut)}
.sr-code b{font-family:'Bricolage Grotesque',monospace; font-size:30px; letter-spacing:.18em}
.sr-code button{border:0; margin-top:4px; padding:9px; border-radius:12px; background:var(--glass2); font-weight:500}
.sr-set{display:flex; flex-direction:column; gap:7px; font-size:13.5px; color:var(--mut)}
.sr-set select option{color:#111}
.sr-set.row{flex-direction:row; justify-content:space-between; align-items:center; color:var(--txt); padding:6px 2px}
.sr-switch{appearance:none; width:46px; height:26px; border-radius:99px; background:#334; position:relative; cursor:pointer; transition:background .2s}
.sr-root.light .sr-switch{background:#cbd5e1}
.sr-switch::after{content:""; position:absolute; top:3px; left:3px; width:20px; height:20px; border-radius:50%; background:#fff; transition:transform .2s}
.sr-switch:checked{background:var(--green)}
.sr-switch:checked::after{transform:translateX(20px)}
.sr-danger{margin-top:8px; padding:12px; border-radius:14px; border:1px solid rgba(244,63,94,.5); background:rgba(244,63,94,.1); color:#fda4af; font-weight:600}
.sr-root.light .sr-danger{color:#e11d48; background:rgba(244,63,94,.08); border-color:rgba(244,63,94,.35)}
.sr-danger:hover{background:rgba(244,63,94,.2)}

.sr-main{
  position:relative; z-index:2; flex:1 1 auto; min-width:0; min-height:0;
  display:flex; flex-direction:column; padding:22px 28px 20px;
  height:100%; overflow-y:auto; overflow-x:hidden;
  -webkit-overflow-scrolling:touch; overscroll-behavior-y:contain; touch-action:pan-y;
}
.sr-top{display:flex; justify-content:space-between; align-items:flex-start; gap:12px}
.sr-top h1{margin:0 0 6px; font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:clamp(22px,3vw,30px)}
.sr-live{display:inline-flex; align-items:center; gap:8px; color:var(--mut); font-size:13.5px}
.sr-live i{width:8px; height:8px; border-radius:50%; background:var(--green); box-shadow:0 0 0 0 rgba(52,211,153,.6); animation:sr-pulse 2s infinite}
@keyframes sr-pulse{70%{box-shadow:0 0 0 9px rgba(52,211,153,0)}100%{box-shadow:0 0 0 0 rgba(52,211,153,0)}}
.sr-pill{border:1px solid var(--line); background:var(--glass); padding:9px 14px; border-radius:999px; font-weight:600; letter-spacing:.05em; font-size:13px; display:inline-flex; align-items:center; gap:6px}
.sr-pill:hover{background:var(--glass2)}

.sr-stage{flex:1 0 auto; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:22px; min-height:400px}

.sr-mode-indicator{display:flex; align-items:center; gap:10px; padding:8px 16px; border-radius:999px; background:var(--glass); border:1px solid var(--line)}
.sr-mode-dot{width:10px; height:10px; border-radius:50%; background:var(--cyan); box-shadow:0 0 12px var(--cyan); animation:sr-pulse 2s infinite}
.sr-mode-dot.break{background:var(--amber); box-shadow:0 0 12px var(--amber)}
.sr-mode-text{font-size:13.5px; font-weight:700; color:var(--txt)}
.sr-mode-hint{font-size:11.5px; font-weight:600; color:var(--mut); padding-inline-start:10px; border-inline-start:1px solid var(--line)}

.sr-ring{position:relative; width:min(60vw,300px); aspect-ratio:1}
.sr-ring svg{width:100%; height:100%; transform:rotate(-90deg); transform-box:fill-box; overflow:visible}
.sr-ring circle{fill:none; stroke-width:10; stroke-linecap:round}
.sr-ring .track{stroke:var(--glass2)}
.sr-ring .bar{stroke:url(#srg); transition:stroke-dashoffset 1s linear; filter:drop-shadow(0 0 12px var(--cyan))}
.sr-time{position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px}
.sr-time b{font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:clamp(46px,8vw,68px); letter-spacing:-.02em; font-variant-numeric:tabular-nums; line-height:1}
.sr-time span{color:var(--mut); font-size:13px}

.sr-ctrl{display:flex; gap:14px; align-items:center}
.sr-ctrl .go{height:54px; padding:0 36px; border:0; border-radius:20px; font-weight:600; font-size:16px; color:#04202a; background:linear-gradient(135deg,var(--cyan),var(--violet)); box-shadow:0 16px 36px -12px var(--cyan); transition:transform .2s}
.sr-ctrl .go:hover{transform:translateY(-2px)}
.sr-ctrl .go:active{transform:scale(.97)}
.sr-ctrl .ghost{width:50px; height:50px; border-radius:16px; border:1px solid var(--line); background:var(--glass); font-size:19px}
.sr-ctrl .ghost:hover:not(:disabled){background:var(--glass2)}
.sr-ctrl .break-btn{color:var(--amber); border-color:rgba(251,191,36,.35)}
.sr-ctrl .break-btn:hover:not(:disabled){background:rgba(251,191,36,.1); border-color:var(--amber)}
.sr-ctrl .break-btn:disabled{opacity:.4; cursor:not-allowed}

.sr-strip{display:flex; gap:10px; justify-content:center; flex-wrap:wrap; padding-top:8px}
.sr-chip{display:flex; align-items:center; gap:8px; padding:6px 14px 6px 8px; border-radius:999px; background:var(--glass); border:1px solid var(--line); font-size:13px}
.sr-chip span{width:28px; height:28px; display:grid; place-items:center; border-radius:50%; background:var(--glass2); font-size:15px}
.sr-chip.focus{border-color:rgba(52,211,153,.55)}
.sr-chip.break{border-color:rgba(251,191,36,.55)}

.sr-float{position:absolute; inset:0; pointer-events:none; overflow:hidden; z-index:4}
.sr-float span{position:absolute; bottom:90px; display:flex; flex-direction:column; align-items:center; animation:sr-rise 3.2s cubic-bezier(.2,.7,.3,1) forwards}
.sr-float em{font-style:normal; font-size:46px; filter:drop-shadow(0 6px 14px rgba(0,0,0,.5))}
.sr-float small{font-size:11px; padding:2px 8px; border-radius:99px; background:rgba(0,0,0,.45); margin-top:2px; color:#fff}
@keyframes sr-rise{0%{opacity:0; transform:translateY(20px) scale(.4)}12%{opacity:1; transform:translateY(-20px) scale(1.2)}100%{opacity:0; transform:translateY(-62vh) scale(.9) rotate(14deg)}}
@keyframes sr-icon-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-6px) scale(1.08); }
}

.sr-main::-webkit-scrollbar, .sr-side::-webkit-scrollbar, .sr-panel-in::-webkit-scrollbar,
.sr-history-list::-webkit-scrollbar, .custom-scrollbar::-webkit-scrollbar { display:none; width:0; height:0; }
.sr-main, .sr-side, .sr-panel-in, .sr-history-list, .custom-scrollbar { scrollbar-width:none; -ms-overflow-style:none; }

@media (prefers-reduced-motion:reduce){
  .sr-root *{animation-duration:.01s !important; transition-duration:.01s !important}
}
`;