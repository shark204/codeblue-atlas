'use client';
import { useAdminStore } from '../../../stores/adminStore';
import AdminToolbar from './AdminToolbar';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  onFetchReports: () => void;
  onResolveReport: (id: number) => void;
  onDeleteQuestion: (questionId: number) => void;
};

export default function AdminReportsTab({
  isDark,
  onFetchReports,
  onResolveReport,
  onDeleteQuestion,
}: Props) {
    const t = useTranslations('components_screens_admin_AdminReportsTab');
  const reports = useAdminStore(s => s.reports);
  const loading = useAdminStore(s => s.reportsLoading);

  const open = reports.filter(r => r.status !== 'resolved');
  const card = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="mt-2 space-y-3" dir="rtl">
      {/* Unified Toolbar */}
      <AdminToolbar
        isDark={isDark}
        title={t('question_reports')}
        count={open.length}
        loading={loading}
        onRefresh={onFetchReports}
      />

      {/* Empty state */}
      {open.length === 0 ? (
        <p
          className={`p-8 text-center text-sm rounded-2xl border border-dashed ${
            isDark ? 'border-slate-700 text-slate-400' : 'border-slate-300 text-slate-500'
          }`}
        >
          {t('no_open_reports_when_users')}
                          </p>
      ) : (
        open.map(r => (
          <div key={r.id} className={`p-3 rounded-2xl border space-y-2.5 ${card}`}>
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-amber-500">{r.reason}</span>
              <span className="text-slate-500">
                {new Date(r.created_at).toLocaleDateString('en-GB')}
              </span>
            </div>

            <p
              className={`text-sm font-semibold ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              {r.question_text}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => onResolveReport(r.id)}
                className="px-3 py-2 rounded-lg text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                {t('mark_resolved')}
                                      </button>
              <button
                onClick={() =>
                  confirm('Permanently delete this question?') &&
                  (onDeleteQuestion(r.question_id), onResolveReport(r.id))
                }
                className="px-3 py-2 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
              >
                {t('delete_question')}
                                      </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}