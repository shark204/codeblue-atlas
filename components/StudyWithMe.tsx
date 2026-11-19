// @ts-nocheck
import { useState, useRef, useMemo, useEffect } from "react";
import { Calendar } from "lucide-react";
import { VibeIcon, VIBE_KEYS } from "@/lib/vibeIcons";
import StudyingNowBadge from "@/components/StudyingNowBadge";
import { useUIStore } from "@/stores/uiStore";
import { useLanguageStore } from "@/stores/languageStore";
import SessionLengthPicker, { modeFromFocus, focusFromMode } from "./SessionLengthPicker";

interface RecentRoom {
  name: string;
  code: string;
  people: number;
}

interface StudyWithMeProps {
  lang?: 'ar' | 'en';
  showSky?: boolean;
  isDark?: boolean;
  onBack?: () => void;
  onCreate?: (data: {
    name: string;
    vibe: string;
    room: string;
    focus: number;
  }) => void;
  onJoin?: (data: {
    name: string;
    vibe: string;
    code: string;
  }) => void;
  studyingNow?: number;
  recentRooms?: RecentRoom[];
}

const VIBES = VIBE_KEYS;
const FOCUS = [25, 50, 90, -1, -2];
const CODE_LEN = 6;
const T = {
  en: {
    back: "Back to Dashboard",
    title: "Study with Me",
    sub: "Silent accountability rooms. Track your study hours alongside your peers. No chat, no distractions.",
    live: (n) => `${n.toLocaleString("en-US")} studying now`,
    nameLabel: "Display name",
    namePh: "Dr. Ahmed",
    vibeLabel: "Pick your vibe",
    create: "Create a room",
    join: "Join with code",
    roomPh: "Room name, e.g. Code Blue",
    session: "Session length",
    min: "min",
    createBtn: "Create room",
    joinBtn: "Join room",
    codeHint: "Ask the room owner for the 6-character code.",
    errName: "Add your name so others can see you.",
    errRoom: "Give your room a name.",
    errCode: "Enter the full 6-character code.",
    recent: "Recent rooms",
    here: "here",
  },
  ar: {
    back: "العودة للوحة المتابعة",
    title: "غرف التركيز التشاركي",
    sub: "غرف مذاكرة تفاعلية هادئة لمتابعة ساعات تركيزك إلى جانب زملائك الأطباء دون تشتيت.",
    live: (n) => `${n.toLocaleString("ar-EG")} يذاكرون الآن`,
    nameLabel: "الاسم الظاهر للزملاء",
    namePh: "د. أحمد",
    vibeLabel: "اختر حالتك",
    create: "إنشاء غرفة جديدة",
    join: "انضمام برمز الغرفة",
    roomPh: "اسم الغرفة، مثال: مراجعة الجراحة",
    session: "نظام ومؤقت الجلسة",
    min: "دقيقة",
    createBtn: "إنشاء وبدء الغرفة",
    joinBtn: "دخول الغرفة",
    codeHint: "اطلب رمز الغرفة المكون من 6 خانات من منشئ الغرفة.",
    errName: "يرجى كتابة اسمك الظاهر ليتعرف عليك الزملاء.",
    errRoom: "يرجى إدخال اسم للغرفة.",
    errCode: "يرجى إدخال رمز الغرفة كاملاً (6 خانات).",
    recent: "غرف انضممت إليها مؤخراً",
    here: "متواجد",
  },
};

