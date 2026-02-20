import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from '@/types';

interface UIState {
  theme: Theme;
  sidebarCollapsed: boolean;
  sidebarOpen: boolean; // mobile

  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  applyTheme: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      sidebarCollapsed: false,
      sidebarOpen: false,

      setTheme: (theme) => {
        set({ theme });
        get().applyTheme();
      },

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      applyTheme: () => {
        const { theme } = get();
        const root = document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
        } else if (theme === 'light') {
          root.classList.remove('dark');
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.classList.toggle('dark', prefersDark);
        }
      },
    }),
    {
      name: 'intizom-ui',
      partialize: (state) => ({ theme: state.theme, sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);
