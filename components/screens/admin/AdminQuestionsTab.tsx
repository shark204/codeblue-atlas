'use client';
import { useState } from 'react';
import { useAdminStore } from '../../../stores/adminStore';
import AdminAddQuestionTab from './AdminAddQuestionTab';
import AdminManageQuestionsTab from './AdminManageQuestionsTab';
import AdminToolbar from './AdminToolbar';
import RowMenu from './RowMenu';
import { downloadCsv } from '../../../lib/csv';
import { getPanelDef } from '../../../lib/panels';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  categories: string[];
  onAddQuestion: (e: React.FormEvent<HTMLFormElement>) => void;
  newQ: any;
  setNewQ: (q: any) => void;
  onUpdateQuestion: (e: React.FormEvent<HTMLFormElement>) => void;
  onDeleteQuestion: (id: number) => void;
  onBulkDelete: (ids: number[]) => void;
  editingQuestion: any;
  setEditingQuestion: (q: any) => void;
};

const DIFFICULTY_DOT: Record<number, string> = {
  0: 'bg-slate-500',
  1: 'bg-emerald-500',
  2: 'bg-amber-500',
  3: 'bg-rose-500',
};

export default function AdminQuestionsTab(p: Props) {
    const t = useTranslations('components_screens_admin_AdminQuestionsTab');
  const { isDark } = p;
  const s = useAdminStore();

  /* ─── Panel (used for the badge) ─── */
  const panelId = useAdminStore(st => st.adminSelectedPanel);
  const panel = getPanelDef(panelId);

  /* ─── Local state ─── */
  const [showAdd, setShowAdd] = useState(false);
  const [selection, setSelection] = useState<Set<number>>(new Set());

  /* ─── Editing view takes over ─── */
  if (p.editingQuestion) {
    return (
      <AdminManageQuestionsTab
        isDark={isDark}
        onUpdateQuestion={p.onUpdateQuestion}
        onDeleteQuestion={p.onDeleteQuestion}
        editingQuestion={p.editingQuestion}
        setEditingQuestion={p.setEditingQuestion}
      />
    );
  }

  const totalPages = Math.ceil(s.adminTotalCount / 20) || 1;
  const card = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const selectCls = `px-3 py-2 rounded-lg border text-xs outline-none ${
    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
  }`;

  const toggleSelection = (id: number) =>
    setSelection(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const allOnPage =
    s.adminQuestions.length > 0 && s.adminQuestions.every((q: any) => selection.has(q.id));

  const hasFilters = !!s.adminCategoryFilter || s.adminDifficultyFilter !== 0;

  return (
    <div className="mt-2 space-y-3" dir="rtl">
      {/* Unified Toolbar — badge shows the target panel */}
      <AdminToolbar
        isDark={isDark}
        title={t('question_bank')}
        count={s.adminTotalCount}
        badge={
          panel
            ? {
                label: panel.label,
                Icon: panel.icon,
                color: panel.activeClass,
              }
            : undefined
        }
        search={{
          value: s.adminQuestionsSearch,
          onChange: v => {
            s.setAdminQuestionsSearch(v);
            s.setAdminPage(1);
          },
          placeholder: t('search_question_text'),
        }}
        primary={{
          icon: showAdd ? '✕' : '➕',
          label: showAdd ? 'Close' : 'New Question',
          onClick: () => setShowAdd(v => !v),
        }}
        secondary={[
          {
            icon: '⬇',
            label: t('export_current_page'),
            onClick: () => downloadCsv('questions', s.adminQuestions),
          },
          {
            icon: '🔍',
            label: t('scan_duplicates'),
            onClick: () => alert('TODO: duplicate scan'),
          },
        ]}
        loading={false}
        onRefresh={() => window.location.reload()}
      />

      {/* Filters row */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={s.adminCategoryFilter}
          onChange={e => {
            s.setAdminCategoryFilter(e.target.value);
            s.setAdminPage(1);
          }}
          className={selectCls}
        >
          <option value="">{t('all_categories')}</option>
          {p.categories
            .filter(c => c && c !== 'All')
            .map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
        </select>

        <select
          value={s.adminDifficultyFilter}
          onChange={e => {
            s.setAdminDifficultyFilter(Number(e.target.value));
            s.setAdminPage(1);
          }}
          className={selectCls}
        >
          <option value={0}>{t('all_levels')}</option>
          <option value={1}>{t('easy')}</option>
          <option value={2}>{t('medium')}</option>
          <option value={3}>{t('hard')}</option>
        </select>

        {hasFilters && (
          <button
            onClick={() => {
              s.setAdminCategoryFilter('');
              s.setAdminDifficultyFilter(0);
              s.setAdminPage(1);
            }}
            className="px-3 py-2 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            {t('clear_filters')}
                                </button>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <AdminAddQuestionTab
          isDark={isDark}
          onAddQuestion={p.onAddQuestion}
          newQ={p.newQ}
          setNewQ={p.setNewQ}
        />
      )}

      {/* Bulk actions bar */}
      {selection.size > 0 && (
        <div
          className={`p-2.5 rounded-xl border flex items-center justify-between ${
            isDark ? 'bg-rose-950/30 border-rose-900' : 'bg-rose-50 border-rose-200'
          }`}
        >
          <span className="text-xs font-bold text-rose-500">
            {selection.size} question(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelection(new Set())}
              className="text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              {t('cancel')}
                                      </button>
            <button
              onClick={() => {
                if (confirm(`Permanently delete ${selection.size} question(s)?`)) {
                  p.onBulkDelete([...selection]);
                  setSelection(new Set());
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-black hover:bg-rose-700"
            >
              {t('delete')}
                                      </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className={`rounded-2xl border p-2 space-y-1.5 ${card}`}>
        {s.adminQuestions.length > 0 && (
          <label className="flex items-center gap-2 px-2 py-1 text-xs font-bold text-slate-500 cursor-pointer">
            <input
              type="checkbox"
              checked={allOnPage}
              onChange={() =>
                setSelection(
                  allOnPage ? new Set() : new Set(s.adminQuestions.map((q: any) => q.id))
                )
              }
              className="accent-amber-500"
            />
            {t('select_all_on_page')}
                                </label>
        )}

        {s.adminQuestions.map((q: any) => (
          <div
            key={q.id}
            className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
              selection.has(q.id)
                ? 'border-amber-500'
                : isDark
                ? 'border-slate-800 hover:bg-slate-800/40'
                : 'border-slate-100 hover:bg-slate-50'
            }`}
          >
            <input
              type="checkbox"
              checked={selection.has(q.id)}
              onChange={() => toggleSelection(q.id)}
              className="accent-amber-500 shrink-0"
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    DIFFICULTY_DOT[q.Difficulty] ?? 'bg-slate-500'
                  }`}
                />
                <span className="text-[10px] font-bold text-sky-500">{q.Theme_Category}</span>
                {!q.Explanation && (
                  <span className="text-[10px] font-bold text-rose-500">{t('no_explanation')}</span>
                )}
              </div>
              <p
                className={`text-sm font-medium truncate ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                {q.Question_Text}
              </p>
            </div>

            <RowMenu
              isDark={isDark}
              items={[
                { icon: '✏️', label: t('edit'), onClick: () => p.setEditingQuestion(q) },
                { icon: '📋', label: t('duplicate'), onClick: () => alert('TODO') },
                {
                  icon: '🗑',
                  label: t('delete_2'),
                  onClick: () => confirm('Delete this question?') && p.onDeleteQuestion(q.id),
                  danger: true,
                },
              ]}
            />
          </div>
        ))}

        {s.adminQuestions.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-8">
            {t('no_questions_match_these_filters')}
                                </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            disabled={s.adminPage === 1}
            onClick={() => s.setAdminPage(s.adminPage - 1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30 ${
              isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t('prev')}
                                </button>
          <span className="text-xs font-bold text-slate-500">
            {s.adminPage} / {totalPages}
          </span>
          <button
            disabled={s.adminPage === totalPages}
            onClick={() => s.setAdminPage(s.adminPage + 1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30 ${
              isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t('next')}
                                </button>
        </div>
      )}
    </div>
  );
}