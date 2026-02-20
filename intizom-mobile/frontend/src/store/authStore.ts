import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Computed helpers
  isAdmin: () => boolean;
  isTrialExpired: () => boolean;
  daysLeftTrial: () => number;

  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      isAdmin: () => get().user?.role === 'ADMIN',

      isTrialExpired: () => {
        const user = get().user;
        if (!user || user.subscriptionStatus !== 'TRIAL') return false;
        return new Date(user.trialEndDate) < new Date();
      },

      daysLeftTrial: () => {
        const user = get().user;
        if (!user?.trialEndDate) return 0;
        const diff = new Date(user.trialEndDate).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      },

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      login: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'intizom-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
