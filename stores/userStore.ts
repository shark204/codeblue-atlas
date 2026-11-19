// stores/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  session: any | null;
  user: any | null;
  isAdmin: boolean;
  setUser: (session: any, user: any) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      isAdmin: false,
      setUser: (session, user) => set({ 
        session, 
        user, 
        isAdmin: user?.user_metadata?.role === 'admin' || user?.email?.endsWith('@admin.com') 
      }),
      clearUser: () => set({ session: null, user: null, isAdmin: false }),
    }),
    { name: 'codeblue-user' }
  )
);