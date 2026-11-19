'use client';
import { useAdminStore } from '../../../stores/adminStore';
import { PANELS } from '../../../lib/panels';
import PanelStatsCard, { PanelStats } from './PanelStatsCard';

export type OverviewStats = PanelStats; // alias for backward compatibility

type Props = {
  isDark: boolean;
  stats: PanelStats | null;
  loading: boolean;
};

export default function AdminOverviewTab({ isDark, stats, loading }: Props) {
  const panelId = useAdminStore(s => s.adminSelectedPanel);
  const setPanelId = useAdminStore(s => s.setAdminSelectedPanel);

  const surface = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className="w-full animate-fade-in space-y-5 mt-2">
      {/* Panel selector */}
      <div className={`p-2 rounded-2xl border ${surface}`}>
        <div className="flex gap-2 overflow-x-auto">
          {PANELS.map(p => {
            const Icon = p.icon;
            const isActive = panelId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPanelId(p.id)}
                className={`shrink-0 inline-flex items-center gap-2 py-2 px-3.5 rounded-xl font-black text-xs border-2 transition-all ${
                  isActive
                    ? p.activeClass
                    : isDark
                    ? p.inactiveClass
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
              >
                <Icon size={14} strokeWidth={2.5} />
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Performance of the selected panel */}
      <PanelStatsCard isDark={isDark} stats={stats} loading={loading} />
    </div>
  );
}