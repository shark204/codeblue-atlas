'use client';
import { useState } from 'react';
import { Users, Activity, Settings } from 'lucide-react';
import AdminUsersTab from './AdminUsersTab';
import AdminActivityTab from './AdminActivityTab';
import AdminSettingsTab from './AdminSettingsTab';
import { useTranslations } from '@/stores/languageStore';

type SubTab = 'users' | 'activity' | 'settings';

type Props = {
  isDark: boolean;
  // Users
  onFetchAdminUsers: () => void;
  // Activity
  onFetchActivity: () => void;
  // Settings
  onFetchSiteSettings: () => void;
  onSaveSiteSettings: () => void;
};

const SUB_TABS: { key: SubTab; labelKey: string; Icon: typeof Users }[] = [
  { key: 'users',    labelKey: 'users',    Icon: Users },
  { key: 'activity', labelKey: 'activity', Icon: Activity },
  { key: 'settings', labelKey: 'settings', Icon: Settings },
];

export default function AdminSystemTab({
  isDark,
  onFetchAdminUsers,
  onFetchActivity,
  onFetchSiteSettings,
  onSaveSiteSettings,
}: Props) {
  const t = useTranslations('components_screens_admin_AdminSystemTab');
  const [sub, setSub] = useState<SubTab>('users');

  const bar = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';

  return (
    <div className="mt-2 space-y-4" dir="rtl">
      {/* Sub-tabs bar */}
      <div className={`p-1.5 rounded-2xl border flex gap-1 ${bar}`}>
        {SUB_TABS.map(({ key, labelKey, Icon }) => (
          <button
            key={key}
            onClick={() => setSub(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-colors ${
              sub === key
                ? 'bg-amber-500 text-white'
                : isDark
                ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Icon size={14} strokeWidth={2.5} />
            {t(labelKey)}
          </button>
        ))}
      </div>

      {/* Content */}
      {sub === 'users' && (
        <AdminUsersTab isDark={isDark} onFetchAdminUsers={onFetchAdminUsers} />
      )}
      {sub === 'activity' && (
        <AdminActivityTab isDark={isDark} onFetchActivity={onFetchActivity} />
      )}
      {sub === 'settings' && (
        <AdminSettingsTab
          isDark={isDark}
          onFetchSiteSettings={onFetchSiteSettings}
          onSaveSiteSettings={onSaveSiteSettings}
        />
      )}
    </div>
  );
}
