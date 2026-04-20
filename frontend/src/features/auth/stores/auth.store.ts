import { create } from 'zustand';
import type { AuthUser } from '../api/auth.api';

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (user) =>
    set({
      isAuthenticated: true,
      user,
    }),
  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
    }),
}));
