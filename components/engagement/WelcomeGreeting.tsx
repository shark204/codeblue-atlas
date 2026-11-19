'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { X, Flame, TrendingUp, Target } from 'lucide-react';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  userName: string;
  isDark?: boolean;
  panelId?: string;
  score: { correct: number; wrong: number; total: number };
  questionsCount: number;
  examDate: string;
  daysLeft: number | null;
  dailyGoal: number;
  onGoToSettings: () => void;
  children?: ReactNode;
};

const MESSAGES = [
  { text: 'Coffee Level: Critical', emoji: '☕', color: '#f59e0b' },
  { text: 'Dedicate Your Heart!',   emoji: '❤️', color: '#ef4444' },
  { text: 'Vitals Stable?',         emoji: '🩺', color: '#10b981' },
  { text: 'To infinity and beyond!',emoji: '🚀', color: '#8b5cf6' },
];

const shownPanelsInThisLoad = new Set<string>();

export default function WelcomeGreeting({
  userName, isDark = false, panelId = 'mrcs',
  score, questionsCount, examDate, daysLeft, dailyGoal,
  onGoToSettings, children,
}: Props) {
    const t = useTranslations('components_engagement_WelcomeGreeting');
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(MESSAGES[0]);
  const [isWelcomeBack, setIsWelcomeBack] = useState(false);

  useEffect(() => {
    const now = Date.now();
    const lastVisitKey = `last_visit_${panelId}`;
    const lastVisit = Number(localStorage.getItem(lastVisitKey) || 0);
    const daysSinceVisit = lastVisit ? (now - lastVisit) / (1000 * 60 * 60 * 24) : 999;
    const isWelcome = daysSinceVisit > 7;

    localStorage.setItem(lastVisitKey, String(now));

    if (shownPanelsInThisLoad.has(panelId)) return;
    shownPanelsInThisLoad.add(panelId);

    const today = new Date().toDateString();
    const dayKey = `welcome_day_${panelId}`;
    const idxKey = `welcome_idx_${panelId}`;

    let selectedMsg;
    if (localStorage.getItem(dayKey) === today) {
      selectedMsg = MESSAGES[Number(localStorage.getItem(idxKey) || 0)];
    } else {
      const lastIdx = Number(localStorage.getItem(idxKey) || -1);
      const nextIdx = (lastIdx + 1) % MESSAGES.length;
      selectedMsg = MESSAGES[nextIdx];
      localStorage.setItem(idxKey, String(nextIdx));
      localStorage.setItem(dayKey, today);
    }

    setMessage(selectedMsg);
    setIsWelcomeBack(isWelcome);
    setVisible(true);
  }, [panelId]);

  if (!visible) return null;

  const close = () => setVisible(false);
  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
  const progressPct = questionsCount > 0 ? Math.min(100, ((score.total || 0) / questionsCount) * 100) : 0;

  return (
    <>
      {/* ═══ 📱 MOBILE ═══ */}
      <div
        className="lg:hidden fixed start-0 end-0 bottom-0 z-[45] flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm animate-fade-in"
        style={{ top: '52px' }}
      >
        <div
          className={`relative w-full max-w-md flex flex-col rounded-2xl shadow-2xl border overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
          style={{ maxHeight: 'calc(100dvh - 52px - 16px)' }}
        >
          {/* HEADER */}
          <div
            className="relative px-3 pt-3 pb-9 flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${message.color} 0%, ${message.color}dd 50%, ${message.color}bb 100%)`,
            }}
          >
            <div className="flex items-start justify-between">
              <div className="text-white">
                <p className="text-[9px] font-semibold opacity-95 mb-0.5">{t('holla')}</p>
                <p className="text-base font-black tracking-tight leading-none">
                  {userName.toUpperCase()}
                </p>
              </div>
              <button
                onClick={close}
                className="w-7 h-7 rounded-full bg-red-500/90 hover:bg-red-600 flex items-center justify-center text-white transition-colors shadow-lg shadow-red-500/40 mt-1"
                aria-label={t('close')}
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* HERO */}
          <div className="px-3 -mt-7 relative z-10 flex-shrink-0">
            <div className="relative rounded-xl overflow-hidden shadow-lg" style={{ minHeight: 90 }}>
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${message.color}50 0%, ${message.color}35 50%, ${message.color}25 100%)`,
                }}
              />
              <div className="absolute inset-0 bg-black/40" />

              <svg
                className="absolute inset-0 w-full h-full opacity-15"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid slice"
              >
                <defs>
                  <pattern id="med-cross-mobile" x="0" y="0" width="34" height="34" patternUnits="userSpaceOnUse">
                    <path d="M13 7h8v6h6v8h-6v6h-8v-6H7v-8h6z" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#med-cross-mobile)" />
              </svg>

              <div className="relative z-10 flex flex-col items-center justify-center text-center px-3 py-3 min-h-[90px]">
                <span className="text-2xl drop-shadow-lg mb-1">{message.emoji}</span>

                <p className="text-white text-sm font-black leading-tight drop-shadow-md">
                  {isWelcomeBack ? t('finally_you_decided_to_show') : message.text}
                </p>
                <p className="text-white/80 text-[9px] font-black uppercase tracking-widest mt-0.5">
                  {panelId === 'undergraduate' ? t('undergraduate_bank') : t('mrcs_bank')}
                </p>

                <svg
                  className="w-full h-5 opacity-70 mt-1.5"
                  viewBox="0 0 400 40"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 20 L60 20 L70 20 L75 5 L85 35 L95 20 L140 20 L150 20 L155 8 L165 32 L175 20 L220 20 L230 20 L235 5 L245 35 L255 20 L300 20 L310 20 L315 8 L325 32 L335 20 L400 20"
                    stroke="white"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="px-3 pt-2.5 pb-3 space-y-2 flex-1 min-h-0 overflow-hidden">
            {/* Progress bars — مع الشرح */}
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between items-center mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {t('progress')}
                                                              </span>
                    <span className={`text-[8px] font-semibold ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                      · الأسئلة اللي حليتها
                    </span>
                  </div>
                  <span className={`text-[9px] font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {score.total || 0} / {questionsCount}
                  </span>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {t('accuracy')}
                                                              </span>
                    <span className={`text-[8px] font-semibold ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                      · نسبة الإجابات الصح
                    </span>
                  </div>
                  <span className={`text-[9px] font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {accuracy}%
                  </span>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 🔥 Streak Panel */}
            {children && <div className="rounded-xl overflow-hidden">{children}</div>}

            {/* Exam countdown */}
            {examDate && daysLeft !== null ? (
              <div className={`rounded-xl border p-2.5 ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Target size={13} className="text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className={`text-[8px] font-black uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {t('exam')}
                                                                    </p>
                      <p className={`text-sm font-black ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                        {daysLeft}d left
                      </p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className={`text-[8px] font-black uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {t('daily_goal')}
                                                              </p>
                    <p className={`text-sm font-black ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      {dailyGoal}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={onGoToSettings}
                className="w-full py-2 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 justify-center shadow-lg shadow-sky-500/30"
              >
                <Target size={12} />
                {t('set_target_exam_date')}
                                                </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══ 💻 DESKTOP ═══ */}
      <div
        className="hidden lg:block fixed z-[999] animate-fade-in"
        style={{
          top: '72px',
          right: '12px',
          left: '12px',
          maxWidth: '400px',
          marginLeft: 'auto',
        }}
      >
        <div
          className="relative p-5 rounded-2xl shadow-2xl border-2 backdrop-blur-xl"
          style={{
            background: isDark
              ? `linear-gradient(135deg, ${message.color}20, ${message.color}08)`
              : `linear-gradient(135deg, ${message.color}15, ${message.color}05)`,
            borderColor: `${message.color}60`,
            boxShadow: `0 10px 40px ${message.color}30`,
          }}
        >
          <button
            onClick={close}
            className={`absolute top-2 start-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-black/5 text-slate-500'
            }`}
            aria-label={t('close')}
          >
            <X size={16} />
          </button>

          <div className="text-center mb-2 mt-2">
            <span className="text-3xl">{message.emoji}</span>
          </div>

          <div className="text-center mb-3">
            <p
              className="text-sm sm:text-base font-black tracking-tight leading-tight"
              style={{ color: message.color }}
            >
              {isWelcomeBack ? t('finaly_you_decided_to_show') : message.text}
            </p>
          </div>

          <div className="w-full h-px mb-3" style={{ background: `${message.color}40` }} />

          <div className="text-center mb-3">
            <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {t('welcome_back')}
                                      </p>
            <p className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {userName.toUpperCase()}
            </p>
          </div>

          <div className="w-full h-px mb-3" style={{ background: `${message.color}40` }} />

          <div className="flex items-center justify-center gap-2 mb-3">
            <div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-[11px] font-bold ${
              isDark ? 'bg-slate-900/60 border border-slate-700' : 'bg-white/80 border border-slate-200'
            }`}>
              <Flame size={12} className="text-orange-500" />
              <span>{score.total || 0} Qs</span>
            </div>
            <div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-[11px] font-bold ${
              isDark ? 'bg-slate-900/60 border border-slate-700' : 'bg-white/80 border border-slate-200'
            }`}>
              <TrendingUp size={12} className="text-emerald-500" />
              <span>{accuracy}%</span>
            </div>
          </div>

          {children && (
            <div className="mb-3 rounded-2xl overflow-hidden">
              {children}
            </div>
          )}

          {examDate && daysLeft !== null ? (
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('exam')}
                                                        </p>
                  <p className={`text-base font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {daysLeft}d
                  </p>
                </div>
                <div className="text-end">
                  <p className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('daily_goal')}
                                                        </p>
                  <p className={`text-base font-black ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    {dailyGoal}
                  </p>
                </div>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={onGoToSettings}
              className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white rounded-xl text-[11px] font-black transition-all flex items-center gap-2 justify-center"
            >
              {t('set_target_exam_date')}
                                            <Target size={13} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}