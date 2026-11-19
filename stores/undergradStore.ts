import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UndergradState {
  undergradModules: any[];
  selectedYear: number;
  selectedSemester: number;
  selectedModule: string;
  selectedSubject: string;
  undergradLoading: boolean;
  examBank: 'mrcs' | 'undergraduate';

  setUndergradModules: (m: any[]) => void;
  setSelectedYear: (y: number) => void;
  setSelectedSemester: (s: number) => void;
  setSelectedModule: (m: string) => void;
  setSelectedSubject: (s: string) => void;
  setUndergradLoading: (l: boolean) => void;
  setExamBank: (b: 'mrcs' | 'undergraduate') => void;
}

export const useUndergradStore = create<UndergradState>()(
  persist(
    (set) => ({
      undergradModules: [],
      selectedYear: 1,
      selectedSemester: 1,
      selectedModule: '',
      selectedSubject: 'All',
      undergradLoading: false,
      examBank: 'mrcs',

      setUndergradModules: (undergradModules) => set({ undergradModules }),
      setSelectedYear: (selectedYear) => set({ selectedYear }),
      setSelectedSemester: (selectedSemester) => set({ selectedSemester }),
      setSelectedModule: (selectedModule) => set({ selectedModule }),
      setSelectedSubject: (selectedSubject) => set({ selectedSubject }),
      setUndergradLoading: (undergradLoading) => set({ undergradLoading }),
      setExamBank: (examBank) => set({ examBank }),
    }),
    {
      name: 'codeblue_undergrad',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedYear: state.selectedYear,
        selectedSemester: state.selectedSemester,
        selectedSubject: state.selectedSubject,
        examBank: state.examBank, // يحفظ اختيار البنك تلقائياً بدل الـ useEffect القديم
      }),
    }
  )
);