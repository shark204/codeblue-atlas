// stores/examStore.ts
import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { Question } from '../lib/helpers';
import type { PanelId } from './uiStore';

type Updater<T> = T | ((prev: T) => T);

export type ExamMode = 'mrcs_abs' | 'mrcs_psg' | 'undergrad_custom' | null;

interface ExamState {
  examQuestions: Question[];
  currentExamIndex: number;
  examAnswers: { [key: number]: string };
  examReviewFlags: number[];
  isExamSubmitted: boolean;
  examEndTime: number | null;
  timeLeft: number;
  isExamActive: boolean;
  randomQuote: string;
  showExamSetup: boolean;
  customQuestionCount: number;
  customDurationMinutes: number;
  customCategory: string;
  customDifficulty: number | 'All';
  examMode: ExamMode;

  // ✅ NEW — Realistic Exam Mode
  examFontMode: boolean;
  setExamFontMode: (v: boolean) => void;

  undergradExamYear: number;
  undergradExamSemester: number;
  undergradExamSubject: string;

  setExamQuestions: (q: Updater<Question[]>) => void;
  setCurrentExamIndex: (i: number) => void;
  setExamAnswers: (a: Updater<{ [key: number]: string }>) => void;
  setExamReviewFlags: (f: Updater<number[]>) => void;
  setIsExamSubmitted: (b: boolean) => void;
  setExamEndTime: (t: number | null) => void;
  setTimeLeft: (t: number) => void;
  setIsExamActive: (b: boolean) => void;
  setRandomQuote: (q: string) => void;
  setShowExamSetup: (b: boolean) => void;
  setCustomQuestionCount: (n: number) => void;
  setCustomDurationMinutes: (n: number) => void;
  setCustomCategory: (c: string) => void;
  setCustomDifficulty: (d: number | 'All') => void;
  setExamMode: (m: ExamMode) => void;
  setUndergradExamYear: (y: number) => void;
  setUndergradExamSemester: (s: number) => void;
  setUndergradExamSubject: (s: string) => void;
  resetExam: () => void;
}

const initial = {
  examQuestions: [] as Question[],
  currentExamIndex: 0,
  examAnswers: {} as { [key: number]: string },
  examReviewFlags: [] as number[],
  isExamSubmitted: false,
  examEndTime: null as number | null,
  timeLeft: 3600,
  isExamActive: false,
  randomQuote: '',
  showExamSetup: false,
  customQuestionCount: 60,
  customDurationMinutes: 60,
  customCategory: 'All',
  customDifficulty: 'All' as number | 'All',
  examMode: null as ExamMode,

  // ✅ NEW
  examFontMode: false,

  undergradExamYear: 1,
  undergradExamSemester: 1,
  undergradExamSubject: 'All',
};

// ═══════════════════════════════════════════════════════
// ✅ مصنع Store — نسخة مستقلة بالكامل من exam state
// ═══════════════════════════════════════════════════════
function createExamStoreInstance() {
  return create<ExamState>((set) => ({
    ...initial,

    setExamQuestions: (updater) => set((state) => ({
      examQuestions: typeof updater === 'function' ? (updater as (p: Question[]) => Question[])(state.examQuestions) : updater,
    })),
    setCurrentExamIndex: (currentExamIndex) => set({ currentExamIndex }),
    setExamAnswers: (updater) => set((state) => ({
      examAnswers: typeof updater === 'function' ? (updater as (p: ExamState['examAnswers']) => ExamState['examAnswers'])(state.examAnswers) : updater,
    })),
    setExamReviewFlags: (updater) => set((state) => ({
      examReviewFlags: typeof updater === 'function' ? (updater as (p: number[]) => number[])(state.examReviewFlags) : updater,
    })),
    setIsExamSubmitted: (isExamSubmitted) => set({ isExamSubmitted }),
    setExamEndTime: (examEndTime) => set({ examEndTime }),
    setTimeLeft: (timeLeft) => set({ timeLeft }),
    setIsExamActive: (isExamActive) => set({ isExamActive }),
    setRandomQuote: (randomQuote) => set({ randomQuote }),
    setShowExamSetup: (showExamSetup) => set({ showExamSetup }),
    setCustomQuestionCount: (customQuestionCount) => set({ customQuestionCount }),
    setCustomDurationMinutes: (customDurationMinutes) => set({ customDurationMinutes }),
    setCustomCategory: (customCategory) => set({ customCategory }),
    setCustomDifficulty: (customDifficulty) => set({ customDifficulty }),
    setExamMode: (examMode) => set({ examMode }),

    // ✅ NEW
    setExamFontMode: (examFontMode) => {
      set({ examFontMode });
      try { localStorage.setItem('cb:exam-font-mode', examFontMode ? '1' : '0'); } catch {}
    },

    setUndergradExamYear: (undergradExamYear) => set({ undergradExamYear }),
    setUndergradExamSemester: (undergradExamSemester) => set({ undergradExamSemester }),
    setUndergradExamSubject: (undergradExamSubject) => set({ undergradExamSubject }),

    resetExam: () => set((s) => ({ ...initial, examFontMode: s.examFontMode })),
  }));
}

// ═══════════════════════════════════════════════════════
// ✅ Registry — كل بانل ليه Exam Store لوحده
// ═══════════════════════════════════════════════════════
const examStoreRegistry = new Map<PanelId, UseBoundStore<StoreApi<ExamState>>>();

function getExamStoreInstance(panelId: PanelId) {
  let store = examStoreRegistry.get(panelId);
  if (!store) {
    store = createExamStoreInstance();

    // ✅ Restore persisted font mode on first creation
    try {
      const saved = localStorage.getItem('cb:exam-font-mode');
      if (saved === '1') store.getState().setExamFontMode(true);
    } catch {}

    examStoreRegistry.set(panelId, store);
  }
  return store;
}

export function useExamStore<T>(panelId: PanelId, selector: (s: ExamState) => T): T {
  return getExamStoreInstance(panelId)(selector);
}

export function getExamStoreState(panelId: PanelId): ExamState {
  return getExamStoreInstance(panelId).getState();
}

export function resetExamStore(panelId: PanelId) {
  getExamStoreInstance(panelId).getState().resetExam();
}

export function resetAllExamStores() {
  examStoreRegistry.forEach((store) => store.getState().resetExam());
}

export type { ExamState };