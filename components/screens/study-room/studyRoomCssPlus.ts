// أضف ده بعد `css` الأصلي:  <style>{css}{cssPlus}</style>
export const cssPlus = `
.sr-root{--ringbg:#0c1230}
.sr-root.light{--ringbg:#ffffff}

/* ═══ Shared ═══ */
.sr-card{padding:16px; border-radius:20px; background:var(--glass); border:1px solid var(--line)}
.sr-card h3, .sr-h3{margin:0; font-size:13.5px; font-weight:700; color:var(--txt)}
.sr-row-between{display:flex; justify-content:space-between; align-items:center; gap:10px}
.sr-sub{margin:6px 0 0; font-size:12px; color:var(--mut); line-height:1.5}
.sr-goals-wrap, .sr-planner, .sr-notes{display:flex; flex-direction:column; gap:14px}

.sr-save{display:inline-flex; align-items:center; gap:6px; font-size:11px; font-weight:600; color:var(--mut)}
.sr-save i{width:6px; height:6px; border-radius:50%; background:var(--green)}
.sr-save.saving i{background:var(--amber); animation:sr-pulse 1.2s infinite}
.sr-save.offline i{background:#fb7185}

.sr-seg{display:inline-flex; padding:3px; gap:2px; border-radius:12px; background:var(--glass); border:1px solid var(--line)}
.sr-seg.wide{flex:1; max-width:250px}
.sr-seg.wide button{flex:1}
.sr-seg button{border:0; background:transparent; padding:7px 12px; border-radius:9px; font-size:12.5px; font-weight:600; color:var(--mut); transition:background .2s,color .2s; display:inline-flex; align-items:center; justify-content:center; gap:6px}
.sr-seg button:hover{color:var(--txt)}
.sr-seg button.on{background:var(--cyan); color:#04202a}

.sr-stepper{display:inline-flex; align-items:center; gap:2px; padding:3px; border-radius:12px; background:var(--glass); border:1px solid var(--line)}
.sr-stepper button{width:30px; height:30px; display:grid; place-items:center; border:0; border-radius:9px; background:transparent; color:var(--txt)}
.sr-stepper button:hover{background:var(--glass2)}
.sr-stepper span{min-width:84px; text-align:center; font-size:12.5px; font-weight:700; font-variant-numeric:tabular-nums}
.sr-stepper.sm button{width:24px; height:24px}
.sr-stepper.sm span{min-width:64px; font-size:11.5px}

.sr-bar{height:8px; margin-top:12px; border-radius:99px; background:var(--glass2); overflow:hidden}
.sr-bar i{display:block; height:100%; border-radius:inherit; background:linear-gradient(90deg,var(--cyan),var(--violet)); transition:width .6s cubic-bezier(.2,.8,.2,1)}

.sr-skel{height:220px; border-radius:18px; background:linear-gradient(100deg,var(--glass) 30%,var(--glass2) 50%,var(--glass) 70%); background-size:200% 100%; animation:sr-shimmer 1.4s infinite}
.sr-skel.tall{height:360px}
@keyframes sr-shimmer{to{background-position:-200% 0}}

.sr-chk, .sr-notes .chk, .sr-planner .chk{width:20px; height:20px; flex:none; display:grid; place-items:center; padding:0; border-radius:7px; border:1.5px solid var(--line); background:transparent; color:#04202a}
.sr-notes .done .chk, .sr-planner .done .chk{background:var(--green); border-color:var(--green)}

/* ═══ Daily target — the one memorable element ═══ */
.sr-target{display:grid; grid-template-columns:96px 1fr; gap:4px 16px; align-items:center; background:linear-gradient(160deg,rgba(34,211,238,.10),rgba(167,139,250,.08)); border-color:rgba(34,211,238,.28)}
.sr-ring-mini{position:relative; width:96px; height:96px; border-radius:50%; display:grid; place-items:center; background:conic-gradient(var(--cyan) calc(var(--p)*1%), var(--glass2) 0); box-shadow:0 0 28px -6px var(--cyan); transition:box-shadow .4s}
.sr-ring-mini::before{content:""; position:absolute; inset:9px; border-radius:50%; background:var(--ringbg)}
.sr-ring-mini b{position:relative; font-family:'Bricolage Grotesque',sans-serif; font-size:22px; font-weight:800}
.sr-ring-mini.full{background:conic-gradient(var(--green),var(--cyan),var(--green)); box-shadow:0 0 34px -2px var(--green)}
.sr-target-info{min-width:0}
.sr-big{margin:2px 0 0; font-family:'Bricolage Grotesque',sans-serif; font-size:26px; font-weight:800; line-height:1.1}
.sr-big span{font-size:13px; font-weight:600; color:var(--mut); font-family:'Manrope',sans-serif}
.sr-target-ctrl{grid-column:1 / -1; display:flex; flex-wrap:wrap; gap:8px; justify-content:space-between; margin-top:10px}

.sr-carried{display:inline-flex; align-items:center; gap:3px; font-style:normal; font-size:10.5px; font-weight:700; color:var(--amber); background:rgba(251,191,36,.12); padding:2px 7px; border-radius:99px; margin-inline:6px}

/* ═══ Notes / Parking lot ═══ */
.sr-pad{width:100%; min-height:300px; resize:vertical; padding:14px; border-radius:16px; border:1px solid var(--line); background:var(--glass); color:var(--txt); font:inherit; font-size:14px; line-height:1.7}
.sr-pad:focus{outline:none; border-color:var(--cyan)}
.sr-count{min-width:18px; height:18px; padding:0 5px; display:inline-grid; place-items:center; border-radius:99px; background:var(--amber); color:#241800; font-size:10.5px; font-weight:800}
.sr-parked, .sr-plan-list{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:7px}
.sr-parked li, .sr-plan-list li{display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:14px; background:var(--glass); font-size:14px}
.sr-parked li span, .sr-plan-list li span{flex:1; min-width:0; overflow-wrap:anywhere}
.sr-parked li.done span, .sr-plan-list li.done span{text-decoration:line-through; color:var(--mut)}
.sr-parked .del, .sr-plan-list .del{border:0; background:none; color:var(--mut); padding:4px; border-radius:8px; display:grid; place-items:center}
.sr-parked .del:hover, .sr-plan-list .del:hover{color:#fda4af; background:rgba(244,63,94,.12)}
.sr-parked .empty, .sr-plan-list .empty{justify-content:center; text-align:center; background:none; border:1px dashed var(--line); color:var(--mut); font-size:13px}

/* tooltip on hover/focus */
.sr-tip-host{position:relative}
.sr-tip-host::after{content:attr(data-tip); position:absolute; top:calc(100% + 10px); right:0; width:220px; padding:10px 12px; border-radius:12px; background:#0b1030; color:#e8ecff; border:1px solid rgba(255,255,255,.14); font-size:12px; font-weight:500; line-height:1.55; text-align:left; box-shadow:0 14px 30px -10px rgba(0,0,0,.6); opacity:0; transform:translateY(-4px); pointer-events:none; transition:opacity .18s, transform .18s; z-index:20}
.sr-tip-host:hover::after, .sr-tip-host:focus-visible::after{opacity:1; transform:none}

/* ═══ Planner ═══ */
.sr-exam-main{display:flex; gap:14px; align-items:center; margin-top:12px}
.sr-days{flex:none; width:92px; text-align:center; padding:12px 6px; border-radius:16px; background:var(--glass2)}
.sr-days b{display:block; font-family:'Bricolage Grotesque',sans-serif; font-size:40px; font-weight:800; line-height:1; background:linear-gradient(135deg,var(--cyan),var(--violet)); -webkit-background-clip:text; background-clip:text; color:transparent}
.sr-days small{display:block; margin-top:4px; font-size:11px; color:var(--mut); font-weight:600}
.sr-days.near b{background:linear-gradient(135deg,#fbbf24,#fb7185); -webkit-background-clip:text; background-clip:text}
.sr-exam-fields{flex:1; min-width:0; display:flex; flex-direction:column; gap:8px}
.sr-exam-row{display:flex; gap:8px}
.sr-exam-fields input{width:100%; min-width:0; height:40px; padding:0 10px; border-radius:12px; border:1px solid var(--line); background:var(--glass); color:var(--txt); font:inherit; font-size:13px; color-scheme:dark}
.sr-root.light .sr-exam-fields input{color-scheme:light}
.sr-exam-fields input:focus{outline:none; border-color:var(--cyan)}
.sr-need{margin:12px 0 0; padding:10px 12px; border-radius:12px; background:rgba(34,211,238,.08); font-size:12.5px; color:var(--mut); line-height:1.5}
.sr-need b{color:var(--txt)}

.sr-week{display:grid; grid-template-columns:repeat(7,1fr); gap:5px; margin-bottom:10px}
.sr-week button{display:flex; flex-direction:column; align-items:center; gap:4px; padding:8px 0; border-radius:12px; border:1px solid transparent; background:var(--glass); font-size:11.5px; font-weight:700; color:var(--mut)}
.sr-week button i{font-style:normal; font-size:10px; font-weight:700; opacity:.8; font-variant-numeric:tabular-nums}
.sr-week button i.full{color:var(--green); opacity:1}
.sr-week button.today{border-color:rgba(34,211,238,.4)}
.sr-week button.on{background:var(--cyan); color:#04202a}
.sr-week button.on i{color:#04202a}
.sr-subj{margin:12px 0 10px}
.sr-subj button{display:inline-flex; align-items:center; gap:4px; padding:5px 11px; font-size:12px}
.sr-subj button:hover{border-color:var(--cyan); color:var(--txt)}

/* ═══ Settings custom ═══ */
.sr-custom{display:flex; flex-direction:column; gap:10px}
.sr-step-row{display:flex; align-items:center; justify-content:space-between; font-size:13.5px; font-weight:600}
.sr-apply{margin-top:2px; padding:11px; border:0; border-radius:12px; font-weight:700; background:var(--cyan); color:#04202a; transition:opacity .2s}
.sr-apply:disabled{opacity:.4; cursor:default}

/* ═══ Break activities — the other memorable element ═══ */
.sr-break{display:flex; align-items:center; gap:22px; width:min(100%,560px); padding:18px 22px; border-radius:26px; background:linear-gradient(150deg,rgba(251,191,36,.10),rgba(52,211,153,.08)); border:1px solid rgba(251,191,36,.30); backdrop-filter:blur(14px); animation:sr-fade .5s both}
.sr-breathe-wrap{flex:none; width:128px; height:128px; display:grid; place-items:center}
.sr-breathe{width:92px; height:92px; border-radius:50%; display:grid; place-items:center; text-align:center; background:radial-gradient(circle at 35% 30%,#fde68a,var(--amber) 55%,#34d399 130%); color:#2b1d00; box-shadow:0 0 40px -4px var(--amber); animation:sr-box-breathe 16s ease-in-out infinite}
.sr-breathe span{font-size:12px; font-weight:800; line-height:1.2; padding:0 8px}
@keyframes sr-box-breathe{0%{transform:scale(1)}25%,50%{transform:scale(1.38)}75%,100%{transform:scale(1)}}
.sr-break-body{flex:1; min-width:0}
.sr-break-body small{font-size:11.5px; font-weight:600; color:var(--mut)}
.sr-break-body h4{margin:4px 0 4px; font-family:'Bricolage Grotesque',sans-serif; font-size:19px; font-weight:800}
.sr-break-body p{margin:0 0 12px; font-size:13px; line-height:1.6; color:var(--mut)}
.sr-break-actions{display:flex; gap:8px; flex-wrap:wrap}
.sr-break-actions button{padding:8px 16px; border-radius:12px; border:1px solid var(--line); background:var(--glass); font-size:13px; font-weight:700}
.sr-break-actions button.primary{background:var(--amber); border-color:var(--amber); color:#2b1d00}
.sr-break-dots{display:flex; gap:6px; margin-top:12px}
.sr-break-dots button{width:32px; height:32px; border-radius:10px; border:1px solid transparent; background:var(--glass); font-size:15px; opacity:.6}
.sr-break-dots button.cur{opacity:1; border-color:var(--amber)}
.sr-break-dots button.ok{opacity:1; box-shadow:inset 0 0 0 1.5px var(--green)}
@media (max-width:640px){
  .sr-break{flex-direction:column; text-align:center}
  .sr-break-actions, .sr-break-dots{justify-content:center}
}
@media (prefers-reduced-motion:reduce){
  .sr-breathe{animation:none}
}

/* ═══ Tooltip (بيتعرض في body فمتغيرات الألوان ثابتة هنا) ═══ */
.sr-tooltip{position:fixed; z-index:200; max-width:250px; padding:9px 12px; border-radius:12px; direction:ltr; text-align:left;
  background:#0b1030; color:#e8ecff; border:1px solid rgba(255,255,255,.16);
  font:500 12px/1.55 'Manrope',system-ui,sans-serif; box-shadow:0 14px 30px -10px rgba(0,0,0,.6);
  pointer-events:none; animation:sr-tip-in .16s ease-out both}
.sr-tooltip.right{transform:translateY(-50%)}
.sr-tooltip.top{transform:translate(-50%,-100%)}
.sr-tooltip.bottom{transform:translate(-50%,0)}
@keyframes sr-tip-in{from{opacity:0}to{opacity:1}}
`;
