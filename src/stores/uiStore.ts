import { create } from 'zustand';
import { Role } from '../types';
import { persist } from 'zustand/middleware';

interface UIStore {
  role: Role;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  setRole: (r: Role) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      role: 'admin',
      theme: 'light',
      sidebarOpen: false,
      setRole: (r) => set({ role: r }),
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', next === 'dark');
        set({ theme: next });
      },
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
    }),
    { name: 'finance-ui-storage' }
  )
);
