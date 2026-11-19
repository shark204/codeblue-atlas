import { create } from 'zustand';

interface FlashcardsState {
  flashcardsList: any[];
  fcIndex: number;
  fcFlipped: boolean;
  setFlashcardsList: (list: any[]) => void;
  setFcIndex: (idx: number) => void;
  setFcFlipped: (flipped: boolean) => void;
}

export const useFlashcardsStore = create<FlashcardsState>()((set) => ({
  flashcardsList: [],
  fcIndex: 0,
  fcFlipped: false,
  setFlashcardsList: (flashcardsList) => set({ flashcardsList }),
  setFcIndex: (fcIndex) => set({ fcIndex }),
  setFcFlipped: (fcFlipped) => set({ fcFlipped }),
}));