// أضفه بعد cssPlus:  <style>{css}{cssPlus}{cssDeck}</style>
export const cssDeck = `
.sr-fc, .sr-weak, .sr-quiz{display:flex; flex-direction:column; gap:14px}

/* ═══ Flashcards ═══ */
.sr-fc-src{display:grid; grid-template-columns:repeat(4,1fr); gap:6px}
.sr-fc-src button{display:flex; flex-direction:column; align-items:center; gap:1px; padding:9px 2px 8px; border-radius:14px; border:1px solid transparent; background:var(--glass); font-size:11.5px; font-weight:700; color:var(--mut); transition:border-color .2s, background .2s}
.sr-fc-src button b{font-family:'Bricolage Grotesque',sans-serif; font-size:19px; color:var(--txt)}
.sr-fc-src button.on{border-color:var(--cyan); background:rgba(34,211,238,.10); color:var(--txt)}
.sr-fc-top{display:flex; align-items:center; gap:10px}
.sr-fc-top .sr-bar{flex:1; margin:0; height:6px}
.sr-fc-top span{font-size:11.5px; font-weight:700; color:var(--mut); font-variant-numeric:tabular-nums}

/* البطاقة: الوجهين في نفس الخلية عشان الطول يتظبط على الأطول فيهم */
.sr-card3d{perspective:1400px; cursor:pointer; border-radius:24px}
.sr-card3d-in{display:grid; transform-style:preserve-3d; transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.sr-card3d.flipped .sr-card3d-in{transform:rotateY(180deg)}
.sr-face{
  grid-area:1/1; min-height:340px; padding:18px; border-radius:24px; display:flex; flex-direction:column; gap:12px; text-align:left;
  backface-visibility:hidden; -webkit-backface-visibility:hidden;
  border:1px solid var(--line);
  background:linear-gradient(var(--glass),var(--glass)), var(--ringbg);
}
.sr-face.front{box-shadow:inset 0 3px 0 var(--cyan), 0 20px 40px -24px var(--cyan)}
.sr-face.back{transform:rotateY(180deg); border-color:rgba(52,211,153,.4); background:linear-gradient(160deg,rgba(52,211,153,.16),rgba(34,211,238,.05)), var(--ringbg); box-shadow:inset 0 3px 0 var(--green), 0 20px 40px -24px var(--green)}
.sr-cat{align-self:flex-start; padding:3px 10px; border-radius:99px; background:var(--glass2); font-size:11px; font-weight:700; color:var(--mut)}
.sr-q{margin:0; font-size:15px; line-height:1.65; font-weight:600}
.sr-opts{list-style:none; margin:auto 0 0; padding:0; display:flex; flex-direction:column; gap:6px}
.sr-opts li{display:flex; gap:9px; font-size:12.5px; line-height:1.45; color:var(--mut)}
.sr-opts li span{flex:none; width:20px; height:20px; display:grid; place-items:center; border-radius:7px; background:var(--glass2); font-size:11px; font-weight:800; color:var(--txt)}
.sr-flip-hint{margin:0; text-align:center; font-size:11px; color:var(--mut)}
.sr-ans{display:flex; gap:10px; align-items:flex-start; padding:12px; border-radius:14px; background:rgba(52,211,153,.14)}
.sr-ans span{flex:none; width:26px; height:26px; display:grid; place-items:center; border-radius:9px; background:var(--green); color:#04201a; font-weight:800; font-size:13px}
.sr-ans b{font-size:14.5px; line-height:1.5}
.sr-expl{margin:0; font-size:13px; line-height:1.75; color:var(--mut)}
.sr-note-box{margin-top:auto; padding:11px 12px; border-radius:14px; background:rgba(251,191,36,.12); border:1px solid rgba(251,191,36,.3); font-size:13px; line-height:1.6; overflow-wrap:anywhere}
.sr-note-box small{display:block; margin-bottom:3px; font-size:11px; font-weight:700; color:var(--amber)}

.sr-rate{display:grid; grid-template-columns:1fr 1fr; gap:8px}
.sr-rate button{display:flex; align-items:center; justify-content:center; gap:8px; padding:12px; border-radius:14px; font-size:14px; font-weight:700; border:1px solid var(--line)}
.sr-rate .again{background:rgba(251,113,133,.10); border-color:rgba(251,113,133,.35); color:#fda4af}
.sr-rate .good{background:var(--cyan); border-color:var(--cyan); color:#04202a}
.sr-rate kbd{font:inherit; font-size:10.5px; padding:1px 6px; border-radius:6px; background:rgba(0,0,0,.18); opacity:.8}
.sr-fc-done, .sr-quiz-done{display:flex; flex-direction:column; align-items:center; text-align:center; gap:6px; padding:26px 18px}
.sr-fc-done h3, .sr-quiz-done h3{font-size:17px; margin:8px 0 0}
.sr-fc-done .sr-apply, .sr-quiz-done .sr-apply{width:100%; margin-top:10px}

/* ═══ Mini quiz ═══ */
.sr-quiz-top{display:flex; justify-content:space-between; align-items:center; font-size:12px; font-weight:700; color:var(--mut)}
.sr-back{display:inline-flex; align-items:center; gap:6px; padding:5px 9px 5px 6px; border:0; border-radius:10px; background:var(--glass); font-size:12.5px; font-weight:700; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
.sr-back:hover{background:var(--glass2)}
.sr-quiz-opts{display:flex; flex-direction:column; gap:7px}
.sr-quiz-opt{display:flex; align-items:center; gap:10px; width:100%; padding:11px 12px; border-radius:14px; border:1px solid var(--line); background:var(--glass); text-align:left; font-size:13.5px; line-height:1.45; transition:border-color .2s, background .2s}
.sr-quiz-opt:hover:not(:disabled){border-color:var(--cyan)}
.sr-quiz-opt .L{flex:none; width:24px; height:24px; display:grid; place-items:center; border-radius:8px; background:var(--glass2); font-size:12px; font-weight:800}
.sr-quiz-opt .T{flex:1; min-width:0}
.sr-quiz-opt.ok{border-color:var(--green); background:rgba(52,211,153,.14)}
.sr-quiz-opt.ok .L{background:var(--green); color:#04201a}
.sr-quiz-opt.bad{border-color:#fb7185; background:rgba(251,113,133,.12)}
.sr-quiz-opt.bad .L{background:#fb7185; color:#2a0610}
.sr-quiz-opt.dim{opacity:.45}
.sr-expl-box{padding:12px; border-radius:14px; background:rgba(34,211,238,.08); border-left:3px solid var(--cyan); font-size:13px; line-height:1.7}
.sr-quiz .sr-apply{padding:12px}

/* ═══ Weak topics ═══ */
.sr-weak-hero{padding:16px; border-radius:22px; background:linear-gradient(150deg,rgba(251,113,133,.16),rgba(251,191,36,.08)); border:1px solid rgba(251,113,133,.38); display:flex; flex-direction:column; gap:6px}
.sr-weak-hero h3{margin:0; font-size:13px; font-weight:700; color:#fda4af}
.sr-weak-hero svg{color:#fda4af}
.sr-weak-name{margin:2px 0 0; font-family:'Bricolage Grotesque',sans-serif; font-size:26px; font-weight:800; line-height:1.15}
.sr-cta{margin-top:8px; padding:12px; border:0; border-radius:14px; font-size:14px; font-weight:800; color:#2a0610; background:linear-gradient(135deg,#fb7185,#fbbf24); box-shadow:0 14px 28px -14px #fb7185; transition:transform .2s}
.sr-cta:hover:not(:disabled){transform:translateY(-2px)}
.sr-cta:disabled{opacity:.6; cursor:default}
.sr-topics{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px}
.sr-topics li{padding:11px 12px; border-radius:16px; background:var(--glass)}
.sr-topic-head{display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px}
.sr-topic-head b{font-size:14px; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
.sr-topic-head button{flex:none; padding:5px 12px; border-radius:10px; border:1px solid var(--line); background:transparent; font-size:12px; font-weight:700}
.sr-topic-head button:hover:not(:disabled){border-color:var(--cyan); color:var(--cyan)}
.sr-topic-bar{height:6px; border-radius:99px; background:var(--glass2); overflow:hidden}
.sr-topic-bar i{display:block; height:100%; border-radius:inherit; transition:width .6s cubic-bezier(.2,.8,.2,1)}
.sr-topic-bar.high i{background:linear-gradient(90deg,#fb7185,#f43f5e)}
.sr-topic-bar.mid i{background:linear-gradient(90deg,#fbbf24,#fb923c)}
.sr-topic-bar.low i{background:linear-gradient(90deg,var(--cyan),var(--violet))}
.sr-topics small{display:block; margin-top:6px; font-size:11.5px; color:var(--mut)}

/* ═══ Sidebar بقى فيه تابات كتير → أضغط الفراغات على الشاشات القصيرة ═══ */
@media (max-height:940px){
  .sr-side{gap:2px; padding:12px 8px}
  .sr-side button{padding:8px 4px 7px; gap:4px; font-size:10.5px}
  .sr-brand{margin-bottom:6px}
}
@media (prefers-reduced-motion:reduce){
  .sr-card3d-in{transition-duration:.01s}
}
`;
