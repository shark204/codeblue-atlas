'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, Bookmark, Play, Loader2, Users } from 'lucide-react';
import { fetchMyBookmarks, fetchCommunityBookmarks } from '../../lib/qbank/bookmarks';
import type { Question } from '../../lib/helpers';
import { useTranslations } from "@/stores/languageStore";

type Tab = 'mine' | 'community';

export default function BookmarksScreen({
  isDark, userId, panelId, onBack, onStartSession,
}: {
  isDark: boolean;
  userId?: string;
  panelId: string;
  onBack: () => void;
  onStartSession: (questions: Question[]) => void;
}) {
    const t = useTranslations('components_screens_BookmarksScreen');
  const [tab, setTab] = useState<Tab>('mine');
  const [mine, setMine] = useState<Question[]>([]);
  const [community, setCommunity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const card = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const title = isDark ? 'text-white' : 'text-slate-900';
  const muted = isDark ? 'text-slate-400' : 'text-slate-500';

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      fetchMyBookmarks({ userId, panelId }),
      fetchCommunityBookmarks({ panelId, limit: 30 }),
    ]).then(([m, c]) => {
      setMine(m); setCommunity(c); setLoading(false);
    });
  }, [userId, panelId]);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'}`}>
          <ArrowLeft size={16} />
        </button>
        <h1 className={`text-lg font-black ${title}`}>{t('bookmarks')}</h1>
        {mine.length > 0 && tab === 'mine' && (
          <button onClick={() => onStartSession(mine)} className="ms-auto flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md">
            <Play size={12} /> Review All ({mine.length})
          </button>
        )}
      </div>

      <div className={`flex gap-1 rounded-xl border-2 p-1 ${card}`}>
        {[
          { id: 'mine' as Tab, label: t('my_bookmarks'), icon: Bookmark, count: mine.length },
          { id: 'community' as Tab, label: t('community'), icon: Users, count: community.length },
        ].map((t) => {
          const Icon = t.icon; const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black ${
                active ? 'bg-sky-500/15 text-sky-300' : muted
              }`}>
              <Icon size={13} /> {t.label}
              <span className={`text-[10px] px-1.5 rounded-md ${active ? 'bg-black/20' : isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-20 text-center"><Loader2 size={28} className="animate-spin mx-auto text-sky-500" /></div>
      ) : tab === 'mine' ? (
        mine.length === 0 ? (
          <div className={`rounded-2xl border-2 border-dashed p-10 text-center ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            <Bookmark size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold">{t('no_bookmarks_yet')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {mine.map((q) => (
              <div key={q.id} className={`rounded-xl border-2 p-3 ${card}`}>
                <p className={`text-xs font-bold ${title}`}>{q.Question_Text}</p>
                <p className={`text-[10px] mt-1 ${muted}`}>{q.Theme_Category}</p>
              </div>
            ))}
          </div>
        )
      ) : community.length === 0 ? (
        <div className={`rounded-2xl border-2 border-dashed p-10 text-center ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
          <Users size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm font-bold">{t('no_community_bookmarks')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {community.map((c) => (
            <div key={c.question_id} className={`rounded-xl border-2 p-3 flex items-center gap-3 ${card}`}>
              <span className="text-xs font-black text-amber-500">🔖 {c.bookmark_count}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold truncate ${title}`}>Q#{c.question_id}</p>
                <p className={`text-[10px] ${muted}`}>{c.Theme_Category}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}