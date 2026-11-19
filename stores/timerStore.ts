import { create } from 'zustand';

interface TimerState {
  pomodoroTime: number;
  isTimerRunning: boolean;
  timerMode: 'study' | 'break';
  questionStartTime: number;
  
  setPomodoroTime: (time: number) => void;
  setIsTimerRunning: (running: boolean) => void;
  setTimerMode: (mode: 'study' | 'break') => void;
  setQuestionStartTime: (time: number) => void;
}

export const useTimerStore = create<TimerState>()((set) => ({
  pomodoroTime: 25 * 60,
  isTimerRunning: false,
  timerMode: 'study',
  questionStartTime: Date.now(),

  setPomodoroTime: (pomodoroTime) => set({ pomodoroTime }),
  setIsTimerRunning: (isTimerRunning) => set({ isTimerRunning }),
  setTimerMode: (timerMode) => set({ timerMode }),
  setQuestionStartTime: (questionStartTime) => set({ questionStartTime }),
}));