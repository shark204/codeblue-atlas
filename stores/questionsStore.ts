// stores/questionsStore.ts
import { create } from 'zustand';

interface QuestionsState {
  // ═══ Data ═══
  questionsList: any[];
  questionsCount: number;
  undergradQuestionsCount: number;
  mrcbQuestionsCount: number;
  uniqueCategories: string[];
  weaknessStats: [string, number][];

  // ═══ Setters ═══
  setQuestionsList: (list: any[]) => void;
  setQuestionsCount: (count: number) => void;
  setUndergradQuestionsCount: (count: number) => void;
  setMrcbQuestionsCount: (count: number) => void;
  setUniqueCategories: (categories: string[]) => void;
  setWeaknessStats: (stats: [string, number][]) => void;
  
  // ═══ Helpers (اختياري للمستقبل) ═══
  resetQuestionsData: () => void;
}

export const useQuestionsStore = create<QuestionsState>()((set) => ({
  // Initial State
  questionsList: [],
  questionsCount: 0,
  undergradQuestionsCount: 0,
  mrcbQuestionsCount: 0,
  uniqueCategories: ['All'],
  weaknessStats: [],

  // Setters
  setQuestionsList: (questionsList) => set({ questionsList }),
  setQuestionsCount: (questionsCount) => set({ questionsCount }),
  setUndergradQuestionsCount: (undergradQuestionsCount) => set({ undergradQuestionsCount }),
  setMrcbQuestionsCount: (mrcbQuestionsCount) => set({ mrcbQuestionsCount }),
  setUniqueCategories: (uniqueCategories) => set({ uniqueCategories }),
  setWeaknessStats: (weaknessStats) => set({ weaknessStats }),

  // Helpers
  resetQuestionsData: () => set({
    questionsList: [],
    questionsCount: 0,
    undergradQuestionsCount: 0,
    mrcbQuestionsCount: 0,
    uniqueCategories: ['All'],
    weaknessStats: [],
  }),
}));