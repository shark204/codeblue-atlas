// stores/adminStore.ts
import { create } from 'zustand';
import type { PanelId } from '../lib/panels';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type AdminTab =
  | 'overview'
  | 'questions'
  | 'reports'
  | 'system';  

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

export interface AdminQuestion {
  id: number;
  Question_Text: string;
  Theme_Category: string;
  Difficulty: 0 | 1 | 2 | 3;
  Explanation?: string | null;
  [key: string]: any;
}

export interface QuestionReport {
  id: number;
  question_id: number;
  question_text: string;
  reason: string;
  status: 'open' | 'resolved';
  reported_by: string | null;
  created_at: string;
}

export interface ActivityLogEntry {
  id: number;
  actor_email: string;
  action: string;
  target: string | null;
  created_at: string;
}

export interface SiteSettings {
  site_name?: string;
  contact_email?: string;

  announcement?: string;
  announcement_enabled?: boolean;
  announcement_type?: 'info' | 'warning' | 'success';

  exam_questions_count?: number;
  exam_duration_minutes?: number;

  maintenance_mode?: boolean;
  maintenance_mrcs_bank?: boolean;
  maintenance_exam?: boolean;
  maintenance_flashcards?: boolean;
  maintenance_analytics?: boolean;
  maintenance_study_room?: boolean;
  maintenance_notebook?: boolean;

  [key: string]: any;
}

/* ------------------------------------------------------------------ */
/*  Store Interface                                                    */
/* ------------------------------------------------------------------ */

interface AdminState {
  /* --- Navigation ------------------------------------------------- */
  adminTab: AdminTab;
  setAdminTab: (t: AdminTab) => void;

  /** Panel selector — separate from the site's `currentPanel`. */
  adminSelectedPanel: PanelId;
  setAdminSelectedPanel: (p: PanelId) => void;

  /* --- Questions -------------------------------------------------- */
  adminQuestions: AdminQuestion[];
  setAdminQuestions: (q: AdminQuestion[]) => void;

  adminTotalCount: number;
  setAdminTotalCount: (n: number) => void;

  adminQuestionsSearch: string;
  setAdminQuestionsSearch: (s: string) => void;

  adminCategoryFilter: string;
  setAdminCategoryFilter: (c: string) => void;

  /** 0 = All, 1 = Easy, 2 = Medium, 3 = Hard */
  adminDifficultyFilter: number;
  setAdminDifficultyFilter: (d: number) => void;

  adminPage: number;
  setAdminPage: (n: number) => void;

  editingQuestion: AdminQuestion | null;
  setEditingQuestion: (q: AdminQuestion | null) => void;

  /* --- New Question Form (✅ NEW) --------------------------------- */
  newQ: any;
  setNewQ: (q: any) => void;

  /* --- Question Reports ------------------------------------------ */
  reports: QuestionReport[];
  setReports: (r: QuestionReport[]) => void;

  reportsLoading: boolean;
  setReportsLoading: (b: boolean) => void;

  /* --- Users ------------------------------------------------------ */
  adminUsers: AdminUser[];
  setAdminUsers: (u: AdminUser[]) => void;

  adminUsersLoading: boolean;
  setAdminUsersLoading: (b: boolean) => void;

  /* --- Activity Log (audit) -------------------------------------- */
  activityLog: ActivityLogEntry[];
  setActivityLog: (a: ActivityLogEntry[]) => void;

  activityLoading: boolean;
  setActivityLoading: (b: boolean) => void;

  /* --- Site Settings --------------------------------------------- */
  siteSettings: SiteSettings | null;
  setSiteSettings: (s: SiteSettings) => void;

  siteSettingsLoading: boolean;
  setSiteSettingsLoading: (b: boolean) => void;

  siteSettingsSaving: boolean;
  setSiteSettingsSaving: (b: boolean) => void;

  /* --- Duplicates ------------------------------------------------- */
  duplicatesCount: number;
  setDuplicatesCount: (n: number) => void;

  duplicatesScanning: boolean;
  setDuplicatesScanning: (b: boolean) => void;
}

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

export const useAdminStore = create<AdminState>((set) => ({
  /* --- Navigation ------------------------------------------------- */
  adminTab: 'overview',
  setAdminTab: (adminTab) => set({ adminTab }),

  adminSelectedPanel: 'mrcs',
  setAdminSelectedPanel: (adminSelectedPanel) => set({ adminSelectedPanel }),

  /* --- Questions -------------------------------------------------- */
  adminQuestions: [],
  setAdminQuestions: (adminQuestions) => set({ adminQuestions }),

  adminTotalCount: 0,
  setAdminTotalCount: (adminTotalCount) => set({ adminTotalCount }),

  adminQuestionsSearch: '',
  setAdminQuestionsSearch: (adminQuestionsSearch) => set({ adminQuestionsSearch }),

  adminCategoryFilter: '',
  setAdminCategoryFilter: (adminCategoryFilter) => set({ adminCategoryFilter }),

  adminDifficultyFilter: 0,
  setAdminDifficultyFilter: (adminDifficultyFilter) => set({ adminDifficultyFilter }),

  adminPage: 1,
  setAdminPage: (adminPage) => set({ adminPage }),

  editingQuestion: null,
  setEditingQuestion: (editingQuestion) => set({ editingQuestion }),

  /* --- New Question Form (✅ NEW) --------------------------------- */
  newQ: { 
    Theme_Category: '', 
    Question_Text: '', 
    Option_A: '', 
    Option_B: '', 
    Option_C: '', 
    Option_D: '', 
    Option_E: '', 
    Correct_Answer: 'A', 
    Explanation: '', 
    Difficulty: 1 
  },
  setNewQ: (newQ) => set({ newQ }),

  /* --- Question Reports ------------------------------------------ */
  reports: [],
  setReports: (reports) => set({ reports }),

  reportsLoading: false,
  setReportsLoading: (reportsLoading) => set({ reportsLoading }),

  /* --- Users ------------------------------------------------------ */
  adminUsers: [],
  setAdminUsers: (adminUsers) => set({ adminUsers }),

  adminUsersLoading: false,
  setAdminUsersLoading: (adminUsersLoading) => set({ adminUsersLoading }),

  /* --- Activity Log ---------------------------------------------- */
  activityLog: [],
  setActivityLog: (activityLog) => set({ activityLog }),

  activityLoading: false,
  setActivityLoading: (activityLoading) => set({ activityLoading }),

  /* --- Site Settings --------------------------------------------- */
  siteSettings: null,
  setSiteSettings: (siteSettings) => set({ siteSettings }),

  siteSettingsLoading: false,
  setSiteSettingsLoading: (siteSettingsLoading) => set({ siteSettingsLoading }),

  siteSettingsSaving: false,
  setSiteSettingsSaving: (siteSettingsSaving) => set({ siteSettingsSaving }),

  /* --- Duplicates ------------------------------------------------- */
  duplicatesCount: 0,
  setDuplicatesCount: (duplicatesCount) => set({ duplicatesCount }),

  duplicatesScanning: false,
  setDuplicatesScanning: (duplicatesScanning) => set({ duplicatesScanning }),
}));