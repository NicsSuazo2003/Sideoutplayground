import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import * as authService from '../services/authService';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { token, user } = await authService.login(email, password);
          set({ token, user, isAuthenticated: true, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const { token, user } = await authService.register(data);
          set({ token, user, isAuthenticated: true, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },

      updateProfile: async (data) => {
        const userId = get().user?.id;
        if (!userId) return;
        const updated = await authService.updateProfile(userId, data);
        set({ user: updated });
      },
    }),
    { name: 'auth-storage' }
  )
);
