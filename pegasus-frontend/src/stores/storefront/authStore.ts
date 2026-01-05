import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: () => boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useStorefrontAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: () => {
        const state = get();
        return !!(state.token && state.user);
      },
      setAuth: (user, token) => {
        set({ user, token });
        localStorage.setItem('storefront-token', token);
      },
      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('storefront-token');
      },
    }),
    {
      name: 'storefront-auth-storage',
    }
  )
);
