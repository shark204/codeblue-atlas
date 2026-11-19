// stores/settingsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  // ═══ Filters & Modes ═══
  selectedCategory: string;
  selectedDifficulty: number | 'All';
  displayMode: 'horizontal' | 'vertical';
  repeatIncorrect: boolean;
  skipDuplicates: boolean;
  spectateMode: boolean;
  
  // ═══ Dashboard State ═══
  dashboardStep: number;
  hasSavedSettings: boolean;
  loading: boolean;

  // ═══ Setters ═══
  setSelectedCategory: (val: string) => void;
  setSelectedDifficulty: (val: number | 'All') => void;
  setDisplayMode: (val: 'horizontal' | 'vertical') => void;
  setRepeatIncorrect: (val: boolean) => void;
  setSkipDuplicates: (val: boolean) => void;
  setSpectateMode: (val: boolean) => void;
  setDashboardStep: (val: number) => void;
  setHasSavedSettings: (val: boolean) => void;
  setLoading: (val: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      selectedCategory: 'All',
      selectedDifficulty: 'All',
      displayMode: 'horizontal',
      repeatIncorrect: false,
      skipDuplicates: true,
      spectateMode: false,
      
      dashboardStep: 1,
      hasSavedSettings: false,
      loading: true,

      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setSelectedDifficulty: (selectedDifficulty) => set({ selectedDifficulty }),
      setDisplayMode: (displayMode) => set({ displayMode }),
      setRepeatIncorrect: (repeatIncorrect) => set({ repeatIncorrect }),
      setSkipDuplicates: (skipDuplicates) => set({ skipDuplicates }),
      setSpectateMode: (spectateMode) => set({ spectateMode }),
      setDashboardStep: (dashboardStep) => set({ dashboardStep }),
      setHasSavedSettings: (hasSavedSettings) => set({ hasSavedSettings }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'codeblue_settings',
      storage: createJSONStorage(() => localStorage),
      // نحفظ فقط الإعدادات التي يجب أن تبقى مع المستخدم
      partialize: (state) => ({
        selectedCategory: state.selectedCategory,
        selectedDifficulty: state.selectedDifficulty,
        displayMode: state.displayMode,
        repeatIncorrect: state.repeatIncorrect,
        skipDuplicates: state.skipDuplicates,
        spectateMode: state.spectateMode,
      }),
    }
  )
);