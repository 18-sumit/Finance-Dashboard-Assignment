import { create } from 'zustand';
import { Role } from '../types';
import { persist } from 'zustand/middleware';

interface UIStore {
  role: Role;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;        // mobile drawer
  sidebarCollapsed: boolean;   // desktop collapsed (icon-only) mode
  setRole: (r: Role) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      role: 'admin',
      theme: 'light',
      sidebarOpen: false,
      sidebarCollapsed: false,
      setRole: (r) => set({ role: r }),
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', next === 'dark');
        set({ theme: next });
      },
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    { name: 'finance-ui-storage' }
  )
);
