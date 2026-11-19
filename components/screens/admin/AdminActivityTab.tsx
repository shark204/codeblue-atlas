'use client';
import { useState } from 'react';
import { useAdminStore } from '../../../stores/adminStore';
import AdminToolbar from './AdminToolbar';
import { downloadCsv } from '../../../lib/csv';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  onFetchActivity: () => void;
};

export default function AdminActivityTab({ isDark, onFetchActivity }: Props) {
    const t = useTranslations('components_screens_admin_AdminActivityTab');
  const log = useAdminStore(s => s.activityLog);
  const loading = useAdminStore(s => s.activityLoading);
  const [query, setQuery] = useState('');

  const shown = log.filter(l =>
    `${l.action} ${l.target} ${l.actor_email}`.toLowerCase().includes(query.toLowerCase())
  );

  const card = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="mt-2 space-y-3" dir="rtl">
      {/* Unified Toolbar */}
      <AdminToolbar
        isDark={isDark}
        title={t('activity_log')}
        count={log.length}
        search={{ value: query, onChange: setQuery, placeholder: t('search_events') }}
        loading={loading}
        onRefresh={onFetchActivity}
        secondary={[
          {
            icon: '⬇',
            label: t('export_csv'),
            onClick: () => downloadCsv('activity', shown),
          },
        ]}
      />

      {/* Timeline list */}
      <div className={`rounded-2xl border p-2 space-y-1.5 ${card}`}>
        {shown.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-8">{t('no_events_recorded_yet')}</p>
        )}

        {shown.map(l => (
          <div
            key={l.id}
            className={`flex items-start gap-3 p-2.5 rounded-xl border ${
              isDark ? 'border-slate-800 hover:bg-slate-800/40' : 'border-slate-100 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {l.action}
                {l.target ? ` — ${l.target}` : ''}
              </p>
              <p className="text-[11px] text-slate-500">
                <span dir="ltr">{l.actor_email}</span> ·{' '}
                {new Date(l.created_at).toLocaleString('en-GB')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}