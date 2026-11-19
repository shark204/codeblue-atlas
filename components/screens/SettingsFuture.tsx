// @ts-nocheck
// SettingsFuture v7 — dark by default; light only with real evidence (or theme="light")
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useTranslations } from "@/stores/languageStore";
import {
  User, BookOpen, Bell, BellOff, Shield, UserCog, KeyRound, Eye, EyeOff, Lock,
  LogOut, Trash2, RotateCcw, Mail, AlertTriangle, X, Info, ArrowLeft, Plus,
  MoreVertical, Pencil, Camera, Target, Brain, Flame, AlarmClock, Heart, Moon,
  Send, CalendarDays, Save, Check,
} from "lucide-react";
import { BackButton } from '../ui/BackButton';
/* =====================================================================
   SettingsFuture — one file, all tabs.
   Theme: pass theme="light" | "dark", or leave "auto" (reads <html class="dark|light">,
   data-theme, then prefers-color-scheme).
   ===================================================================== */

export const DEFAULT_NOTIF = {
  dailyReminder: { on: true, time: "20:00" },
  dailyGoal: { on: true, time: "21:00" },
  smartReview: { on: true, time: "07:00" },
  streak: { on: false, time: "21:00" },
  exam: { on: true, time: "09:00" },
  missYou: { on: true },
  quiet: { enabled: true, from: "23:00", to: "07:00" },
  limit: 3,
};

export default function SettingsFuture({
  theme = "auto",
  onBack,
  isAdmin = false,
  initialTab = "profile",
  adminTab, // optional: custom node. If omitted, the built-in Admin panel is used
  onScanDuplicates, onOpenAdmin,

  // Profile
  accounts = [],
  renderAvatar, // (account) => ReactNode  (use your gold hex frame here)
  onSwitchAccount, onAddAccount, onChangeUsername, onChangePhoto,
  onRemovePhoto, onSignOutAccount, onRemoveAccount,

  // Study — banks: [{ id, name, date: "2026-10-19", perDay: 21, tone: "cyan" }]
  banks = [],
  onSaveDate,

  // Notifications
  notif = DEFAULT_NOTIF,
  onNotifChange,
  pushEnabled = false,
  onTogglePush,
  onSendTest,
  timezone = "",

  // Security
  onChangePassword, onSendResetLink, onSignOut, onResetProgress, onDeleteAccount,
}) {
    const t = useTranslations('components_screens_SettingsFuture');
  const rootRef = useRef(null);
  const { mode, src } = useTheme(theme, rootRef);
  const tabs = [
    { id: "profile", label: t('profile'), icon: User },
    { id: "study", label: t('study'), icon: BookOpen },
    { id: "notifications", label: t('notifications'), icon: Bell },
    { id: "security", label: t('security'), icon: Shield },
    ...(isAdmin ? [{ id: "admin", label: t('admin'), icon: UserCog }] : []),
  ];

  const [active, setActive] = useState(initialTab);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const refs = useRef({});

  useLayoutEffect(() => {
    const place = () => {
      const el = refs.current[active];
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active, isAdmin]);

  return (
    <div className="sx-root" data-theme={mode} data-detected={src} ref={rootRef}>
      <style>{css}</style>
      <div className="sx-grid" aria-hidden />

      <div className="sx-wrap">
        {onBack && (
<BackButton onClick={onBack} label={t('back')} />        )}
        <header className="sx-head">
          <h1>{t('settings')}</h1>
          <p>{t('profile_study_plan_notifications_and')}</p>
        </header>

        <nav className="sx-tabs" role="tablist">
          <span className="sx-pill" style={{ transform: `translateX(${pill.left}px)`, width: pill.width }} />
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              ref={(el) => (refs.current[id] = el)}
              role="tab"
              aria-selected={active === id}
              className={active === id ? "on" : ""}
              onClick={() => setActive(id)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <main key={active} className="sx-body">
          {active === "profile" && (
            <ProfileTab
              accounts={accounts} renderAvatar={renderAvatar}
              onSwitch={onSwitchAccount} onAdd={onAddAccount}
              onChangeUsername={onChangeUsername} onChangePhoto={onChangePhoto}
              onRemovePhoto={onRemovePhoto} onSignOut={onSignOutAccount} onRemove={onRemoveAccount}
            />
          )}
          {active === "study" && <StudyTab banks={banks} onSave={onSaveDate} />}
          {active === "notifications" && (
            <NotificationsTab
              value={notif} onChange={onNotifChange} pushEnabled={pushEnabled}
              onTogglePush={onTogglePush} onSendTest={onSendTest} timezone={timezone}
            />
          )}
          {active === "security" && (
            <SecurityTab
              onChangePassword={onChangePassword} onSendResetLink={onSendResetLink}
              onSignOut={onSignOut} onResetProgress={onResetProgress} onDeleteAccount={onDeleteAccount}
            />
          )}
          {active === "admin" && (
            adminTab ? <section className="sx-card">{adminTab}</section>
              : <AdminTab onScan={onScanDuplicates} onOpen={onOpenAdmin} />
          )}
        </main>
      </div>
    </div>
  );
}

/* ------------------------------ Theme hook ------------------------------ */

function luminance(rgb) {
  const m = (rgb || "").match(/[\d.]+/g);
  if (!m || m.length < 3) return null;
  const [r, g, b] = m.slice(0, 3).map(Number);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

const DARK_TOKENS = ["dark", "dark-mode", "theme-dark", "night"];
const LIGHT_TOKENS = ["light", "light-mode", "theme-light", "day"];

/* Returns { mode, src }. Dark is the default; "light" needs positive evidence. */
function detectTheme(root) {
  const chain = [];
  for (let n = root?.parentElement; n; n = n.parentElement) chain.push(n);

  // 1) explicit marker on any ancestor (class token / data-theme / color-scheme)
  for (const n of chain) {
    const tokens = String(n.className?.baseVal ?? n.className ?? "").toLowerCase().split(/\s+/);
    const attr = `${n.getAttribute("data-theme") || ""} ${n.getAttribute("data-mode") || ""} ${n.getAttribute("data-color-mode") || ""} ${n.style?.colorScheme || ""}`.toLowerCase();
    const words = [...tokens, ...attr.split(/\s+/)];
    if (words.some((w) => DARK_TOKENS.includes(w))) return { mode: "dark", src: "marker" };
    if (words.some((w) => LIGHT_TOKENS.includes(w))) return { mode: "light", src: "marker" };
  }

  // 2) first opaque background colour going up the tree
  for (const n of chain) {
    const c = getComputedStyle(n).backgroundColor;
    const m = c.match(/[\d.]+/g);
    if (m && m.length >= 3 && (m.length < 4 || Number(m[3]) > 0.5)) {
      const l = luminance(c);
      if (l !== null) return { mode: l < 0.5 ? "dark" : "light", src: "background" };
    }
  }

  // 3) light inherited text means a dark UI. Dark text is NOT evidence of a light UI
  //    (it is also the browser default), so it never decides "light".
  // 4) default
  return { mode: "dark", src: "default" };
}

function useTheme(pref, rootRef) {
  const [t, setT] = useState({ mode: pref === "light" ? "light" : "dark", src: "prop" });
  useEffect(() => {
    if (pref === "light" || pref === "dark") { setT({ mode: pref, src: "prop" }); return; }
    const run = () => {
      const r = detectTheme(rootRef.current);
      setT((p) => (p.mode === r.mode && p.src === r.src ? p : r));
    };
    run();
    let raf = 0;
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(run); };
    const mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["class", "style", "data-theme", "data-mode"] });
    window.addEventListener("storage", schedule);
    return () => { cancelAnimationFrame(raf); mo.disconnect(); window.removeEventListener("storage", schedule); };
  }, [pref]);
  return t;
}

