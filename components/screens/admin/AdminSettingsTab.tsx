'use client';
import { useRef } from 'react';
import { useAdminStore } from '../../../stores/adminStore';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  onFetchSiteSettings: () => void;
  onSaveSiteSettings: () => void;
};

const SECTIONS = [
  ['maintenance_mrcs_bank',  '🧠 MRCS Bank'],
  ['maintenance_exam',       '⏱ Exams'],
  ['maintenance_flashcards', '⚡ Flashcards'],
  ['maintenance_analytics',  '📈 Analytics'],
  ['maintenance_study_room', '👥 Study Room'],
  ['maintenance_notebook',   '📓 Notebook'],
] as const;

const ANNOUNCEMENT_TYPES = [
  ['info',    'Info',      'bg-sky-500'],
  ['warning', 'Warning',   'bg-amber-500'],
  ['success', 'Good News', 'bg-emerald-500'],
] as const;

function Switch({
  on,
  onChange,
  danger,
}: {
  on: boolean;
  onChange: (b: boolean) => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
        on ? (danger ? 'bg-rose-500' : 'bg-emerald-500') : 'bg-slate-600'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
          on ? 'end-0.5' : 'end-[22px]'
        }`}
      />
    </button>
  );
}

export default function AdminSettingsTab({
  isDark,
  onFetchSiteSettings,
  onSaveSiteSettings,
}: Props) {
    const t = useTranslations('components_screens_admin_AdminSettingsTab');
  const st = useAdminStore(s => s.siteSettings);
  const set = useAdminStore(s => s.setSiteSettings);
  const loading = useAdminStore(s => s.siteSettingsLoading);
  const saving = useAdminStore(s => s.siteSettingsSaving);

  const snapshot = useRef<string | null>(null);
  if (st && snapshot.current === null) snapshot.current = JSON.stringify(st);
  const dirty = !!st && JSON.stringify(st) !== snapshot.current;

  const card  = `p-5 rounded-3xl border space-y-4 ${
    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
  }`;
  const input = `w-full p-3 rounded-xl border text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none ${
    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
  }`;
  const label = `block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`;
  const title = `text-sm font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`;
  const row   = `flex items-center justify-between gap-3 p-3 rounded-xl border ${
    isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
  }`;
  const txt   = `text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`;

  if (loading) return <p className="text-center py-10 text-slate-500 font-bold">{t('loading_settings')}</p>;

  if (!st) {
    return (
      <div className={`mt-2 p-8 text-center rounded-3xl border border-dashed ${
        isDark ? 'border-slate-700 text-slate-400' : 'border-slate-300 text-slate-500'
      }`}>
        <p className="font-bold mb-3">
          {t('we_couldn_t_load_the')}
                        </p>
        <button
          onClick={onFetchSiteSettings}
          className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-black"
        >
          {t('try_again')}
                        </button>
      </div>
    );
  }

  const update = (patch: any) => set({ ...st, ...patch });
  const type =
    ANNOUNCEMENT_TYPES.find(t => t[0] === (st.announcement_type || 'info')) ?? ANNOUNCEMENT_TYPES[0];

  return (
    <div className="mt-2 space-y-4 pb-24" dir="rtl">
      {/* Site Info */}
      <div className={card}>
        <h3 className={title}>{t('site')}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={label}>{t('site_name')}</label>
            <input
              className={input}
              value={st.site_name || ''}
              onChange={e => update({ site_name: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>{t('contact_email')}</label>
            <input
              dir="ltr"
              type="email"
              className={input}
              value={st.contact_email || ''}
              onChange={e => update({ contact_email: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Announcement */}
      <div className={card}>
        <div className="flex items-center justify-between">
          <h3 className={title}>{t('user_announcement')}</h3>
          <Switch
            on={!!st.announcement_enabled}
            onChange={b => update({ announcement_enabled: b })}
          />
        </div>
        <textarea
          rows={3}
          className={input}
          placeholder={t('type_the_announcement_users_will')}
          value={st.announcement || ''}
          onChange={e => update({ announcement: e.target.value })}
        />
        <div className="flex gap-2">
          {ANNOUNCEMENT_TYPES.map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => update({ announcement_type: k })}
              className={`px-4 py-2 rounded-full text-xs font-bold border ${
                (st.announcement_type || 'info') === k
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : isDark
                  ? 'border-slate-700 text-slate-300'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        {st.announcement && (
          <div
            className={`flex items-center gap-3 p-3 rounded-xl text-xs font-bold text-white ${
              type[2]
            } ${st.announcement_enabled ? '' : 'opacity-40'}`}
          >
            <span>📢</span>
            <span>{st.announcement}</span>
          </div>
        )}
      </div>

      {/* ❌ REMOVED: Exams section (Duration + Question Count) */}

      {/* Maintenance */}
      <div className={card}>
        <h3 className={title}>{t('maintenance')}</h3>
        <div
          className={`${row} ${
            st.maintenance_mode
              ? isDark
                ? '!border-rose-800 !bg-rose-950/30'
                : '!border-rose-300 !bg-rose-50'
              : ''
          }`}
        >
          <div>
            <p className={txt}>{t('take_entire_site_offline')}</p>
            <p className="text-[11px] text-slate-500">{t('users_can_t_sign_in')}</p>
          </div>
          <Switch danger on={!!st.maintenance_mode} onChange={b => update({ maintenance_mode: b })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SECTIONS.map(([k, l]) => (
            <div key={k} className={row}>
              <span className={txt}>{l}</span>
              <Switch on={!!st[k]} onChange={b => update({ [k]: b })} />
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-500">{t('a_switch_that_is_on')}</p>
      </div>

      {/* Save Bar */}
      {dirty && (
        <div
          className={`fixed bottom-4 inset-x-4 max-w-4xl mx-auto z-40 p-3 rounded-2xl border shadow-xl flex items-center justify-between ${
            isDark ? 'bg-slate-900 border-amber-700' : 'bg-white border-amber-400'
          }`}
        >
          <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
            {t('you_have_unsaved_changes')}
                                </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                snapshot.current = null;
                onFetchSiteSettings();
              }}
              className="px-3 py-2 text-xs font-bold text-slate-500"
            >
              {t('revert')}
                                      </button>
            <button
              disabled={saving}
              onClick={() => {
                onSaveSiteSettings();
                snapshot.current = JSON.stringify(st);
              }}
              className="px-5 py-2 rounded-xl bg-amber-500 text-white text-xs font-black disabled:opacity-50"
            >
              {saving ? t('saving') : t('save_changes')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}