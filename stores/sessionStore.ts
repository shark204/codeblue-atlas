// stores/sessionStore.ts
import { create, type StoreApi, type UseBoundStore } from 'zustand';
import type { Question } from '../lib/helpers';
import type { PanelId } from './uiStore';

type SessionSource = 'dashboard' | 'review_gallery' | 'smart_review';
type Updater<T> = T | ((prev: T) => T);

interface SessionState {
  sessionQuestions: Question[];
  currentIndex: number;
  sessionAnswers: { [key: number]: string };
  sessionSource: SessionSource;
  hasSavedSession: boolean;

  reviewQuestions: Question[];
  reviewTitle: string;
  searchQuery: string;

  // ✅ NEW: in-session mistake repetition toggle
  repeatIncorrect: boolean;

  setSessionQuestions: (q: Updater<Question[]>) => void;
  setCurrentIndex: (i: number) => void;
  setSessionAnswers: (a: Updater<{ [key: number]: string }>) => void;
  setSessionSource: (s: SessionSource) => void;
  setHasSavedSession: (b: boolean) => void;

  setReviewQuestions: (q: Updater<Question[]>) => void;
  setReviewTitle: (t: string) => void;
  setSearchQuery: (q: string) => void;

  // ✅ NEW
  setRepeatIncorrect: (b: boolean) => void;

  resetSession: () => void;
}

const initialSession = {
  sessionQuestions: [] as Question[],
  currentIndex: 0,
  sessionAnswers: {} as { [key: number]: string },
  sessionSource: 'dashboard' as SessionSource,
  hasSavedSession: false,
  reviewQuestions: [] as Question[],
  reviewTitle: '',
  searchQuery: '',
  repeatIncorrect: true,   // ✅ default: enabled
};

// ✅ helper: يضمن إن القيمة array دايمًا
function ensureArray<T>(value: any): T[] {
  return Array.isArray(value) ? value : [];
}

function createSessionStoreInstance() {
  return create<SessionState>((set) => ({
    ...initialSession,

    setSessionQuestions: (updater) => set((state) => {
      const current = ensureArray<Question>(state.sessionQuestions);
      const next = typeof updater === 'function' ? (updater as (p: Question[]) => Question[])(current) : updater;
      return { sessionQuestions: ensureArray<Question>(next) };
    }),
    setCurrentIndex: (currentIndex) => set({ currentIndex }),
    setSessionAnswers: (updater) => set((state) => {
      const current = state.sessionAnswers && typeof state.sessionAnswers === 'object' ? state.sessionAnswers : {};
      const next = typeof updater === 'function' ? (updater as (p: SessionState['sessionAnswers']) => SessionState['sessionAnswers'])(current) : updater;
      return { sessionAnswers: next && typeof next === 'object' ? next : {} };
    }),
    setSessionSource: (sessionSource) => set({ sessionSource }),
    setHasSavedSession: (hasSavedSession) => set({ hasSavedSession }),

    setReviewQuestions: (updater) => set((state) => {
      const current = ensureArray<Question>(state.reviewQuestions);
      const next = typeof updater === 'function' ? (updater as (p: Question[]) => Question[]) : updater;
      return { reviewQuestions: ensureArray<Question>(next) };
    }),
    setReviewTitle: (reviewTitle) => set({ reviewTitle: reviewTitle ?? '' }),
    setSearchQuery: (searchQuery) => set({ searchQuery: searchQuery ?? '' }),

    // ✅ NEW
    setRepeatIncorrect: (repeatIncorrect) => set({ repeatIncorrect: Boolean(repeatIncorrect) }),

    resetSession: () => set(initialSession),
  }));
}

// ═══════════════════════════════════════════════════════
// ✅ Registry — كل بانل ليه Session Store لوحده
// ═══════════════════════════════════════════════════════
const sessionStoreRegistry = new Map<PanelId, UseBoundStore<StoreApi<SessionState>>>();

function getSessionStoreInstance(panelId: PanelId) {
  let store = sessionStoreRegistry.get(panelId);
  if (!store) {
    store = createSessionStoreInstance();
    sessionStoreRegistry.set(panelId, store);
  }
  return store;
}

export function useSessionStore<T>(panelId: PanelId, selector: (s: SessionState) => T): T {
  return getSessionStoreInstance(panelId)(selector);
}

export function getSessionStoreState(panelId: PanelId): SessionState {
  return getSessionStoreInstance(panelId).getState();
}

export function resetSessionStore(panelId: PanelId) {
  getSessionStoreInstance(panelId).getState().resetSession();
}

export function resetAllSessionStores() {
  sessionStoreRegistry.forEach((store) => store.getState().resetSession());
}

export type { SessionState, SessionSource };