/* -------------------------------- Profile -------------------------------- */

function ProfileTab({ accounts, renderAvatar, onSwitch, onAdd, onChangeUsername, onChangePhoto, onRemovePhoto, onSignOut, onRemove }) {
    const t = useTranslations('components_screens_SettingsFuture');
  const [menu, setMenu] = useState(null);
  useEffect(() => {
    const close = () => setMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  return (
    <div className="sx-stack">
      <section className="sx-card">
        <div className="sx-between">
          <div>
            <h2 className="plain">{t('accounts')}</h2>
            <p className="sx-sub">{t('switch_between_saved_accounts_or')}</p>
          </div>
          <button className="sx-ghost" onClick={onAdd}><Plus size={15} /> {t('add')}</button>
        </div>

        <ul className="sx-accounts">
          {accounts.map((a) => (
            <li key={a.id} className={a.active ? "active" : ""}>
              <button className="main" onClick={() => !a.active && onSwitch?.(a.id)} aria-label={`Switch to ${a.name}`}>
                <span className="av">
                  {renderAvatar ? renderAvatar(a) : a.photoUrl
                    ? <img src={a.photoUrl} alt="" />
                    : <b>{(a.name || "?")[0].toUpperCase()}</b>}
                </span>
                <span className="who">
                  <strong>{a.name} {a.active && <em className="sx-badge">{t('active')}</em>}</strong>
                  <small>{a.email}</small>
                </span>
              </button>

              <div className="menu-wrap" onClick={(e) => e.stopPropagation()}>
                <button className="dots" aria-label={t('account_options')} onClick={() => setMenu(menu === a.id ? null : a.id)}>
                  <MoreVertical size={17} />
                </button>
                {menu === a.id && (
                  <div className="sx-menu" role="menu">
                    <button onClick={() => { setMenu(null); onChangeUsername?.(a.id); }}><Pencil size={14} /> {t('change_username')}</button>
                    <button onClick={() => { setMenu(null); onChangePhoto?.(a.id); }}><Camera size={14} /> {t('change_photo')}</button>
                    <button onClick={() => { setMenu(null); onRemovePhoto?.(a.id); }}><Trash2 size={14} /> {t('remove_photo')}</button>
                    <hr />
                    <button onClick={() => { setMenu(null); onSignOut?.(a.id); }}><LogOut size={14} /> {t('sign_out')}</button>
                    <button className="red" onClick={() => { setMenu(null); onRemove?.(a.id); }}><X size={14} /> {t('remove_account')}</button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="sx-note info"><Info size={16} /> {t('your_profile_and_progress_are')}</div>
    </div>
  );
}

/* --------------------------------- Study --------------------------------- */

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.round((d - now) / 86400000);
}

function StudyTab({ banks, onSave }) {
    const t = useTranslations('components_screens_SettingsFuture');
  return (
    <div className="sx-stack">
      <div className="sx-note info"><Info size={16} /> {t('set_an_exam_date_for')}</div>
      {banks.map((b) => <BankCard key={b.id} bank={b} onSave={onSave} />)}
    </div>
  );
}

function BankCard({ bank, onSave }) {
    const t = useTranslations('components_screens_SettingsFuture');
  const [date, setDate] = useState(bank.date || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirty = date !== (bank.date || "");
  const left = daysUntil(bank.date);

  const save = async () => {
    setSaving(true);
    try { await onSave?.(bank.id, date); setSaved(true); setTimeout(() => setSaved(false), 1800); }
    finally { setSaving(false); }
  };

  return (
    <section className={`sx-card bank ${bank.tone || "ion"}`}>
      <div className="sx-between">
        <h2 className="plain"><span className="dot" /> {bank.name}</h2>
        {left !== null && left >= 0 && (
          <div className="count"><b>{left}</b><span>{left === 1 ? "day left" : "days left"}</span></div>
        )}
      </div>

      <label className="sx-field">
        <span>{t('exam_date')}</span>
        <div>
          <CalendarDays size={17} className="lead" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </label>

      <div className="bank-foot">
        {bank.perDay && left > 0 ? <p>{t('target')} <b>{bank.perDay}</b> {t('questions_day')}</p> : <p>{t('text')}</p>}
        <button className="sx-primary slim" disabled={!dirty || saving} onClick={save}>
          {saved ? <><Check size={15} /> {t('saved')}</> : <><Save size={15} /> {saving ? t('saving') : t('save_date')}</>}
        </button>
      </div>
    </section>
  );
}

/* ----------------------------- Notifications ----------------------------- */

function NotificationsTab({ value, onChange, pushEnabled, onTogglePush, onSendTest, timezone }) {
    const t = useTranslations('components_screens_SettingsFuture');
  const [v, setV] = useState({ ...DEFAULT_NOTIF, ...value });
  useEffect(() => setV({ ...DEFAULT_NOTIF, ...value }), [value]);

  const set = (patch) => { const n = { ...v, ...patch }; setV(n); onChange?.(n); };
  const setItem = (k, patch) => set({ [k]: { ...v[k], ...patch } });

  // ✅ هل في إشعارات مفعّلة من غير push master؟
  const anyItemOn =
    v.dailyReminder?.on || v.dailyGoal?.on || v.smartReview?.on ||
    v.streak?.on || v.exam?.on || v.missYou?.on;
  const showWarning = !pushEnabled && anyItemOn;

  const Item = ({ k, icon, title, desc, tint, noTime }) => (
    <Row3 icon={icon} tint={tint} title={title} desc={desc}>
      {!noTime && (
        <input type="time" className="sx-time" value={v[k].time} disabled={!v[k].on}
          onChange={(e) => setItem(k, { time: e.target.value })} aria-label={`${title} time`} />
      )}
      <Switch on={v[k].on} onChange={(on) => setItem(k, { on })} label={title} />
    </Row3>
  );

  const quietOn = v.quiet?.enabled !== false;

  return (
    <div className="sx-stack">

      {/* ⚠️ تحذير: إشعارات مفعّلة لكن push مقفول */}
      {showWarning && (
        <div className="sx-warn" role="alert">
          <AlertTriangle size={20} />
          <div className="sx-warn-text">
            <strong>{t('push_notifications_are_turned_off')}</strong>
            <small>
              {t('your_reminders_are_saved_but')}
                                      </small>
          </div>
          <button className="sx-warn-btn" onClick={() => onTogglePush?.(true)}>
            <Bell size={14} /> {t('enable_now')}
                                </button>
        </div>
      )}

      <section className="sx-card push">
        <div className="push-top">
          <span className={`push-ico ${pushEnabled ? "live" : ""}`}><Bell size={22} /></span>
          <div>
            <h2 className="plain">Push notifications {pushEnabled && <em className="sx-badge">{t('active')}</em>}</h2>
            <p className="sx-sub">
              {pushEnabled
                ? t('reminders_reach_you_even_when')
                : t('turn_on_to_get_reminders')}
            </p>
          </div>
        </div>
        <div className="push-btns">
          {pushEnabled ? (
            <>
              <button className="sx-primary slim" onClick={onSendTest}><Send size={15} /> {t('send_test')}</button>
              <button className="sx-ghost" onClick={() => onTogglePush?.(false)}><BellOff size={15} /> {t('turn_off')}</button>
            </>
          ) : (
            <button className="sx-primary slim greenbtn" onClick={() => onTogglePush?.(true)}>
              <Bell size={15} /> {t('turn_on')}
                                          </button>
          )}
        </div>
      </section>

      <Group title={t('study')}>
        <Item k="dailyReminder" icon={Bell} tint="cyan" title={t('daily_reminder')} desc="A nudge to start your practice" />
        <Item k="dailyGoal" icon={Target} tint="rose" title={t('daily_goal')} desc="Questions left toward today's target" />
        <Item k="smartReview" icon={Brain} tint="violet" title={t('smart_review')} desc="When spaced-repetition questions are due" />
      </Group>

      <Group title={t('motivation')}>
        <Item k="streak" icon={Flame} tint="amber" title={t('streak_protection')} desc="Save your streak before the day ends" />
        <Item k="exam" icon={AlarmClock} tint="amber" title={t('exam_countdown')} desc="Days left and the pace you need" />
        <Item k="missYou" icon={Heart} tint="rose" title={t('we_miss_you')} desc="A gentle ping after 3+ days away" noTime />
      </Group>

      <Group title={t('preferences')}>

        {/* ✅ Quiet hours — مع زرار تشغيل/إيقاف */}
        <Row3
          icon={Moon}
          tint="violet"
          title={t('quiet_hours')}
          desc={quietOn
            ? "No notifications in this window"
            : "Notifications will be sent any time"}
        >
          <div className="range">
            <input
              type="time"
              className="sx-time"
              value={v.quiet.from}
              disabled={!quietOn}
              onChange={(e) => set({ quiet: { ...v.quiet, from: e.target.value } })}
              aria-label={t('quiet_hours_start')}
            />
            <span>{t('to')}</span>
            <input
              type="time"
              className="sx-time"
              value={v.quiet.to}
              disabled={!quietOn}
              onChange={(e) => set({ quiet: { ...v.quiet, to: e.target.value } })}
              aria-label={t('quiet_hours_end')}
            />
          </div>
          <Switch
            on={quietOn}
            onChange={(on) => set({ quiet: { ...v.quiet, enabled: on } })}
            label={t('quiet_hours')}
          />
        </Row3>

        <Row3 icon={Bell} tint="cyan" title={t('daily_limit')} desc="Max notifications per day">
          <div className="seg" role="radiogroup" aria-label={t('daily_limit')}>
            {[1, 2, 3, 5].map((n) => (
              <button key={n} role="radio" aria-checked={v.limit === n}
                className={v.limit === n ? "on" : ""}
                onClick={() => set({ limit: n })}>{n}</button>
            ))}
          </div>
        </Row3>
      </Group>

      {timezone && (
        <p className="sx-foot">
          Times follow your timezone ({timezone}). A reminder is skipped when it isn't needed, like when you've already hit your goal.
        </p>
      )}
    </div>
  );
}

function Group({ title, children }) {
  return (
    <div>
      <h3 className="sx-group">{title}</h3>
      <section className="sx-card list">{children}</section>
    </div>
  );
}

function Row3({ icon: Icon, tint, title, desc, children }) {
  return (
    <div className="r3">
      <span className={`ico ${tint}`}><Icon size={18} /></span>
      <div className="txt"><strong>{title}</strong><small>{desc}</small></div>
      <div className="ctl">{children}</div>
    </div>
  );
}

function Switch({ on, onChange, label }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} className={`sx-switch ${on ? "on" : ""}`} onClick={() => onChange(!on)}>
      <i />
    </button>
  );
}

/* --------------------------------- Admin --------------------------------- */

function AdminTab({ onScan, onOpen }) {
    const t = useTranslations('components_screens_SettingsFuture');
  const [scanning, setScanning] = useState(false);
  const scan = async () => { setScanning(true); try { await onScan?.(); } finally { setScanning(false); } };
  return (
    <section className="sx-card adm">
      <h2 className="plain">{t('duplicate_cleanup')}</h2>
      <p className="sx-sub">{t('find_and_remove_duplicate_questions')}</p>
      <div className="adm-actions">
        <button className="sx-ghost" onClick={scan} disabled={scanning}>{scanning ? t('scanning') : t('scan_for_duplicates')}</button>
        <button className="sx-primary amberbtn" onClick={onOpen}><UserCog size={16} /> {t('open_admin_dashboard')}</button>
      </div>
    </section>
  );
}

/* ------------------------------- Security ------------------------------- */

function SecurityTab({ onChangePassword, onSendResetLink, onSignOut, onResetProgress, onDeleteAccount }) {
    const t = useTranslations('components_screens_SettingsFuture');
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [conf, setConf] = useState("");
  const [show, setShow] = useState({ cur: false, next: false, conf: false });
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const strength = scorePassword(next);
  const mismatch = conf.length > 0 && conf !== next;
  const canSave = cur && next.length >= 8 && next === conf && busy !== "pw";

  const run = async (key, fn, okText) => {
    setBusy(key); setMsg(null);
    try { await fn?.(); if (okText) setMsg({ type: "ok", text: okText }); }
    catch (e) { setMsg({ type: "err", text: e?.message || "Something went wrong. Try again." }); }
    finally { setBusy(""); }
  };

  return (
    <div className="sx-stack">
      <section className="sx-card">
        <h2><KeyRound size={18} className="amber" /> {t('change_password')}</h2>

        <PwField label={t('current_password')} value={cur} onChange={setCur}
          shown={show.cur} toggle={() => setShow((s) => ({ ...s, cur: !s.cur }))} autoComplete="current-password" />
        <PwField label={t('new_password')} value={next} onChange={setNext}
          shown={show.next} toggle={() => setShow((s) => ({ ...s, next: !s.next }))} autoComplete="new-password" />

        <div className="sx-meter" data-level={strength.level}>
          <i /><i /><i /><i />
          <span>{next ? strength.label : t('use_8_characters_with_numbers')}</span>
        </div>

        <PwField label={t('confirm_new_password')} value={conf} onChange={setConf}
          shown={show.conf} toggle={() => setShow((s) => ({ ...s, conf: !s.conf }))} autoComplete="new-password"
          error={mismatch ? "Passwords don't match" : ""} />

        <button className="sx-primary" disabled={!canSave}
          onClick={() => run("pw", async () => { await onChangePassword?.(cur, next); setCur(""); setNext(""); setConf(""); }, "Password updated.")}>
          <Lock size={16} /> {busy === "pw" ? t('saving') : t('save_new_password')}
        </button>
      </section>

      {msg && <div className={`sx-note ${msg.type}`} role="status"><Info size={16} /> {msg.text}</div>}

      <section className="sx-danger">
        <span className="sx-tag"><b /> {t('danger_zone')}</span>
        <h2>{t('account_access_deletion')}</h2>
        <p className="sub">{t('recover_access_end_this_session')}</p>

        <DRow icon={Mail} title={t('forgot_your_password')} desc="Send a secure reset link to your email."
          action="Send reset link" busy={busy === "reset-link"}
          onClick={() => run("reset-link", onSendResetLink, "Reset link sent. Check your inbox.")} />
        <DRow icon={LogOut} title={t('sign_out')} desc="Your progress stays saved. Sign back in anytime."
          action="Sign out" onClick={onSignOut} />
        <DRow icon={RotateCcw} tone="warn" title={t('reset_all_progress')} desc="Permanently deletes your score history. Can't be undone."
          action="Delete my progress" onClick={() => setConfirm("reset")} />

        <button className="sx-delete" onClick={() => setConfirm("delete")}><Trash2 size={16} /> {t('delete_my_account')}</button>
      </section>

      {confirm && (
        <ConfirmModal kind={confirm} onClose={() => setConfirm(null)}
          onConfirm={async () => {
            const k = confirm; setConfirm(null);
            await run(k, k === "reset" ? onResetProgress : onDeleteAccount, k === "reset" ? "Progress deleted." : "");
          }} />
      )}
    </div>
  );
}

function DRow({ icon: Icon, title, desc, action, onClick, busy, tone }) {
    const t = useTranslations('components_screens_SettingsFuture');
  return (
    <div className={`sx-row ${tone || ""}`}>
      <div className="top">
        <span className="ico"><Icon size={18} /></span>
        <div><h3>{title}</h3><p>{desc}</p></div>
      </div>
      <button onClick={onClick} disabled={busy}>{busy ? t('working') : action}</button>
    </div>
  );
}

function PwField({ label, value, onChange, shown, toggle, error, autoComplete }) {
  return (
    <label className={`sx-field ${error ? "bad" : ""}`}>
      <span>{label}</span>
      <div>
        <input type={shown ? "text" : "password"} value={value} autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)} placeholder="••••••••" />
        <button type="button" className="eye" onClick={toggle} aria-label={shown ? "Hide password" : "Show password"}>
          {shown ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <em>{error}</em>}
    </label>
  );
}

function ConfirmModal({ kind, onClose, onConfirm }) {
    const t = useTranslations('components_screens_SettingsFuture');
  const word = kind === "delete" ? "DELETE" : "RESET";
  const [typed, setTyped] = useState("");
  const copy = kind === "delete"
    ? { title: t('delete_your_account'), body: "Your account, score history and saved progress will be removed for good.", cta: "Delete account" }
    : { title: t('reset_all_progress_2'), body: "Your score history will be permanently deleted. Your account stays.", cta: "Delete progress" };
  return (
    <div className="sx-modal" onClick={onClose}>
      <div className="box" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="x" onClick={onClose} aria-label={t('close')}><X size={18} /></button>
        <AlertTriangle size={28} />
        <h3>{copy.title}</h3>
        <p>{copy.body}</p>
        <label>{t('type')} <b>{word}</b> {t('to_continue')}
                        <input value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
        </label>
        <div className="btns">
          <button onClick={onClose}>{t('cancel')}</button>
          <button className="go" disabled={typed !== word} onClick={onConfirm}>{copy.cta}</button>
        </div>
      </div>
    </div>
  );
}

function scorePassword(p) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p) || p.length >= 14) s++;
  return { level: s, label: ["Too weak", "Weak", "Okay", "Strong", "Excellent"][s] };
}

