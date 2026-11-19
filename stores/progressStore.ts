// stores/progressStore.ts
import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { PanelId } from './uiStore';

type AnswerChanges = {
  correctToIncorrect: number;
  incorrectToCorrect: number;
  incorrectToIncorrect: number;
};

type Updater<T> = T | ((prev: T) => T);

interface ProgressState {
  score: { correct: number; wrong: number; total: number };
  incorrectIds: number[];
  flaggedIds: number[];
  userNotes: { [key: number]: string };
  srData: { [key: number]: { step: number; nextReview: number } };
  examDate: string;
  streak: number;
  answerChanges: AnswerChanges;

  setScore: (s: Updater<ProgressState['score']>) => void;
  setIncorrectIds: (ids: Updater<number[]>) => void;
  setFlaggedIds: (ids: Updater<number[]>) => void;
  setUserNotes: (n: Updater<ProgressState['userNotes']>) => void;
  setSrData: (d: Updater<ProgressState['srData']>) => void;
  setExamDate: (d: string) => void;
  setStreak: (n: number) => void;
  setAnswerChanges: (c: Updater<AnswerChanges>) => void;
  reset: () => void;
}

const initial = {
  score: { correct: 0, wrong: 0, total: 0 },
  incorrectIds: [] as number[],
  flaggedIds: [] as number[],
  userNotes: {} as { [k: number]: string },
  srData: {} as { [k: number]: { step: number; nextReview: number } },
  examDate: '',
  streak: 0,
  answerChanges: { correctToIncorrect: 0, incorrectToCorrect: 0, incorrectToIncorrect: 0 },
};

// ═══════════════════════════════════════════════════════
// ✅ مصنع Store — بيعمل نسخة مستقلة بالكامل من الـ state
// ═══════════════════════════════════════════════════════
function createProgressStoreInstance() {
  return create<ProgressState>((set) => ({
    ...initial,

    setScore: (updater) => set((state) => ({
      score: typeof updater === 'function' ? (updater as (p: ProgressState['score']) => ProgressState['score'])(state.score) : updater,
    })),
    setIncorrectIds: (updater) => set((state) => ({
      incorrectIds: typeof updater === 'function' ? (updater as (p: number[]) => number[])(state.incorrectIds) : updater,
    })),
    setFlaggedIds: (updater) => set((state) => ({
      flaggedIds: typeof updater === 'function' ? (updater as (p: number[]) => number[])(state.flaggedIds) : updater,
    })),
    setUserNotes: (updater) => set((state) => ({
      userNotes: typeof updater === 'function' ? (updater as (p: ProgressState['userNotes']) => ProgressState['userNotes'])(state.userNotes) : updater,
    })),
    setSrData: (updater) => set((state) => ({
      srData: typeof updater === 'function' ? (updater as (p: ProgressState['srData']) => ProgressState['srData'])(state.srData) : updater,
    })),
    setExamDate: (examDate) => set({ examDate }),
    setStreak: (streak) => set({ streak }),
    setAnswerChanges: (updater) => set((state) => ({
      answerChanges: typeof updater === 'function' ? (updater as (p: AnswerChanges) => AnswerChanges)(state.answerChanges) : updater,
    })),

    reset: () => set(initial),
  }));
}

// ═══════════════════════════════════════════════════════
// ✅ Registry — كل بانل ليه Store لوحده، بيتعمل مرة واحدة بس (lazy init)
// ═══════════════════════════════════════════════════════
const progressStoreRegistry = new Map<PanelId, UseBoundStore<StoreApi<ProgressState>>>();

function getProgressStoreInstance(panelId: PanelId) {
  let store = progressStoreRegistry.get(panelId);
  if (!store) {
    store = createProgressStoreInstance();
    progressStoreRegistry.set(panelId, store);
  }
  return store;
}

// ✅ Hook للاستخدام جوا الكومبوننتس — لازم تبعتله panelId دايمًا
export function useProgressStore<T>(panelId: PanelId, selector: (s: ProgressState) => T): T {
  return getProgressStoreInstance(panelId)(selector);
}

// ✅ للاستخدام الـ imperative (زي .getState() جوا callbacks/timers)
export function getProgressStoreState(panelId: PanelId): ProgressState {
  return getProgressStoreInstance(panelId).getState();
}

// ✅ تصفير بانل واحد بس
export function resetProgressStore(panelId: PanelId) {
  getProgressStoreInstance(panelId).getState().reset();
}

// ✅ تصفير كل البانلز مرة واحدة
export function resetAllProgressStores() {
  progressStoreRegistry.forEach((store) => store.getState().reset());
}

export type { ProgressState, AnswerChanges };