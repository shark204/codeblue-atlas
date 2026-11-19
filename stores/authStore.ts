// stores/authStore.ts
// ═══════════════════════════════════════════════════════════
// Auth Store — المصدر الوحيد لحالة المصادقة
// يحل محل الـ useState's في useHomeState (المتغيرات 16 الأولى)
// ═══════════════════════════════════════════════════════════

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SavedAccount {
  email: string;
  name: string;
}

interface AuthState {
  // ═══ Session (يُدار من Supabase — لا يُحفظ في localStorage) ═══
  session: any | null;
  sessionLoaded: boolean;

  // ═══ Form State ═══
  authName: string;
  authEmail: string;
  authPassword: string;
  isLoginMode: boolean;
  authLoading: boolean;

  // ═══ Saved Accounts (يُحفظ) ═══
  savedAccounts: SavedAccount[];

  // ═══ Setters ═══
  setSession: (session: any | null) => void;
  setSessionLoaded: (loaded: boolean) => void;
  setAuthName: (name: string) => void;
  setAuthEmail: (email: string) => void;
  setAuthPassword: (password: string) => void;
  setIsLoginMode: (isLogin: boolean) => void;
  setAuthLoading: (loading: boolean) => void;
  setSavedAccounts: (accounts: SavedAccount[]) => void;

  // ═══ Helpers ═══
  addSavedAccount: (account: SavedAccount) => void;
  removeSavedAccount: (email: string) => void;
  resetAuthForm: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // ── Initial State ──
      session: null,
      sessionLoaded: false,

      authName: '',
      authEmail: '',
      authPassword: '',
      isLoginMode: true,
      authLoading: false,

      savedAccounts: [],

      // ── Setters ──
      setSession: (session) => set({ session }),
      setSessionLoaded: (sessionLoaded) => set({ sessionLoaded }),
      setAuthName: (authName) => set({ authName }),
      setAuthEmail: (authEmail) => set({ authEmail }),
      setAuthPassword: (authPassword) => set({ authPassword }),
      setIsLoginMode: (isLoginMode) => set({ isLoginMode }),
      setAuthLoading: (authLoading) => set({ authLoading }),
      setSavedAccounts: (savedAccounts) => set({ savedAccounts }),

      // ── Helpers ──
      addSavedAccount: (account) =>
        set((s) => {
          if (s.savedAccounts.some((a) => a.email === account.email)) return s;
          return { savedAccounts: [...s.savedAccounts, account] };
        }),

      removeSavedAccount: (email) =>
        set((s) => ({
          savedAccounts: s.savedAccounts.filter((a) => a.email !== email),
        })),

      resetAuthForm: () =>
        set({
          authName: '',
          authEmail: '',
          authPassword: '',
          authLoading: false,
        }),
    }),
    {
      name: 'codeblue_auth',
      storage: createJSONStorage(() => localStorage),
      // نحفظ فقط ما يجب أن يبقى بين الجلسات.
      // ملاحظة: session و sessionLoaded لا يُحفظان — يتم ضبطهما من Supabase.
      partialize: (state) => ({
        savedAccounts: state.savedAccounts,
        authEmail: state.authEmail,
        authName: state.authName,
      }),
    }
  )
);