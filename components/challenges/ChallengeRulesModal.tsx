'use client';

import { useEffect, useState } from 'react';
import { Shield, Clock, BookOpen, Zap, X, ChevronRight, Users } from 'lucide-react';
import type { ChallengeRules } from '../../lib/challenges/types';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  opponentName: string;
  initialRules?: Partial<ChallengeRules>;
  onReady: (rules: ChallengeRules) => void;
  onCancel: () => void;
};

export default function ChallengeRulesModal({
  isDark, opponentName, initialRules, onReady, onCancel,
}: Props) {
    const t = useTranslations('components_challenges_ChallengeRulesModal');
  const [count, setCount] = useState<number>(initialRules?.count ?? 10);
  const [mode, setMode] = useState<ChallengeRules['mode']>(initialRules?.mode ?? 'adaptive');
  const [timePerQ, setTimePerQ] = useState<number>(initialRules?.timePerQ ?? 0);
  const [category, setCategory] = useState<string>(initialRules?.category ?? 'all');

  const card = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const title = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className={`w-full max-w-lg rounded-3xl border-2 shadow-2xl ${card} animate-fade-in`}>
        {/* Header */}
        <div className={`px-5 sm:px-7 py-5 border-b-2 border-dashed flex items-center gap-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
            <Shield size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`text-lg font-black ${title}`}>قواعد التحدي</h2>
            <p className={`text-[11px] ${muted}`}>
              تحدٍ ضد <b className="text-rose-500">{opponentName}</b>
            </p>
          </div>
          <button
            onClick={onCancel}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-7 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Rules Summary */}
          <div className={`rounded-2xl border-2 border-dashed p-4 space-y-2.5 ${
            isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/60'
          }`}>
            <RuleLine icon={<BookOpen size={14} />} label="عدد الأسئلة" value={`${count} أسئلة`} isDark={isDark} />
            <RuleLine icon={<Users size={14} />} label="الفئة" value={category === 'all' ? 'الكل' : category} isDark={isDark} />
            <RuleLine icon={<Zap size={14} />} label="الوضع" value={mode === 'adaptive' ? 'ذكي' : mode === 'shuffle' ? 'عشوائي' : 'الأصلي'} isDark={isDark} />
            <RuleLine icon={<Clock size={14} />} label="وقت السؤال" value={timePerQ === 0 ? 'بدون' : `${timePerQ}s`} isDark={isDark} />
          </div>

          {/* Count */}
          <Section label="عدد الأسئلة" isDark={isDark}>
            {[5, 10, 20, 30].map((n) => (
              <Chip key={n} active={count === n} onClick={() => setCount(n)} isDark={isDark}>{n}</Chip>
            ))}
          </Section>

          {/* Mode */}
          <Section label="الوضع" isDark={isDark}>
            <Chip active={mode === 'adaptive'} onClick={() => setMode('adaptive')} isDark={isDark}>🧠 ذكي</Chip>
            <Chip active={mode === 'shuffle'} onClick={() => setMode('shuffle')} isDark={isDark}>🔀 عشوائي</Chip>
            <Chip active={mode === 'default'} onClick={() => setMode('default')} isDark={isDark}>📋 الأصلي</Chip>
          </Section>

          {/* Timer */}
          <Section label="وقت كل سؤال" isDark={isDark}>
            {[0, 30, 60].map((t) => (
              <Chip key={t} active={timePerQ === t} onClick={() => setTimePerQ(t)} isDark={isDark}>
                {t === 0 ? 'بدون' : `${t}s`}
              </Chip>
            ))}
          </Section>

          {/* Important Notes */}
          <div className={`rounded-xl border-s-4 px-4 py-3 space-y-1.5 ${
            isDark ? 'border-amber-500 bg-amber-950/30' : 'border-amber-400 bg-amber-50'
          }`}>
            <p className={`text-[11px] font-black ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
              ⚠️ ملاحظات مهمة
            </p>
            <ul className={`text-[11px] leading-relaxed space-y-1 ${isDark ? 'text-amber-200/80' : 'text-amber-800/90'}`}>
              <li>• عندك <b>60 ثانية</b> لقبول التحدي وإلا يتلغى تلقائياً</li>
              <li>• الاتنين لازم يضغطوا <b>{t('ready')}</b> عشان التحدي يبدأ</li>
              <li>• لو غبت أكتر من 30 ثانية أثناء التحدي → تخسر تلقائياً</li>
              <li>{t('fair_play')}</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-5 sm:px-7 py-4 border-t-2 border-dashed flex gap-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            onClick={onCancel}
            className={`flex-1 py-3 rounded-xl font-black text-sm transition ${
              isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            إلغاء
          </button>
          <button
            onClick={() => onReady({ count, mode, timePerQ, category })}
            className="flex-[1.5] py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-sm shadow-lg shadow-rose-500/30 transition active:scale-95 flex items-center justify-center gap-2"
          >
            {t('ready_2')}
                                  <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function RuleLine({ icon, label, value, isDark }: any) {
  return (
    <div className="flex items-center gap-2">
      <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{icon}</span>
      <span className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
      <span className={`ms-auto text-[11px] font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</span>
    </div>
  );
}

function Section({ label, isDark, children }: any) {
  return (
    <div>
      <p className={`text-[11px] font-black uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, isDark, children }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-xl text-xs font-black border-2 transition-all active:scale-95 ${
        active
          ? 'bg-rose-500/15 border-rose-500/60 text-rose-300'
          : isDark
            ? 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
      }`}
    >
      {children}
    </button>
  );
}