/* -------------------------------- Styles -------------------------------- */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');

.sx-root{
  /* dark (default) */
  --bg:#060914; --glass:rgba(255,255,255,.055); --line:rgba(160,175,255,.16);
  --field:rgba(5,8,22,.6); --inner:rgba(8,11,28,.55);
  --text:#FFFFFF; --mute:rgba(255,255,255,.84); --faint:rgba(255,255,255,.55);
  --ion:#7C6CFF; --ice:#58E1D0; --amber:#FFB454; --red:#FF5C7F; --rose:#FF6FA3; --violet:#B58BFF; --cyan:#4CC9FF;
  --shadow:0 30px 60px -30px rgba(0,0,0,.7); --hi:rgba(255,255,255,.08); --gridop:.55;
  position:relative; min-height:100vh; color:var(--text); background:transparent;
  font-family:'Sora',system-ui,sans-serif; isolation:isolate; overflow:hidden; padding:24px 18px 64px;
}
/* light — near-black text, no washed-out grey */
.sx-root[data-theme="light"]{
  --bg:#ECEFFF; --glass:rgba(255,255,255,.62); --line:rgba(25,35,110,.18);
  --field:rgba(255,255,255,.85); --inner:rgba(255,255,255,.6);
  --text:#070B26; --mute:#28305E; --faint:#4A5489;
  --ion:#5442F5; --ice:#0B8A7C; --amber:#A85F00; --red:#D01B47; --rose:#C41F68; --violet:#6B3FD6; --cyan:#0A7FB5;
  --shadow:0 24px 50px -28px rgba(30,40,120,.35); --hi:rgba(255,255,255,.9); --gridop:.45;
}
.sx-root *{box-sizing:border-box}
.sx-root button{font-family:inherit}
.sx-grid{position:absolute; inset:0; z-index:-1; opacity:var(--gridop);
  background:
    radial-gradient(60% 40% at 80% -5%, color-mix(in srgb,var(--ion) 30%,transparent), transparent 70%),
    radial-gradient(50% 40% at 0% 30%, color-mix(in srgb,var(--ice) 14%,transparent), transparent 70%),
    linear-gradient(var(--line) 1px, transparent 1px) 0 0/44px 44px,
    linear-gradient(90deg, var(--line) 1px, transparent 1px) 0 0/44px 44px;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 22%,#000 78%,transparent),linear-gradient(180deg,transparent,#000 14%,#000 55%,transparent);
  mask-image:linear-gradient(90deg,transparent,#000 22%,#000 78%,transparent),linear-gradient(180deg,transparent,#000 14%,#000 55%,transparent);
  -webkit-mask-composite:source-in; mask-composite:intersect}
/* Soft veil: keeps text readable on any app background, fades out at the edges (no hard box) */
.sx-wrap::before{content:""; position:absolute; inset:-40px -90px; z-index:-1; pointer-events:none;
  -webkit-mask-image:radial-gradient(closest-side, #000 45%, transparent 100%);
  mask-image:radial-gradient(closest-side, #000 45%, transparent 100%)}
.sx-root[data-theme="dark"] .sx-wrap::before{display:none}
.sx-root[data-theme="light"] .sx-wrap::before{background:rgba(240,243,255,.72); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px)}

/* Light = airy pastel aurora. Dark = neon deep space. */
.sx-root[data-theme="light"] .sx-grid{
  background:
    radial-gradient(55% 38% at 88% 0%, rgba(124,108,255,.30), transparent 70%),
    radial-gradient(45% 35% at 4% 28%, rgba(56,214,196,.24), transparent 70%),
    radial-gradient(40% 30% at 60% 75%, rgba(255,150,200,.16), transparent 70%),
    linear-gradient(var(--line) 1px, transparent 1px) 0 0/44px 44px,
    linear-gradient(90deg, var(--line) 1px, transparent 1px) 0 0/44px 44px}
.sx-root[data-theme="light"] .sx-card,
.sx-root[data-theme="light"] .sx-tabs{box-shadow:0 18px 40px -22px rgba(60,50,200,.35), inset 0 1px 0 rgba(255,255,255,.95)}
.sx-root[data-theme="dark"] .sx-card{box-shadow:0 30px 60px -30px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.1), 0 0 0 1px rgba(124,108,255,.06)}

.sx-wrap{position:relative; max-width:640px; margin-inline:auto}

/* admin */
.adm h2{margin-bottom:6px}
.adm .sx-sub{margin-bottom:16px}
.adm-actions{display:flex; flex-direction:column; gap:10px}
.adm .sx-ghost{width:100%; justify-content:center; padding:13px}
.sx-primary.amberbtn{background:linear-gradient(135deg,#FFB454,#FF8A3D); color:#2A1500;
  box-shadow:0 10px 28px -8px rgba(255,150,60,.6), inset 0 1px 0 rgba(255,255,255,.45)}

.sx-back{display:inline-flex; align-items:center; gap:7px; margin-bottom:18px; padding:8px 14px; border-radius:12px; cursor:pointer;
  font:500 13px 'Sora',sans-serif; color:var(--text); background:var(--glass); border:1px solid var(--line)}
.sx-head h1{margin:0; font-size:28px; font-weight:600; letter-spacing:-.02em}
.sx-head p{margin:6px 0 20px; color:var(--mute); font-size:14px}

/* tabs */
.sx-tabs{position:relative; display:flex; gap:2px; padding:5px; border-radius:20px; overflow-x:auto; scrollbar-width:none;
  background:var(--glass); border:1px solid var(--line); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px)}
.sx-tabs::-webkit-scrollbar{display:none}
.sx-pill{position:absolute; top:5px; bottom:5px; left:0; border-radius:15px; z-index:0;
  background:linear-gradient(135deg,var(--ion),#5B8CFF); box-shadow:0 6px 22px -4px color-mix(in srgb,var(--ion) 65%,transparent), inset 0 1px 0 rgba(255,255,255,.35);
  transition:transform .35s cubic-bezier(.3,1.2,.4,1), width .35s cubic-bezier(.3,1.2,.4,1)}
.sx-tabs button{position:relative; z-index:1; flex:1 0 auto; display:flex; align-items:center; justify-content:center; gap:8px;
  padding:11px 16px; border:0; background:none; color:var(--mute); font:500 13.5px 'Sora',sans-serif; cursor:pointer; border-radius:15px; transition:color .2s}
.sx-tabs button.on{color:#fff}
.sx-tabs button:hover:not(.on){color:var(--text)}
.sx-root :focus-visible{outline:2px solid var(--ice); outline-offset:2px}

.sx-body{margin-top:18px; animation:sxIn .35s ease both}
@keyframes sxIn{from{opacity:0; transform:translateY(8px)}to{opacity:1; transform:none}}
.sx-stack{display:flex; flex-direction:column; gap:16px}
.sx-between{display:flex; align-items:flex-start; justify-content:space-between; gap:12px}

/* card */
.sx-card{padding:22px; border-radius:24px; background:var(--glass); border:1px solid var(--line);
  backdrop-filter:blur(22px); -webkit-backdrop-filter:blur(22px); box-shadow:var(--shadow), inset 0 1px 0 var(--hi)}
.sx-card h2{display:flex; align-items:center; gap:10px; margin:0 0 18px; font-size:17px; font-weight:600; color:var(--text)}
.sx-card h2.plain{margin:0 0 4px}
.sx-sub{margin:0; font-size:13px; color:var(--mute); line-height:1.5}
.amber{color:var(--amber)}
.sx-badge{font-style:normal; font-size:11px; font-weight:600; padding:3px 9px; border-radius:99px; color:var(--ice);
  background:color-mix(in srgb,var(--ice) 14%,transparent); border:1px solid color-mix(in srgb,var(--ice) 40%,transparent)}

.sx-ghost{display:inline-flex; align-items:center; gap:7px; padding:9px 14px; border-radius:12px; cursor:pointer; white-space:nowrap;
  font:600 13px 'Sora',sans-serif; color:var(--text); background:var(--glass); border:1px solid var(--line); transition:border-color .2s, background .2s}
.sx-ghost:hover{border-color:var(--ion); background:color-mix(in srgb,var(--ion) 12%,var(--glass))}

/* accounts */
.sx-accounts{list-style:none; margin:18px 0 0; padding:0; display:flex; flex-direction:column; gap:10px}
.sx-accounts li{position:relative; display:flex; align-items:center; gap:6px; padding:8px; border-radius:18px; background:var(--inner); border:1px solid var(--line); transition:border-color .2s}
.sx-accounts li.active{border-color:color-mix(in srgb,var(--ion) 65%,transparent); box-shadow:0 0 28px -10px var(--ion)}
.sx-accounts .main{flex:1; min-width:0; display:flex; align-items:center; gap:14px; padding:6px; border:0; background:none; text-align:left; cursor:pointer; color:var(--text)}
.sx-accounts .av{flex:none; width:56px; height:56px; display:grid; place-items:center}
.sx-accounts .av img{width:100%; height:100%; object-fit:cover; border-radius:50%}
.sx-accounts .av b{width:46px; height:46px; display:grid; place-items:center; border-radius:50%; font-size:18px; color:var(--text); background:color-mix(in srgb,var(--ion) 22%,transparent); border:1px solid var(--line)}
.sx-accounts .who{display:flex; flex-direction:column; gap:3px; min-width:0}
.sx-accounts strong{display:flex; align-items:center; gap:8px; font-size:15px; font-weight:600}
.sx-accounts small{font-size:12.5px; color:var(--mute); overflow:hidden; text-overflow:ellipsis}
.menu-wrap{position:relative}
.dots{width:38px; height:38px; display:grid; place-items:center; border-radius:12px; cursor:pointer; color:var(--text); background:var(--glass); border:1px solid var(--line)}
.sx-menu{position:absolute; right:0; top:44px; z-index:20; min-width:196px; padding:6px; border-radius:16px; background:var(--field); border:1px solid var(--line); box-shadow:0 24px 50px -12px rgba(0,0,0,.55)}
.sx-root[data-theme="dark"] .sx-menu{background:#0E1330}
.sx-menu button{width:100%; display:flex; align-items:center; gap:10px; padding:10px 12px; border:0; border-radius:10px; background:none; cursor:pointer; font:500 13px 'Sora',sans-serif; color:var(--text); text-align:left}
.sx-menu button:hover{background:color-mix(in srgb,var(--ion) 14%,transparent)}
.sx-menu .red{color:var(--red)}
.sx-menu hr{border:0; border-top:1px solid var(--line); margin:5px 4px}

/* study */
.bank .dot{width:10px; height:10px; border-radius:50%; background:var(--ion); box-shadow:0 0 12px var(--ion)}
.bank.cyan .dot{background:var(--cyan); box-shadow:0 0 12px var(--cyan)}
.bank.violet .dot{background:var(--violet); box-shadow:0 0 12px var(--violet)}
.bank.rose .dot{background:var(--rose); box-shadow:0 0 12px var(--rose)}
.bank .count{display:flex; align-items:baseline; gap:6px; padding:6px 12px; border-radius:14px; background:var(--inner); border:1px solid var(--line)}
.bank .count b{font-size:20px; font-weight:700; color:var(--text)}
.bank .count span{font-size:12px; color:var(--mute)}
.bank .sx-field{margin-top:16px}
.bank-foot{display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap}
.bank-foot p{margin:0; font-size:13px; color:var(--mute)}
.bank-foot b{color:var(--text)}
.sx-primary.slim{width:auto; padding:11px 18px; font-size:14px; border-radius:13px}

/* fields */
.sx-field{display:block; margin-bottom:14px}
.sx-field>span{display:block; margin-bottom:7px; font-size:12.5px; color:var(--mute); font-weight:500}
.sx-field>div{display:flex; align-items:center; border-radius:14px; background:var(--field); border:1px solid var(--line); transition:border-color .2s, box-shadow .2s}
.sx-field>div:focus-within{border-color:var(--ion); box-shadow:0 0 0 4px color-mix(in srgb,var(--ion) 20%,transparent)}
.sx-field.bad>div{border-color:var(--red)}
.sx-field .lead{margin-left:14px; color:var(--mute)}
.sx-field input{flex:1; min-width:0; padding:14px 16px; background:none; border:0; outline:0; color:var(--text); font:500 15px 'Sora',sans-serif; color-scheme:dark}
.sx-root[data-theme="light"] .sx-field input,.sx-root[data-theme="light"] .sx-time{color-scheme:light}
.sx-field input[type=password]{letter-spacing:.08em}
.sx-field input::placeholder{color:var(--faint)}
.sx-field .eye{padding:0 14px; height:46px; background:none; border:0; color:var(--mute); cursor:pointer}
.sx-field .eye:hover{color:var(--ice)}
.sx-field em{display:block; margin-top:6px; font-style:normal; font-size:12px; color:var(--red)}

.sx-meter{display:grid; grid-template-columns:repeat(4,1fr); gap:5px; margin:-4px 0 16px}
.sx-meter i{height:4px; border-radius:4px; background:var(--line); transition:background .25s}
.sx-meter span{grid-column:1/-1; margin-top:4px; font-size:12px; color:var(--mute)}
.sx-meter[data-level="1"] i:nth-child(-n+1){background:var(--red)}
.sx-meter[data-level="2"] i:nth-child(-n+2){background:var(--amber)}
.sx-meter[data-level="3"] i:nth-child(-n+3){background:var(--ice)}
.sx-meter[data-level="4"] i{background:var(--ice)}

.sx-primary{width:100%; display:flex; align-items:center; justify-content:center; gap:8px; padding:15px; border:0; border-radius:15px; cursor:pointer;
  color:#fff; font:600 15px 'Sora',sans-serif; background:linear-gradient(135deg,var(--ion),#5B8CFF);
  box-shadow:0 10px 28px -8px color-mix(in srgb,var(--ion) 75%,transparent), inset 0 1px 0 rgba(255,255,255,.3); transition:transform .15s, filter .2s}
.sx-primary:hover:not(:disabled){transform:translateY(-1px); filter:brightness(1.08)}
.sx-primary:disabled{opacity:.42; cursor:not-allowed; box-shadow:none}
.sx-primary.greenbtn{background:linear-gradient(135deg,#10B981,#059669); color:#fff;
  box-shadow:0 10px 28px -8px color-mix(in srgb,#10B981 75%,transparent), inset 0 1px 0 rgba(255,255,255,.3)}

.sx-note{display:flex; align-items:center; gap:10px; padding:13px 16px; border-radius:14px; font-size:13.5px; line-height:1.45; color:var(--text); border:1px solid var(--line); background:var(--glass)}
.sx-note svg{flex:none}
.sx-note.info{border-left:3px solid var(--ion)}
.sx-note.ok{color:var(--ice); border-color:color-mix(in srgb,var(--ice) 45%,transparent); background:color-mix(in srgb,var(--ice) 10%,var(--glass))}
.sx-note.err{color:var(--red); border-color:color-mix(in srgb,var(--red) 45%,transparent); background:color-mix(in srgb,var(--red) 9%,var(--glass))}

/* notifications */
.push{background:linear-gradient(135deg,color-mix(in srgb,var(--ion) 20%,var(--glass)),var(--glass))}
.push-top{display:flex; gap:14px; align-items:center}
.push-top h2{display:flex; align-items:center; gap:10px; flex-wrap:wrap}
.push-ico{flex:none; position:relative; width:50px; height:50px; display:grid; place-items:center; border-radius:16px; color:#fff; background:linear-gradient(135deg,var(--ion),var(--cyan))}
.push-ico.live::after{content:""; position:absolute; right:-3px; bottom:-3px; width:12px; height:12px; border-radius:50%; background:var(--ice); border:2px solid var(--bg); box-shadow:0 0 10px var(--ice)}
.push-btns{display:flex; gap:10px; margin-top:16px}
.sx-group{margin:6px 4px 10px; font-size:13px; font-weight:600; color:var(--mute)}
.sx-card.list{padding:6px 16px}
.r3{display:flex; align-items:center; gap:12px; padding:14px 0; border-bottom:1px solid var(--line); flex-wrap:wrap}
.r3:last-child{border-bottom:0}
.r3 .ico{flex:none; width:38px; height:38px; display:grid; place-items:center; border-radius:12px}
.ico.cyan{color:var(--cyan); background:color-mix(in srgb,var(--cyan) 14%,transparent)}
.ico.rose{color:var(--rose); background:color-mix(in srgb,var(--rose) 14%,transparent)}
.ico.violet{color:var(--violet); background:color-mix(in srgb,var(--violet) 14%,transparent)}
.ico.amber{color:var(--amber); background:color-mix(in srgb,var(--amber) 14%,transparent)}
.r3 .txt{flex:1; min-width:140px; display:flex; flex-direction:column; gap:2px}
.r3 strong{font-size:14.5px; font-weight:600}
.r3 small{font-size:12.5px; color:var(--mute); line-height:1.4}
.r3 .ctl{display:flex; align-items:center; gap:12px}
.sx-time{padding:9px 10px; border-radius:11px; outline:0; color:var(--text); font:500 13.5px 'Sora',sans-serif; background:var(--field); border:1px solid var(--line); color-scheme:dark}
.sx-time:disabled{opacity:.4}
.sx-time:focus{border-color:var(--ion)}
.range{display:flex; align-items:center; gap:8px; font-size:12.5px; color:var(--mute)}
.sx-switch{position:relative; width:46px; height:26px; flex:none; border-radius:99px; border:1px solid var(--line); background:var(--field); cursor:pointer; transition:background .25s, border-color .25s}
.sx-switch i{position:absolute; top:2px; left:2px; width:20px; height:20px; border-radius:50%; background:var(--faint); transition:transform .25s cubic-bezier(.3,1.3,.5,1), background .25s}
.sx-switch.on{background:color-mix(in srgb,var(--ice) 30%,transparent); border-color:var(--ice)}
.sx-switch.on i{transform:translateX(20px); background:var(--ice); box-shadow:0 0 10px color-mix(in srgb,var(--ice) 70%,transparent)}
.seg{display:flex; padding:3px; gap:2px; border-radius:13px; background:var(--field); border:1px solid var(--line)}
.seg button{width:36px; height:32px; border:0; border-radius:10px; cursor:pointer; font:600 13.5px 'Sora',sans-serif; color:var(--mute); background:none}
.seg button.on{color:#fff; background:linear-gradient(135deg,var(--ion),#5B8CFF)}
.sx-foot{margin:2px 6px 0; font-size:12.5px; line-height:1.55; color:var(--mute)}

/* danger zone */
.sx-danger{padding:22px; border-radius:26px; border:1.5px dashed color-mix(in srgb,var(--red) 60%,transparent);
  background:linear-gradient(180deg,color-mix(in srgb,var(--red) 9%,var(--glass)),var(--glass)); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px)}
.sx-tag{display:inline-flex; align-items:center; gap:8px; padding:6px 12px; border-radius:99px; font-size:12px; font-weight:600; color:var(--red);
  background:color-mix(in srgb,var(--red) 12%,transparent); border:1px solid color-mix(in srgb,var(--red) 40%,transparent)}
.sx-tag b{width:7px; height:7px; border-radius:50%; background:var(--red); box-shadow:0 0 10px var(--red); animation:sxPulse 2s infinite}
@keyframes sxPulse{50%{opacity:.35}}
.sx-danger h2{margin:14px 0 4px; font-size:18px; font-weight:600}
.sx-danger .sub{margin:0 0 18px; font-size:13.5px; color:var(--mute); line-height:1.5}
.sx-row{padding:16px; margin-bottom:12px; border-radius:18px; background:var(--inner); border:1px solid var(--line)}
.sx-row .top{display:flex; gap:12px; margin-bottom:14px}
.sx-row .ico{flex:none; width:38px; height:38px; display:grid; place-items:center; border-radius:12px; color:var(--ice); background:color-mix(in srgb,var(--ice) 12%,transparent); border:1px solid color-mix(in srgb,var(--ice) 30%,transparent)}
.sx-row.warn .ico{color:var(--amber); background:color-mix(in srgb,var(--amber) 12%,transparent); border-color:color-mix(in srgb,var(--amber) 35%,transparent)}
.sx-row h3{margin:0 0 3px; font-size:14.5px; font-weight:600}
.sx-row p{margin:0; font-size:12.5px; color:var(--mute); line-height:1.45}
.sx-row>button{width:100%; padding:12px; border-radius:12px; cursor:pointer; font:600 14px 'Sora',sans-serif; color:var(--text); background:var(--glass); border:1px solid var(--line); transition:background .2s, border-color .2s}
.sx-row>button:hover:not(:disabled){background:color-mix(in srgb,var(--ion) 16%,transparent); border-color:var(--ion)}
.sx-row.warn>button{color:var(--amber); border-color:color-mix(in srgb,var(--amber) 45%,transparent)}
.sx-row.warn>button:hover:not(:disabled){background:color-mix(in srgb,var(--amber) 14%,transparent); border-color:var(--amber)}
.sx-delete{width:100%; display:flex; align-items:center; justify-content:center; gap:9px; padding:15px; border-radius:16px; cursor:pointer;
  font:600 15px 'Sora',sans-serif; color:var(--red); background:color-mix(in srgb,var(--red) 10%,transparent); border:1px solid color-mix(in srgb,var(--red) 55%,transparent); transition:background .2s, box-shadow .2s}
.sx-delete:hover{background:color-mix(in srgb,var(--red) 20%,transparent); box-shadow:0 0 26px -6px var(--red)}

/* modal */
.sx-modal{position:fixed; inset:0; z-index:50; display:grid; place-items:center; padding:20px; background:rgba(3,5,14,.72); backdrop-filter:blur(8px); animation:sxIn .2s ease}
.sx-modal .box{position:relative; width:100%; max-width:380px; padding:26px; border-radius:24px; text-align:center; color:var(--text);
  background:var(--field); border:1px solid color-mix(in srgb,var(--red) 50%,transparent); box-shadow:0 0 60px -10px color-mix(in srgb,var(--red) 50%,transparent)}
.sx-root[data-theme="dark"] .sx-modal .box{background:#0D1124}
.sx-modal svg{color:var(--red)}
.sx-modal h3{margin:10px 0 6px; font-size:19px}
.sx-modal p{margin:0 0 16px; font-size:13.5px; color:var(--mute); line-height:1.5}
.sx-modal label{display:block; text-align:left; font-size:12.5px; color:var(--mute)}
.sx-modal label b{color:var(--red)}
.sx-modal input{width:100%; margin-top:8px; padding:12px 14px; border-radius:12px; outline:0; color:var(--text); font:500 15px 'Sora',sans-serif; background:var(--glass); border:1px solid var(--line)}
.sx-modal input:focus{border-color:var(--red)}
.sx-modal .btns{display:flex; gap:10px; margin-top:18px}
.sx-modal .btns button{flex:1; padding:12px; border-radius:12px; cursor:pointer; font:600 14px 'Sora',sans-serif; color:var(--text); background:var(--glass); border:1px solid var(--line)}
.sx-modal .btns .go{color:#fff; background:var(--red); border-color:var(--red)}
.sx-modal .btns .go:disabled{opacity:.4; cursor:not-allowed}
.sx-modal .x{position:absolute; top:12px; right:12px; padding:6px; border:0; background:none; color:var(--mute); cursor:pointer}

/* ⚠️ Warning banner — push off but items on */
.sx-warn{
  display:flex;
  align-items:center;
  gap:12px;
  padding:14px 16px;
  border-radius:16px;
  background:linear-gradient(135deg, color-mix(in srgb,var(--amber) 15%, var(--glass)), var(--glass));
  border:1px solid color-mix(in srgb,var(--amber) 45%, transparent);
  color:var(--text);
  backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
  animation:sxIn .35s ease both;
}
.sx-warn>svg{
  flex:none;
  color:var(--amber);
  filter:drop-shadow(0 0 8px color-mix(in srgb,var(--amber) 60%,transparent));
}
.sx-warn-text{
  flex:1;
  min-width:0;
  display:flex;
  flex-direction:column;
  gap:2px;
}
.sx-warn-text strong{
  font-size:14px;
  font-weight:700;
  color:var(--text);
  line-height:1.3;
}
.sx-warn-text small{
  font-size:12.5px;
  color:var(--mute);
  line-height:1.45;
}
.sx-warn-btn{
  flex:none;
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:9px 14px;
  border-radius:12px;
  border:0;
  cursor:pointer;
  font:700 12.5px 'Sora',system-ui,sans-serif;
  color:#2A1500;
  background:linear-gradient(135deg, var(--amber), #FF8A3D);
  box-shadow:0 8px 20px -8px rgba(255,150,60,.7), inset 0 1px 0 rgba(255,255,255,.45);
  transition:transform .15s, filter .2s;
}
.sx-warn-btn:hover{
  transform:translateY(-1px);
  filter:brightness(1.08);
}
.sx-warn-btn:active{
  transform:scale(.97);
}

/* Dark: same glass look on every tab, all text white */
.sx-root[data-theme="dark"]{color:#fff}
.sx-root[data-theme="dark"] .sx-head h1{color:#fff}
.sx-root[data-theme="dark"] .sx-head p,
.sx-root[data-theme="dark"] .sx-sub,
.sx-root[data-theme="dark"] .r3 small,
.sx-root[data-theme="dark"] .sx-row p,
.sx-root[data-theme="dark"] .sx-field>span,
.sx-root[data-theme="dark"] .sx-group,
.sx-root[data-theme="dark"] .sx-foot,
.sx-root[data-theme="dark"] .bank-foot p,
.sx-root[data-theme="dark"] .sx-accounts small{color:rgba(255,255,255,.84)}
.sx-root[data-theme="dark"] .sx-tabs button{color:rgba(255,255,255,.84)}
.sx-root[data-theme="dark"] .sx-tabs button.on{color:#fff}
.sx-root[data-theme="dark"] .sx-card,
.sx-root[data-theme="dark"] .sx-tabs{background:rgba(255,255,255,.055); border-color:rgba(160,175,255,.16)}
/* ✅ كارت Push يرجع تدرجه البنفسجي في الليلي */
.sx-root[data-theme="dark"] .push{
  background:linear-gradient(135deg,rgba(124,108,255,.22),rgba(255,255,255,.04));
}
.sx-root[data-theme="dark"] .sx-field input::placeholder{color:rgba(255,255,255,.5)}
.sx-root[data-theme="dark"] .sx-time::-webkit-calendar-picker-indicator,
.sx-root[data-theme="dark"] .sx-field input[type=date]::-webkit-calendar-picker-indicator{filter:invert(1)}

@media (prefers-reduced-motion:reduce){.sx-root *{animation:none!important; transition:none!important}}
@media (max-width:520px){
  .sx-tabs button{padding:11px 13px}
  .sx-tabs button span{display:none}.sx-tabs button.on span{display:inline}
  .sx-card{padding:18px}
  .r3 .ctl{width:100%; justify-content:flex-end; padding-left:50px}
  .sx-warn{
    flex-wrap:wrap;
    padding:12px 14px;
  }
  .sx-warn>svg{
    width:18px; height:18px;
  }
  .sx-warn-btn{
    width:100%;
    justify-content:center;
    margin-top:6px;
  }
  }
`;