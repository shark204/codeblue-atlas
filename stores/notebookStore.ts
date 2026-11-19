import { create } from 'zustand';

interface NotebookState {
  dueSrQuestions: any[];
  notebookQuestions: any[];
  currentNoteInput: { [key: number]: string };

  setDueSrQuestions: (q: any[]) => void;
  setNotebookQuestions: (q: any[]) => void;
  setCurrentNoteInput: (input: any) => void;
}

export const useNotebookStore = create<NotebookState>()((set) => ({
  dueSrQuestions: [],
  notebookQuestions: [],
  currentNoteInput: {},

  setDueSrQuestions: (dueSrQuestions) => set({ dueSrQuestions }),
  setNotebookQuestions: (notebookQuestions) => set({ notebookQuestions }),
  setCurrentNoteInput: (currentNoteInput) => set({ currentNoteInput }),
}));