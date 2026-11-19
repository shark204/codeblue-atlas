// stores/uiStore.ts
import { create } from 'zustand';
import type { ScreenType } from '../lib/helpers';

// ============ أنواع ============
type ToastType = 'success' | 'error' | 'info';
type Toast = { msg: string; type: ToastType };
type ConfirmDialog = { isOpen: boolean; text: string; action: () => void };

export type PanelId = 'mrcs' | 'mrcb' | 'undergraduate' | 'courses' | 'revision' | 'study_room' | 'usmle' | 'atlas';

interface UIState {
  currentScreen: ScreenType;
  setCurrentScreen: (s: ScreenType) => void;
  currentPanel: PanelId;
  setCurrentPanel: (p: PanelId) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  toast: Toast | null;
  showToast: (msg: string, type?: ToastType) => void;
  confirmDialog: ConfirmDialog | null;
  setConfirmDialog: (d: ConfirmDialog | null) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (o: boolean) => void;
  profileDropdownOpen: boolean;
  navOpen: boolean;
  setNavOpen: (o: boolean) => void;
  reviewOpen: boolean;
  setReviewOpen: (o: boolean) => void;
  showToolsModal: boolean;
  setShowToolsModal: (o: boolean) => void;
  setProfileDropdownOpen: (o: boolean) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('codeblue_theme');
  return saved === 'light' || saved === 'dark' ? saved : 'dark';
};

const getInitialPanel = (): PanelId => {
  if (typeof window === 'undefined') return 'mrcs';
  const saved = localStorage.getItem('codeblue_current_panel');
  if (saved === 'mrcs' || saved === 'mrcb' || saved === 'undergraduate' || saved === 'courses' || saved === 'revision' || saved === 'study_room' || saved === 'atlas') {
    return saved as PanelId;
  }
  return 'mrcs';
};

export const useUIStore = create<UIState>((set) => ({
  currentScreen: 'landing',
  setCurrentScreen: (currentScreen) => set({ currentScreen }),
  currentPanel: getInitialPanel(),
  setCurrentPanel: (currentPanel) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('codeblue_current_panel', currentPanel);
    }
    set({ currentPanel });
  },
  theme: getInitialTheme(),
  toggleTheme: () => set((s) => {
    const next = s.theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('codeblue_theme', next);
    }
    return { theme: next };
  }),
  toast: null,
  showToast: (msg, type = 'info') => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toast: { msg, type } });
    toastTimer = setTimeout(() => set({ toast: null }), 3500);
  },
  confirmDialog: null,
  setConfirmDialog: (confirmDialog) => set({ confirmDialog }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  navOpen: true,
  setNavOpen: (navOpen) => set({ navOpen }),
  reviewOpen: true,
  setReviewOpen: (reviewOpen) => set({ reviewOpen }),
  showToolsModal: false,
  setShowToolsModal: (showToolsModal) => set({ showToolsModal }),
  profileDropdownOpen: false,
  setProfileDropdownOpen: (profileDropdownOpen) => set({ profileDropdownOpen }),
}));