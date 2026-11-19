'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Loader2, Bookmark, AlertTriangle, TrendingDown,
  Play, Filter, CheckCircle2, XCircle, RefreshCw,
} from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';
import { useUIStore, type PanelId } from '../../stores/uiStore';
import { fetchReviewQueue, type ReviewItem, type ReviewBucket } from '../../lib/qbank/reviewQueue';
import type { Question } from '../../lib/helpers';
import { BackButton } from '../ui/BackButton';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  userId?: string;
  onBack: () => void;
  onStartReview: (questions: Question[]) => void;
};

type Tab = 'all' | ReviewBucket;

const TABS: { id: Tab; label: string; icon: any; color: string }[] = [
  { id: 'all',        label: 'الكل',       icon: Filter,       color: 'slate' },
  { id: 'wrong',      label: 'الأخطاء',    icon: XCircle,      color: 'rose' },
  { id: 'bookmarked', label: 'المحفوظات',  icon: Bookmark,     color: 'indigo' },
  { id: 'weak',       label: 'الضعف',      icon: TrendingDown, color: 'amber' },
];

export default function SmartReviewScreen({
  isDark, userId, onBack, onStartReview,
}: Props) {
    const t = useTranslations('components_screens_SmartReviewScreen');
  const currentPanel = useUIStore(s => s.currentPanel) as PanelId;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<{
    wrong: ReviewItem[];
    bookmarked: ReviewItem[];
    weak: ReviewItem[];
  }>({ wrong: [], bookmarked: [], weak: [] });
  const [tab, setTab] = useState<Tab>('all');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const card = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const title = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  const load = async (showRefreshing = false) => {
    if (!userId) return;
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await fetchReviewQueue({ userId, panelId: currentPanel });
      setItems({
        wrong: result.wrong,
        bookmarked: result.bookmarked,
        weak: result.weak,
      });
    } catch (err) {
      console.error('fetchReviewQueue failed', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentPanel]);

  // ─── Filter by tab ───
  const visibleItems: ReviewItem[] = useMemo(() => {
    if (tab === 'all') {
      const byId = new Map<number, ReviewItem>();
      for (const it of items.wrong) byId.set(it.question.id, it);
      for (const it of items.bookmarked) if (!byId.has(it.question.id)) byId.set(it.question.id, it);
      for (const it of items.weak) if (!byId.has(it.question.id)) byId.set(it.question.id, it);
      return [...byId.values()];
    }
    return items[tab] || [];
  }, [tab, items]);

  // ─── Selection ───
  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const selectAll = () => {
    setSelected(new Set(visibleItems.map((i) => i.question.id)));
  };
  const clearSelection = () => setSelected(new Set());

  const startSelected = () => {
    if (!selected.size) return;
    const chosen = visibleItems.filter((i) => selected.has(i.question.id));
    onStartReview(chosen.map((i) => i.question));
  };

  const startAll = () => {
    if (!visibleItems.length) return;
    onStartReview(visibleItems.map((i) => i.question));
  };

  // ─── Counts ───
  const counts = {
    all: items.wrong.length + items.bookmarked.length + items.weak.length,
    wrong: items.wrong.length,
    bookmarked: items.bookmarked.length,
    weak: items.weak.length,
  };

  return (
    <div className="animate-fade-in w-full max-w-4xl mx-auto space-y-4">
      {/* ═══ Header ═══ */}
      <div className="flex items-center gap-3">
<BackButton onClick={onBack} label={t('back')} />
        <div className="flex-1 min-w-0">
          <h1 className={`text-lg sm:text-2xl font-black tracking-tight ${title}`}>
            {t('smart_review')}
                                </h1>
          <p className={`text-[11px] ${muted}`}>
            {counts.all} سؤال يحتاج مراجعة
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition hover:scale-105 active:scale-95 ${
            isDark ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
          title="تحديث"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ═══ Tabs ═══ */}
      <div className={`flex gap-1 rounded-2xl border-2 p-1 ${card}`}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          const colorCls =
            t.color === 'rose'    ? 'bg-rose-500/15 text-rose-300 border-rose-500/50'
          : t.color === 'indigo'  ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/50'
          : t.color === 'amber'   ? 'bg-amber-500/15 text-amber-300 border-amber-500/50'
          : isDark                ? 'bg-slate-800 text-slate-200 border-slate-700'
          :                         'bg-white text-slate-700 border-slate-300';

          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[11px] sm:text-xs font-black transition-all ${
                active ? colorCls : (isDark ? 'text-slate-500 hover:bg-slate-800/40 border-transparent' : 'text-slate-500 hover:bg-slate-50 border-transparent')
              }`}
            >
              <Icon size={13} />
              <span className="hidden sm:inline">{t.label}</span>
              <span className={`tabular-nums px-1.5 rounded-md text-[10px] ${active ? 'bg-black/20' : (isDark ? 'bg-slate-800' : 'bg-slate-100')}`}>
                {counts[t.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ═══ Loading ═══ */}
      {loading && (
        <div className={`rounded-2xl border-2 p-12 text-center ${card}`}>
          <Loader2 size={32} className="animate-spin text-emerald-500 mx-auto mb-3" />
          <p className={`text-sm font-bold ${muted}`}>جاري تحميل الأسئلة…</p>
        </div>
      )}

      {/* ═══ Empty ═══ */}
      {!loading && visibleItems.length === 0 && (
        <div className={`rounded-2xl border-2 border-dashed p-10 text-center ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
          <CheckCircle2 size={48} className="mx-auto mb-3 text-emerald-500 opacity-70" />
          <p className={`text-base font-black mb-1 ${title}`}>
            مفيش حاجة للمراجعة 🎉
          </p>
          <p className="text-xs">
            {tab === 'all' ? 'حل أسئلة جديدة عشان الـ queue يمتلي' : 'مفيش أسئلة في التصنيف ده'}
          </p>
        </div>
      )}

      {/* ═══ Selection bar ═══ */}
      {!loading && visibleItems.length > 0 && (
        <>
          <div className={`flex items-center gap-2 rounded-xl border-2 p-2 ${card}`}>
            <button
              onClick={selectAll}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition ${
                isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              اختار الكل ({visibleItems.length})
            </button>
            {selected.size > 0 && (
              <button
                onClick={clearSelection}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition ${
                  isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                إلغاء ({selected.size})
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={selected.size > 0 ? startSelected : startAll}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black transition active:scale-95 shadow-md"
            >
              <Play size={12} />
              ابدأ {selected.size > 0 ? `(${selected.size})` : 'الكل'}
            </button>
          </div>

          {/* ═══ List ═══ */}
          <div className="space-y-2">
            {visibleItems.map((item) => {
              const isSel = selected.has(item.question.id);
              const accColor =
                item.accuracy >= 80 ? 'text-emerald-500'
              : item.accuracy >= 60 ? 'text-amber-500'
              :                       'text-rose-500';

              return (
                <button
                  key={`${item.reason}-${item.question.id}`}
                  onClick={() => toggleSelect(item.question.id)}
                  className={`w-full text-start rounded-xl border-2 p-3 sm:p-4 transition-all hover:shadow-lg ${
                    isSel
                      ? isDark ? 'border-emerald-500/60 bg-emerald-500/[0.08]' : 'border-emerald-400 bg-emerald-50/50'
                      : card
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${
                      isSel
                        ? 'bg-emerald-500 border-emerald-500'
                        : isDark ? 'border-slate-700' : 'border-slate-300'
                    }`}>
                      {isSel && <CheckCircle2 size={12} className="text-white" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          item.reason === 'wrong' ? 'bg-rose-500/15 text-rose-300'
                          : item.reason === 'bookmarked' ? 'bg-indigo-500/15 text-indigo-300'
                          : 'bg-amber-500/15 text-amber-300'
                        }`}>
                          {item.reason === 'wrong' ? 'خطأ' : item.reason === 'bookmarked' ? 'محفوظ' : 'ضعف'}
                        </span>
                        <span className={`text-[10px] font-bold ${muted}`}>
                          {item.category}
                        </span>
                        <span className={`text-[10px] font-bold ${muted}`}>
                          {'⭐'.repeat(item.difficulty)}
                        </span>
                      </div>

                      <p className={`text-xs sm:text-sm font-bold leading-snug line-clamp-2 ${title}`}>
                        {item.question.Question_Text}
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-[10px] font-bold ${muted}`}>
                          محاولات: {item.attempts}
                        </span>
                        <span className={`text-[10px] font-black ${accColor}`}>
                          دقة: {item.accuracy}%
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}