export default function StudyWithMe({
  lang,
  showSky = false,
  isDark,
  onBack = () => {},
  onCreate = () => {},
  onJoin = () => {},
  studyingNow = 0,
  recentRooms = [],
}: StudyWithMeProps) {
  const storeTheme = useUIStore((s) => s.theme);
  const storeLocale = useLanguageStore((s) => s.locale);
  const effectiveLang = lang || storeLocale || "en";
  const effectiveIsDark = typeof isDark === "boolean" ? isDark : storeTheme === "dark";

  const t = T[effectiveLang] || T.en;
  const dir = effectiveLang === "ar" ? "rtl" : "ltr";

  const [tab, setTab] = useState("create");
  const [name, setName] = useState("");
  const [vibe, setVibe] = useState("bookOpen");
  const [room, setRoom] = useState("");
  const [focus, setFocus] = useState(25);
  const [code, setCode] = useState(Array(CODE_LEN).fill(""));
  const [err, setErr] = useState({});
  const [shake, setShake] = useState("");
  const boxes = useRef([]);

  const STORAGE_KEY = 'sw:profile';

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (typeof saved.name === 'string' && saved.name) setName(saved.name);
      if (typeof saved.vibe === 'string' && saved.vibe) setVibe(saved.vibe);
      if (typeof saved.room === 'string' && saved.room) setRoom(saved.room);
      if (typeof saved.focus === 'number' && FOCUS.includes(saved.focus)) {
        setFocus(saved.focus);
      } else if (typeof saved.focus === 'number') {
        setFocus(25);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, vibe, room, focus }));
    } catch {}
  }, [name, vibe, room, focus]);

  const stars = useMemo(
    () =>
      Array.from({ length: 55 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: Math.random() * 1.8 + 0.6,
        d: Math.random() * 6,
        t: 3 + Math.random() * 4,
      })),
    []
  );

  const fail = (key, msg) => {
    setErr({ [key]: msg });
    setShake(key);
    setTimeout(() => setShake(""), 420);
  };

  const submitCreate = () => {
    if (!name.trim()) return fail("name", t.errName);
    if (!room.trim()) return fail("room", t.errRoom);
    setErr({});
    onCreate({ name: name.trim(), vibe, room: room.trim(), focus });
  };

  const submitJoin = (override) => {
    const joined = override || code.join("");
    if (!name.trim()) return fail("name", t.errName);
    if (joined.length < CODE_LEN) return fail("code", t.errCode);
    setErr({});
    onJoin({ name: name.trim(), vibe, code: joined });
  };

  const setCodeAt = (i, v) => {
    const ch = v.replace(/[^a-zA-Z0-9]/g, "").slice(-1).toUpperCase();
    const next = [...code];
    next[i] = ch;
    setCode(next);
    if (ch && i < CODE_LEN - 1) boxes.current[i + 1]?.focus();
  };
  const onCodeKey = (i, e) => {
    if (e.key === "Backspace" && !code[i] && i > 0) boxes.current[i - 1]?.focus();
    if (e.key === "Enter") submitJoin();
  };
  const onPaste = (e) => {
    const p = e.clipboardData.getData("text").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, CODE_LEN);
    if (!p) return;
    e.preventDefault();
    setCode(Array.from({ length: CODE_LEN }, (_, i) => p[i] || ""));
    boxes.current[Math.min(p.length, CODE_LEN - 1)]?.focus();
  };

  return (
    <div className={`sw ${showSky ? "has-sky" : "no-sky"} ${effectiveIsDark ? "dark" : "light"}`} dir={dir}>
      <style>{css}</style>

      {showSky && (
        <div className="sw-sky" aria-hidden="true">
          <i className="glow g1" />
          <i className="glow g2" />
          {stars.map((s) => (
            <span
              key={s.id}
              className="star"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.s,
                height: s.s,
                animationDelay: `${s.d}s`,
                animationDuration: `${s.t}s`,
              }}
            />
          ))}
          <i className="moon" />
        </div>
      )}

      {/* ✅ زر الرجوع داخل حاوية الصفحة أسفل التوب بار الجديد لئلا يُغطى أبداً */}
      <div className="sw-topbar-row">
        <button className="sw-back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t.back}
        </button>
      </div>

      <main className="sw-card">
        <header className="sw-hero">
          {studyingNow > 0 && (
            <div className="sw-live">
              <StudyingNowBadge
                count={studyingNow}
                label={effectiveLang === 'ar' ? 'يذاكرون الآن' : 'studying now'}
                isDark={effectiveIsDark}
                size="md"
                showDot={true}
                deltaMin={3}
                deltaMax={3}
                refreshMinSec={4}
                refreshMaxSec={10}
              />
            </div>
          )}
          <h1 className="sw-title">
            <span>{t.title}</span>
            <Calendar size={32} strokeWidth={2.2} className="sw-title-icon" />
          </h1>
          <p>{t.sub}</p>
        </header>

        <section className={`sw-id ${shake === "name" ? "shake" : ""}`}>
          <div className="orb" key={vibe} aria-hidden="true">
            <VibeIcon name={vibe} size={30} strokeWidth={1.7} />
          </div>
          <div className="grow">
            <label htmlFor="sw-name">{t.nameLabel}</label>
            <input
              id="sw-name"
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePh}
              className={err.name ? "bad" : ""}
              autoComplete="off"
            />
          </div>
        </section>
        {err.name && <p className="sw-err">{err.name}</p>}

        <div className="sw-vibes" role="radiogroup" aria-label={t.vibeLabel}>
          {VIBES.map((v) => (
            <button
              key={v}
              role="radio"
              aria-checked={vibe === v}
              className={vibe === v ? "on" : ""}
              onClick={() => setVibe(v)}
            >
              <VibeIcon name={v} size={22} strokeWidth={1.8} />
            </button>
          ))}
        </div>

        <div className="sw-tabs" data-tab={tab} role="tablist">
          <i className="ind" />
          <button role="tab" aria-selected={tab === "create"} onClick={() => setTab("create")}>{t.create}</button>
          <button role="tab" aria-selected={tab === "join"} onClick={() => setTab("join")}>{t.join}</button>
        </div>

        {tab === "create" ? (
          <section className="sw-pane" key="create">
            <div className={shake === "room" ? "shake" : ""}>
              <input
                className={`big ${err.room ? "bad" : ""}`}
                value={room}
                maxLength={40}
                onChange={(e) => setRoom(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitCreate()}
                placeholder={t.roomPh}
                aria-label={t.roomPh}
              />
            </div>
            {err.room && <p className="sw-err">{err.room}</p>}

            <div className="sw-len2">
              <span>{t.session}</span>
              <div className="opts">
                <SessionLengthPicker
                  lang={effectiveLang}
                  isDark={effectiveIsDark}
                  value={modeFromFocus(focus)}
                  onChange={(m) => setFocus(focusFromMode(m))}
                />
              </div>
            </div>

            <button className="sw-cta" onClick={submitCreate}>{t.createBtn}</button>
          </section>
        ) : (
          <section className="sw-pane" key="join">
            <div className={`sw-code ${shake === "code" ? "shake" : ""}`} onPaste={onPaste} dir="ltr">
              {code.map((c, i) => (
                <input
                  key={i}
                  ref={(el) => (boxes.current[i] = el)}
                  value={c}
                  autoComplete="off"
                  aria-label={`${i + 1}`}
                  onChange={(e) => setCodeAt(i, e.target.value)}
                  onKeyDown={(e) => onCodeKey(i, e)}
                  onFocus={(e) => e.target.select()}
                  className={c ? "filled" : ""}
                />
              ))}
            </div>
            {err.code ? <p className="sw-err">{err.code}</p> : <p className="sw-hint">{t.codeHint}</p>}

            <button className="sw-cta" onClick={() => submitJoin()}>{t.joinBtn}</button>

            {recentRooms.length > 0 && (
              <div className="sw-recent">
                <span>{t.recent}</span>
                <div>
                  {recentRooms.map((r) => (
                    <button key={r.code} onClick={() => submitJoin(r.code)}>
                      <b>{r.name}</b>
                      <small>{r.people} {t.here}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

/* ----------------------------- CSS ------------------------------ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap');

.sw{
  --bg:#050816; --ink:#eef2ff; --mut:#93a0c8; --line:rgba(255,255,255,.1);
  --fld:rgba(255,255,255,.05); --fld-h:rgba(255,255,255,.09);
  --cy:#38d6f5; --blue:#2563eb; --bad:#fb7185;
  position:relative; min-height:calc(100vh - 64px); padding:20px 16px 56px; color:var(--ink); overflow-x:hidden;
  font-family:'Manrope','IBM Plex Sans Arabic',system-ui,sans-serif;
}
.sw.light,
html:not(.dark) .sw{
  --bg:#f0f7ff; --ink:#0f172a; --mut:#475569; --line:rgba(15,23,42,.12);
  --fld:rgba(255,255,255,.74); --fld-h:rgba(255,255,255,.95);
  --cy:#0284c7; --blue:#2563eb; --bad:#e11d48;
}
.sw.has-sky{
  background:radial-gradient(1100px 650px at 70% -10%, #15245a 0%, var(--bg) 62%);
}
.sw.light.has-sky,
html:not(.dark) .sw.has-sky{
  background:radial-gradient(1100px 650px at 70% -10%, #bae6fd 0%, var(--bg) 62%);
}
.sw.no-sky{
  background:transparent;
}
.sw *{box-sizing:border-box}
.sw button{font-family:inherit; cursor:pointer; color:inherit}
.sw :focus-visible{outline:2px solid var(--cy); outline-offset:2px}

.sw-sky{position:fixed; inset:0; pointer-events:none}
.sw-sky .star{position:absolute; border-radius:50%; background:#fff; opacity:.2; animation:tw 4s ease-in-out infinite}
@keyframes tw{0%,100%{opacity:.12}50%{opacity:.9}}
.sw-sky .glow{position:absolute; width:55vw; height:55vw; border-radius:50%; filter:blur(120px); opacity:.2}
.sw-sky .g1{background:#7c3aed; top:-26vw; left:-14vw}
.sw-sky .g2{background:#0ea5e9; bottom:-32vw; right:-18vw; opacity:.14}
.sw-sky .moon{position:absolute; top:70px; left:-80px; width:180px; height:180px; border-radius:50%;
  background:radial-gradient(circle at 70% 40%, #e9e6d8, #a29f93 72%); box-shadow:0 0 80px 14px rgba(233,230,216,.14); opacity:.9}

.sw-topbar-row{
  position:relative; z-index:10; max-width:560px; margin:0 auto 16px; display:flex; align-items:center;
}
.sw-back{
  display:inline-flex; gap:8px; align-items:center;
  padding:9px 15px; border-radius:12px; font-size:13.5px; font-weight:600;
  background:rgba(255,255,255,.08); border:1px solid var(--line); backdrop-filter:blur(14px); transition:background .2s, box-shadow .2s;
}
.sw-back:hover{background:rgba(255,255,255,.15)}
.sw.light .sw-back,
html:not(.dark) .sw .sw-back{
  background:rgba(255,255,255,.82);
  border-color:rgba(255,255,255,.92);
  color:#0f172a;
  box-shadow:0 10px 25px -8px rgba(14,116,144,.22), 0 0 0 1px rgba(14,165,233,.14);
}
.sw.light .sw-back:hover,
html:not(.dark) .sw .sw-back:hover{
  background:#ffffff;
}
.sw[dir=rtl] .sw-back svg{transform:scaleX(-1)}

.sw-card{
  position:relative; z-index:1; max-width:560px; margin:0 auto; padding:38px 34px 34px; border-radius:28px;
  background:linear-gradient(180deg, rgba(20,28,66,.72), rgba(10,15,40,.78));
  border:1px solid var(--line); backdrop-filter:blur(26px); -webkit-backdrop-filter:blur(26px);
  box-shadow:0 1px 0 rgba(255,255,255,.14) inset, 0 40px 100px -30px rgba(0,0,0,.8), 0 0 80px -30px rgba(56,214,245,.3);
  animation:rise .6s cubic-bezier(.2,.8,.2,1) both;
}
.sw.light .sw-card,
html:not(.dark) .sw .sw-card{
  background:linear-gradient(180deg, rgba(255,255,255,.86), rgba(240,249,255,.78));
  border:1px solid rgba(255,255,255,.92);
  backdrop-filter:blur(26px) saturate(140%);
  -webkit-backdrop-filter:blur(26px) saturate(140%);
  box-shadow:0 1px 0 rgba(255,255,255,.98) inset, 0 32px 70px -22px rgba(14,116,144,.28), 0 0 0 1px rgba(14,165,233,.16);
}
@keyframes rise{from{opacity:0; transform:translateY(16px)}to{opacity:1; transform:none}}

.sw-hero{text-align:center; margin-bottom:28px}
.sw-live{display:inline-flex; align-items:center; justify-content:center; padding:6px 13px; border-radius:999px;
  background:rgba(52,211,153,.1); margin-bottom:16px}
.sw.light .sw-live,
html:not(.dark) .sw .sw-live{
  background:rgba(16,185,129,.12);
  border:1px solid rgba(16,185,129,.25);
}
.sw-hero h1{margin:0 0 10px; font-family:'Bricolage Grotesque','IBM Plex Sans Arabic',sans-serif; font-weight:800;
  font-size:clamp(34px,6vw,46px); letter-spacing:-.025em; line-height:1.05}
.sw-title{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:12px;
  width:100%;
  margin:0 0 10px;
}
.sw-title-icon{
  flex:none;
  color:var(--cy);
  filter:drop-shadow(0 0 12px rgba(56,214,245,.55));
  animation:sw-cal-float 3.5s ease-in-out infinite;
}
.sw.light .sw-title-icon,
html:not(.dark) .sw .sw-title-icon{
  filter:drop-shadow(0 4px 10px rgba(2,132,199,.35));
}
@keyframes sw-cal-float{
  0%,100%{ transform:translateY(0) }
  50%    { transform:translateY(-4px) }
}
@media (max-width:520px){
  .sw-title{ gap:8px }
  .sw-title-icon{ width:24px; height:24px }
}
.sw-hero p{margin:0 auto; max-width:42ch; color:var(--mut); font-size:14.5px; line-height:1.75}

.sw-id{display:flex; gap:16px; align-items:flex-end}
.sw-id .grow{flex:1}
.orb{
  flex:none; width:64px; height:64px; display:grid; place-items:center; color:#fff; border-radius:50%;
  background:radial-gradient(circle at 30% 25%, rgba(255,255,255,.2), rgba(255,255,255,.05));
  border:1px solid var(--line); box-shadow:0 0 0 5px rgba(56,214,245,.1), 0 10px 30px -8px rgba(56,214,245,.45);
  animation:pop .4s cubic-bezier(.3,1.6,.5,1);
}
.sw.light .orb,
html:not(.dark) .sw .orb{
  color:#0284c7;
  background:radial-gradient(circle at 30% 25%, #ffffff, #e0f2fe);
  border-color:rgba(2,132,199,.25);
  box-shadow:0 0 0 5px rgba(2,132,199,.1), 0 10px 25px -8px rgba(2,132,199,.3);
}
@keyframes pop{from{transform:scale(.6) rotate(-14deg)}to{transform:none}}
.sw label{display:block; font-size:13px; font-weight:600; color:var(--mut); margin-bottom:8px}

.sw input{
  width:100%; height:50px; padding:0 16px; border-radius:14px; font:inherit; font-size:15px; color:var(--ink);
  background:var(--fld); border:1px solid var(--line); transition:border-color .2s, background .2s, box-shadow .2s;
}
.sw input::placeholder{color:#6b7799}
.sw.light input::placeholder,
html:not(.dark) .sw input::placeholder{color:#94a3b8}
.sw.light input,
html:not(.dark) .sw input{
  background:rgba(255,255,255,.88);
  border-color:rgba(15,23,42,.14);
  box-shadow:inset 0 1px 2px rgba(15,23,42,.04);
}
.sw input:hover{background:var(--fld-h)}
.sw input:focus{outline:none; border-color:var(--cy); background:var(--fld-h); box-shadow:0 0 0 4px rgba(56,214,245,.14)}
.sw.light input:focus,
html:not(.dark) .sw input:focus{
  background:#ffffff;
  border-color:var(--cy);
  box-shadow:0 0 0 4px rgba(2,132,199,.16);
}
.sw input.bad{border-color:var(--bad); box-shadow:0 0 0 4px rgba(251,113,133,.12)}
.sw input.big{height:54px}
.sw-err{margin:8px 2px 0; font-size:12.5px; color:var(--bad); font-weight:500}
.sw-hint{margin:10px 2px 0; font-size:12.5px; color:var(--mut)}

.sw-vibes{display:grid; grid-template-columns:repeat(7,1fr); gap:6px; margin:18px 0 26px}
.sw-vibes button{aspect-ratio:1; display:grid; place-items:center; color:#cfd6ff; border-radius:13px; border:1px solid transparent;
  background:var(--fld); transition:transform .18s cubic-bezier(.3,1.6,.5,1), background .2s, border-color .2s}
.sw.light .sw-vibes button,
html:not(.dark) .sw .sw-vibes button{
  color:#334155;
  background:rgba(255,255,255,.72);
  border-color:rgba(15,23,42,.08);
}
.sw-vibes button.on{color:#fff}
.sw-vibes button:hover{transform:translateY(-2px) scale(1.08); background:var(--fld-h)}
.sw-vibes button.on{border-color:var(--cy); background:rgba(56,214,245,.14); box-shadow:0 6px 18px -6px rgba(56,214,245,.6)}
.sw.light .sw-vibes button.on,
html:not(.dark) .sw .sw-vibes button.on{
  color:#0284c7;
  border-color:#0284c7;
  background:rgba(2,132,199,.12);
  box-shadow:0 6px 18px -6px rgba(2,132,199,.35);
}

.sw-tabs{position:relative; display:grid; grid-template-columns:1fr 1fr; padding:4px; border-radius:16px; background:var(--fld); border:1px solid var(--line); margin-bottom:18px}
.sw.light .sw-tabs,
html:not(.dark) .sw .sw-tabs{
  background:rgba(226,232,240,.65);
  border-color:rgba(15,23,42,.08);
}
.sw-tabs .ind{position:absolute; top:4px; bottom:4px; inset-inline-start:4px; width:calc(50% - 4px); border-radius:12px;
  background:rgba(255,255,255,.12); box-shadow:0 1px 0 rgba(255,255,255,.12) inset; transition:inset-inline-start .3s cubic-bezier(.3,.9,.3,1)}
.sw.light .sw-tabs .ind,
html:not(.dark) .sw .sw-tabs .ind{
  background:#ffffff;
  box-shadow:0 4px 12px -2px rgba(14,116,144,.16), 0 1px 0 rgba(255,255,255,.95) inset;
}
.sw-tabs[data-tab=join] .ind{inset-inline-start:50%}
.sw-tabs button{position:relative; z-index:1; height:42px; border:0; background:none; font-size:14px; font-weight:600; color:var(--mut); transition:color .2s}
.sw-tabs button[aria-selected=true]{color:var(--ink)}
.sw.light .sw-tabs button[aria-selected=true],
html:not(.dark) .sw .sw-tabs button[aria-selected=true]{color:#0284c7; font-weight:700}

.sw-pane{animation:fade .3s both}
@keyframes fade{from{opacity:0; transform:translateY(6px)}to{opacity:1; transform:none}}

.sw-len2{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:12px;
  margin:14px 0 18px;
  font-size:13px;
  color:var(--mut);
  font-weight:600;
}
.sw-len2 .opts{
  flex:1;
  max-width:340px;
}
@media (max-width:520px){
  .sw-len2{ flex-direction:column; }
  .sw-len2 .opts{ max-width:none; width:100%; }
}

.sw-cta{
  position:relative; overflow:hidden; width:100%; height:54px; margin-top:6px; border:0; border-radius:16px;
  font-size:15.5px; font-weight:700; color:#fff; background:linear-gradient(135deg,#1d74ee,#2552d8 60%,#5b3fd6);
  box-shadow:0 16px 34px -12px rgba(37,99,235,.85), 0 1px 0 rgba(255,255,255,.3) inset; transition:transform .2s;
}
.sw-cta:hover{transform:translateY(-2px)}
.sw-cta:active{transform:scale(.985)}
.sw-cta::after{content:""; position:absolute; top:0; bottom:0; width:38%; inset-inline-start:-60%;
  background:linear-gradient(100deg,transparent,rgba(255,255,255,.35),transparent); transform:skewX(-20deg)}
.sw-cta:hover::after{inset-inline-start:130%; transition:inset-inline-start .7s ease}

.sw-code{display:grid; grid-template-columns:repeat(6,1fr); gap:8px}
.sw-code input{height:58px; padding:0; text-align:center; font-size:22px; font-weight:700; text-transform:uppercase; border-radius:14px; font-family:'Bricolage Grotesque',monospace}
.sw-code input.filled{border-color:rgba(52,211,153,.7); background:rgba(52,211,153,.08)}
.sw.light .sw-code input.filled,
html:not(.dark) .sw .sw-code input.filled{
  border-color:#10b981;
  background:rgba(16,185,129,.12);
  color:#065f46;
}

.sw-recent{margin-top:22px}
.sw-recent > span{display:block; font-size:12.5px; font-weight:600; color:var(--mut); margin-bottom:8px}
.sw-recent div{display:flex; gap:8px; overflow-x:auto; padding-bottom:4px}
.sw-recent button{flex:none; text-align:start; padding:10px 14px; border-radius:14px; background:var(--fld); border:1px solid var(--line); display:flex; flex-direction:column; gap:2px; transition:all .2s}
.sw-recent button:hover{border-color:var(--cy); transform:translateY(-2px)}
.sw-recent b{font-size:14px}
.sw-recent small{font-size:12px; color:var(--mut)}

.shake{animation:shake .4s}
@keyframes shake{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}

@media (max-width:520px){
  .sw{padding-top:16px}
  .sw-card{padding:28px 18px 24px; border-radius:24px}
  .sw-code input{height:50px; font-size:19px}
  .sw-sky .moon{width:110px; height:110px; left:-50px}
}
@media (prefers-reduced-motion:reduce){
  .sw *{animation-duration:.01s !important; transition-duration:.01s !important}
}
`;