// stores/languageStore.ts
'use client';

import { useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import arMessages from '../messages/ar.json';
import enMessages from '../messages/en.json';

export type Locale = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

const BUILTIN_ADMIN_AR: Record<string, Record<string, string>> = {
  "components_screens_admin_AdminScreen": {
    "back": "→ رجوع",
    "admin_panel": "لوحة تحكم الأدمن",
    "overview": "نظرة عامة",
    "questions": "بنك الأسئلة",
    "reports": "البلاغات",
    "system": "النظام والمستخدمون"
  },
  "components_screens_admin_AdminSystemTab": {
    "users": "المستخدمون",
    "activity": "سجل النشاط",
    "settings": "الإعدادات"
  },
  "components_screens_admin_AdminUsersTab": {
    "all": "الكل",
    "active": "نشط (آخر 7 أيام)",
    "inactive": "غير نشط",
    "never": "لم يسجل دخول",
    "users": "المستخدمون المسجلون",
    "search_by_email": "ابحث بالبريد الإلكتروني أو الاسم...",
    "export_csv": "تصدير CSV",
    "loading_users": "جاري تحميل بيانات المستخدمين...",
    "copy_email": "نسخ البريد الإلكتروني",
    "view_details": "عرض التفاصيل",
    "no_users_match_this_filter": "لا يوجد مستخدمون يطابقون هذا الفلتر.",
    "joined": "تاريخ التسجيل",
    "last_sign_in": "آخر ظهور",
    "never_signed_in": "لم يدخل بعد",
    "user_details": "تفاصيل المستخدم",
    "user_id": "معرّف المستخدم (ID)",
    "name": "الاسم",
    "email": "البريد الإلكتروني",
    "status": "الحالة",
    "close": "إغلاق"
  },
  "components_screens_admin_AdminSettingsTab": {
    "loading_settings": "جاري تحميل الإعدادات...",
    "we_couldn_t_load_the": "تعذر تحميل إعدادات الموقع.",
    "try_again": "إعادة المحاولة",
    "site": "بيانات الموقع",
    "site_name": "اسم الموقع",
    "contact_email": "بريد التواصل",
    "user_announcement": "شريط التنبيهات والإعلانات للمستخدمين",
    "type_the_announcement_users_will": "اكتب نص الإعلان أو التنبيه الذي سيظهر للمستخدمين أعلى الموقع...",
    "maintenance": "وضع الصيانة (Maintenance Mode)",
    "take_entire_site_offline": "إيقاف الموقع بالكامل للصيانة",
    "users_can_t_sign_in": "لن يتمكن المستخدمون من الدخول (باستثناء حساب الأدمن).",
    "a_switch_that_is_on": "تفعيل أي مفتاح يضع هذا القسم تحديداً في وضع الصيانة.",
    "you_have_unsaved_changes": "لديك تعديلات غير محفوظة",
    "revert": "تراجع",
    "saving": "جاري الحفظ...",
    "save_changes": "حفظ التغييرات"
  },
  "components_screens_admin_AdminActivityTab": {
    "activity_log": "سجل النشاط",
    "search_events": "ابحث في الأحداث أو البريد...",
    "export_csv": "تصدير CSV",
    "no_events_recorded_yet": "لا توجد أحداث مسجلة حتى الآن."
  },
  "components_screens_admin_AdminToolbar": {
    "refresh": "تحديث البيانات",
    "more_actions": "المزيد من الإجراءات"
  },
  "components_screens_admin_RowMenu": {
    "more": "خيارات إضافية"
  },
  "components_screens_admin_AdminQuestionsTab": {
    "question_bank": "بنك الأسئلة",
    "search_question_text": "ابحث في نص السؤال...",
    "export_current_page": "تصدير الصفحة الحالية (CSV)",
    "scan_duplicates": "فحص الأسئلة المكررة",
    "all_categories": "كل التصنيفات",
    "all_levels": "كل مستويات الصعوبة",
    "easy": "سهل",
    "medium": "متوسط",
    "hard": "صعب",
    "clear_filters": "مسح الفلاتر",
    "cancel": "إلغاء",
    "delete": "حذف المحدد",
    "select_all_on_page": "تحديد كل الأسئلة في هذه الصفحة",
    "no_explanation": "بدون شرح",
    "edit": "تعديل",
    "duplicate": "نسخ",
    "delete_2": "حذف",
    "no_questions_match_these_filters": "لا توجد أسئلة تطابق هذه الفلاتر.",
    "prev": "السابق",
    "next": "التالي",
    "new_question": "إضافة سؤال جديد",
    "close": "إغلاق"
  },
  "components_screens_admin_AdminManageQuestionsTab": {
    "edit_question": "تعديل السؤال",
    "cancel": "إلغاء",
    "category": "التصنيف",
    "easy": "سهل",
    "medium": "متوسط",
    "hard": "صعب",
    "question_text": "نص السؤال",
    "explanation": "الشرح والتفسير الطبي",
    "update_question": "حفظ تحديث السؤال",
    "search_questions": "ابحث في الأسئلة...",
    "edit": "تعديل",
    "delete": "حذف",
    "no_questions_found": "لم يتم العثور على أسئلة.",
    "prev": "السابق",
    "next": "التالي"
  },
  "components_screens_admin_AdminAddQuestionTab": {
    "add_new_question_db_insert": "إضافة سؤال جديد إلى قاعدة البيانات",
    "category_e_g_anatomy": "التصنيف (مثال: Anatomy, Surgery)",
    "easy": "سهل",
    "medium": "متوسط",
    "hard": "صعب",
    "question_text": "نص السؤال",
    "explanation": "الشرح الطبي التفصيلي",
    "save_to_database": "حفظ في قاعدة البيانات"
  },
  "components_screens_admin_AdminReportsTab": {
    "question_reports": "بلاغات الأسئلة",
    "no_open_reports_when_users": "لا توجد بلاغات مفتوحة حالياً! عندما يقوم المستخدمون بالإبلاغ عن سؤال سيظهر هنا.",
    "mark_resolved": "✓ تم الحل",
    "delete_question": "🗑 حذف السؤال"
  },
  "components_screens_admin_PanelStatsCard": {
    "total_questions": "إجمالي الأسئلة",
    "missing_explanation": "بدون شرح",
    "duplicates": "أسئلة مكررة",
    "active_users_7d": "المستخدمون النشطون (7 أيام)",
    "total_courses": "إجمالي الكورسات",
    "active_enrollments": "الاشتراكات النشطة",
    "completed_month": "مكتمل هذا الشهر",
    "average_rating": "متوسط التقييم",
    "total_cards": "إجمالي البطاقات",
    "due_today": "مستحق اليوم",
    "reviewed_week": "تمت مراجعته (7 أيام)",
    "retention_rate": "معدل الاستيعاب",
    "active_rooms": "الغرف النشطة",
    "sessions_week": "الجلسات (7 أيام)",
    "avg_duration": "متوسط المدة",
    "peak_users_today": "أعلى تواجد اليوم",
    "difficulty_distribution": "توزيع مستوى الصعوبة",
    "top_categories": "أبرز التصنيفات"
  }
};

const BUILTIN_ADMIN_EN: Record<string, Record<string, string>> = {
  "components_screens_admin_AdminScreen": {
    "back": "← Back",
    "admin_panel": "Admin Panel",
    "overview": "Overview",
    "questions": "Questions",
    "reports": "Reports",
    "system": "System"
  },
  "components_screens_admin_AdminSystemTab": {
    "users": "Users",
    "activity": "Activity",
    "settings": "Settings"
  },
  "components_screens_admin_AdminUsersTab": {
    "all": "All",
    "active": "Active (7d)",
    "inactive": "Inactive",
    "never": "Never signed in",
    "users": "Registered Users",
    "search_by_email": "Search by email or name...",
    "export_csv": "Export CSV",
    "loading_users": "Loading registered users...",
    "copy_email": "Copy email",
    "view_details": "View details",
    "no_users_match_this_filter": "No users match this filter.",
    "joined": "Joined",
    "last_sign_in": "Last sign-in",
    "never_signed_in": "never",
    "user_details": "User Details",
    "user_id": "User ID",
    "name": "Name",
    "email": "Email",
    "status": "Status",
    "close": "Close"
  },
  "components_screens_admin_AdminSettingsTab": {
    "loading_settings": "Loading settings...",
    "we_couldn_t_load_the": "We couldn't load the site settings.",
    "try_again": "Try again",
    "site": "Site Information",
    "site_name": "Site Name",
    "contact_email": "Contact Email",
    "user_announcement": "User Announcement Banner",
    "type_the_announcement_users_will": "Type the announcement users will see at the top of the app...",
    "maintenance": "Maintenance Mode",
    "take_entire_site_offline": "Take entire site offline",
    "users_can_t_sign_in": "Users can't sign in or use the app (Admins bypass this).",
    "a_switch_that_is_on": "A switch that is ON puts that specific section into maintenance mode.",
    "you_have_unsaved_changes": "You have unsaved changes",
    "revert": "Revert",
    "saving": "Saving...",
    "save_changes": "Save Changes"
  },
  "components_screens_admin_AdminActivityTab": {
    "activity_log": "Activity Log",
    "search_events": "Search events or actor email...",
    "export_csv": "Export CSV",
    "no_events_recorded_yet": "No activity events recorded yet."
  },
  "components_screens_admin_AdminToolbar": {
    "refresh": "Refresh",
    "more_actions": "More actions"
  },
  "components_screens_admin_RowMenu": {
    "more": "More options"
  },
  "components_screens_admin_AdminQuestionsTab": {
    "question_bank": "Question Bank",
    "search_question_text": "Search question text...",
    "export_current_page": "Export current page (CSV)",
    "scan_duplicates": "Scan duplicates",
    "all_categories": "All Categories",
    "all_levels": "All Difficulty Levels",
    "easy": "Easy",
    "medium": "Medium",
    "hard": "Hard",
    "clear_filters": "Clear filters",
    "cancel": "Cancel",
    "delete": "Delete Selected",
    "select_all_on_page": "Select all on page",
    "no_explanation": "No explanation",
    "edit": "Edit",
    "duplicate": "Duplicate",
    "delete_2": "Delete",
    "no_questions_match_these_filters": "No questions match these filters.",
    "prev": "Previous",
    "next": "Next",
    "new_question": "New Question",
    "close": "Close"
  },
  "components_screens_admin_AdminManageQuestionsTab": {
    "edit_question": "Edit Question",
    "cancel": "Cancel",
    "category": "Category",
    "easy": "Easy",
    "medium": "Medium",
    "hard": "Hard",
    "question_text": "Question Text",
    "explanation": "Explanation",
    "update_question": "Update Question",
    "search_questions": "Search questions...",
    "edit": "Edit",
    "delete": "Delete",
    "no_questions_found": "No questions found.",
    "prev": "Previous",
    "next": "Next"
  },
  "components_screens_admin_AdminAddQuestionTab": {
    "add_new_question_db_insert": "Add New Question",
    "category_e_g_anatomy": "Category (e.g. Anatomy, Pathology)",
    "easy": "Easy",
    "medium": "Medium",
    "hard": "Hard",
    "question_text": "Question Text",
    "explanation": "Detailed Clinical Explanation",
    "save_to_database": "Save to Database"
  },
  "components_screens_admin_AdminReportsTab": {
    "question_reports": "Question Reports",
    "no_open_reports_when_users": "No open reports! When users flag a question, it will appear here.",
    "mark_resolved": "✓ Mark Resolved",
    "delete_question": "🗑 Delete Question"
  },
  "components_screens_admin_PanelStatsCard": {
    "total_questions": "Total Questions",
    "missing_explanation": "Missing Explanation",
    "duplicates": "Duplicates",
    "active_users_7d": "Active Users (7d)",
    "total_courses": "Total Courses",
    "active_enrollments": "Active Enrollments",
    "completed_month": "Completed (Month)",
    "average_rating": "Average Rating",
    "total_cards": "Total Cards",
    "due_today": "Due Today",
    "reviewed_week": "Reviewed (7d)",
    "retention_rate": "Retention Rate",
    "active_rooms": "Active Rooms",
    "sessions_week": "Sessions (7d)",
    "avg_duration": "Avg Duration",
    "peak_users_today": "Peak Users Today",
    "difficulty_distribution": "Difficulty Distribution",
    "top_categories": "Top Categories"
  }
};

const DICTIONARIES: Record<Locale, Record<string, any>> = {
  ar: { ...BUILTIN_ADMIN_AR, ...(arMessages as Record<string, any>) },
  en: { ...BUILTIN_ADMIN_EN, ...(enMessages as Record<string, any>) },
};

// Ensure all builtin admin keys exist even if JSON cache was stale
for (const ns of Object.keys(BUILTIN_ADMIN_AR)) {
  DICTIONARIES.ar[ns] = { ...BUILTIN_ADMIN_AR[ns], ...(DICTIONARIES.ar[ns] || {}) };
}
for (const ns of Object.keys(BUILTIN_ADMIN_EN)) {
  DICTIONARIES.en[ns] = { ...BUILTIN_ADMIN_EN[ns], ...(DICTIONARIES.en[ns] || {}) };
}

interface LanguageState {
  locale: Locale;
  direction: Direction;
  setLocale: (locale: Locale, userId?: string | null) => Promise<void>;
  toggleLocale: (userId?: string | null) => Promise<void>;
  syncFromDatabase: (userId: string) => Promise<void>;
}

/**
 * تطبيق اتجاه الصفحة واللغة على وسم <html> مباشرة
 */
function applyDocumentLocale(locale: Locale) {
  if (typeof document === 'undefined') return;
  const dir: Direction = locale === 'ar' ? 'rtl' : 'ltr';
  const root = document.documentElement;
  root.lang = locale;
  root.dir = dir;
  root.dataset.locale = locale;
}

function humanizeMissingKey(fullKey: string): string {
  const leaf = fullKey.includes('.') ? fullKey.split('.').pop()! : fullKey;
  return leaf
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * البحث عن قيمة مفتاح متداخل داخل القاموس مع دعم المتغيرات {placeholder}
 */
function resolveTranslation(
  locale: Locale,
  fullKey: string,
  params?: Record<string, string | number>
): string {
  const keys = fullKey.split('.');
  let value: any = DICTIONARIES[locale];

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }

  // الرجوع إلى القاموس الإنجليزي كاحتياط إذا لم تكتمل ترجمة المفتاح بعد
  if (typeof value !== 'string') {
    let fallback: any = DICTIONARIES.en;
    for (const k of keys) {
      fallback = fallback?.[k];
      if (fallback === undefined) break;
    }
    value = typeof fallback === 'string' ? fallback : humanizeMissingKey(fullKey);
  }

  if (!params) return value;

  return Object.entries(params).reduce((acc, [paramKey, paramVal]) => {
    return acc.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
  }, value);
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      locale: 'en',
      direction: 'ltr',

      setLocale: async (locale: Locale, userId?: string | null) => {
        const direction: Direction = locale === 'ar' ? 'rtl' : 'ltr';
        set({ locale, direction });
        applyDocumentLocale(locale);

        if (userId) {
          try {
            await supabase
              .from('user_settings')
              .upsert(
                { user_id: userId, preferred_language: locale },
                { onConflict: 'user_id' }
              );
          } catch (err) {
            console.warn('Failed to sync preferred_language to user_settings:', err);
          }
        }
      },

      toggleLocale: async (userId?: string | null) => {
        const next: Locale = get().locale === 'en' ? 'ar' : 'en';
        await get().setLocale(next, userId);
      },

      syncFromDatabase: async (userId: string) => {
        if (!userId) return;
        try {
          const { data, error } = await supabase
            .from('user_settings')
            .select('preferred_language')
            .eq('user_id', userId)
            .maybeSingle();

          if (!error && data?.preferred_language) {
            const dbLocale = data.preferred_language === 'ar' ? 'ar' : 'en';
            if (dbLocale !== get().locale) {
              set({
                locale: dbLocale,
                direction: dbLocale === 'ar' ? 'rtl' : 'ltr',
              });
              applyDocumentLocale(dbLocale);
            }
          }
        } catch {}
      },
    }),
    {
      name: 'codeblue_language',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        locale: state.locale,
        direction: state.direction,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.locale) {
          applyDocumentLocale(state.locale);
        }
      },
    }
  )
);

/**
 * 1) خطاف متوافق 100% مع سكريبت i18n-auto.ts
 */
export function useTranslations(namespace?: string) {
  const locale = useLanguageStore((s) => s.locale);

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      return resolveTranslation(locale, fullKey, params);
    },
    [locale, namespace]
  );

  return t;
}

/**
 * 2) خطاف الترجمة الشامل للتحكم في اللغة والاتجاه (المستخدم في UserMenu و Sidebar)
 */
export function useTranslation(namespace?: string) {
  const locale = useLanguageStore((s) => s.locale);
  const direction = useLanguageStore((s) => s.direction);
  const setLocale = useLanguageStore((s) => s.setLocale);
  const toggleLocale = useLanguageStore((s) => s.toggleLocale);

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      return resolveTranslation(locale, fullKey, params);
    },
    [locale, namespace]
  );

  return {
    t,
    locale,
    direction,
    isRTL: direction === 'rtl',
    setLocale,
    toggleLocale,
  };
}
