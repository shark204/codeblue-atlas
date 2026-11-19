'use client';
import { useAdminStore } from '../../../stores/adminStore';
import { LayoutDashboard, FileQuestion, Flag, Settings2 } from 'lucide-react';
import AdminOverviewTab, { OverviewStats } from './AdminOverviewTab';
import AdminQuestionsTab from './AdminQuestionsTab';
import AdminReportsTab from './AdminReportsTab';
import AdminSystemTab from './AdminSystemTab';
import { useTranslations } from '@/stores/languageStore';

type Props = {
  isDark: boolean;
  onBack: () => void;

  // Overview
  overviewStats: OverviewStats | null;
  overviewLoading: boolean;
  onFetchOverview: () => void;

  // Questions
  categories: string[];
  onAddQuestion: (e: React.FormEvent<HTMLFormElement>) => void;
  newQ: any;
  setNewQ: (q: any) => void;
  onUpdateQuestion: (e: React.FormEvent<HTMLFormElement>) => void;
  onDeleteQuestion: (id: number) => void;
  onBulkDelete: (ids: number[]) => void;
  editingQuestion: any;
  setEditingQuestion: (q: any) => void;

  // Reports
  onFetchReports: () => void;
  onResolveReport: (id: number) => void;

  // System
  onFetchAdminUsers: () => void;
  onFetchActivity: () => void;
  onFetchSiteSettings: () => void;
  onSaveSiteSettings: () => void;
};

const TABS = [
  { key: 'overview',  labelKey: 'overview',  Icon: LayoutDashboard },
  { key: 'questions', labelKey: 'questions', Icon: FileQuestion },
  { key: 'reports',   labelKey: 'reports',   Icon: Flag },
  { key: 'system',    labelKey: 'system',    Icon: Settings2 },
] as const;

export default function AdminScreen(props: Props) {
  const t = useTranslations('components_screens_admin_AdminScreen');
  const { isDark, onBack } = props;

  const adminTab = useAdminStore(s => s.adminTab);
  const setAdminTab = useAdminStore(s => s.setAdminTab);
  const setEditingQuestion = useAdminStore(s => s.setEditingQuestion) as any;

  const openReports = useAdminStore(s => s.reports).filter((r: any) => r.status !== 'resolved').length;

  const surface = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className="w-full animate-fade-in space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs border ${
            isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          {t('back')}
        </button>
        <h1 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('admin_panel')}
        </h1>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 overflow-x-auto p-1.5 rounded-2xl border ${surface}`}>
        {TABS.map(tab => {
          const Icon = tab.Icon;
          const isActive = adminTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => { setAdminTab(tab.key); setEditingQuestion(null); }}
              className={`flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-xl transition-colors ${
                isActive
                  ? 'bg-amber-500 text-white'
                  : isDark
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={14} strokeWidth={2.5} />
              {t(tab.labelKey)}
              {tab.key === 'reports' && openReports > 0 && (
                <span className="px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                  {openReports}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {adminTab === 'overview' && (
        <AdminOverviewTab
          isDark={isDark}
          stats={props.overviewStats}
          loading={props.overviewLoading}
        />
      )}

      {adminTab === 'questions' && (
        <AdminQuestionsTab
          isDark={isDark}
          categories={props.categories}
          onAddQuestion={props.onAddQuestion}
          newQ={props.newQ}
          setNewQ={props.setNewQ}
          onUpdateQuestion={props.onUpdateQuestion}
          onDeleteQuestion={props.onDeleteQuestion}
          onBulkDelete={props.onBulkDelete}
          editingQuestion={props.editingQuestion}
          setEditingQuestion={props.setEditingQuestion}
        />
      )}

      {adminTab === 'reports' && (
        <AdminReportsTab
          isDark={isDark}
          onFetchReports={props.onFetchReports}
          onResolveReport={props.onResolveReport}
          onDeleteQuestion={props.onDeleteQuestion}
        />
      )}

      {adminTab === 'system' && (
        <AdminSystemTab
          isDark={isDark}
          onFetchAdminUsers={props.onFetchAdminUsers}
          onFetchActivity={props.onFetchActivity}
          onFetchSiteSettings={props.onFetchSiteSettings}
          onSaveSiteSettings={props.onSaveSiteSettings}
        />
      )}
    </div>
  );
}
