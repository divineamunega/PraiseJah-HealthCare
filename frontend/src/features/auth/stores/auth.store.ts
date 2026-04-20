import { create } from 'zustand';
import type { AuthUser } from '../api/auth.api';

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  login: (user) =>
    set({
      isAuthenticated: true,
      user,
      isLoading: false,
    }),
  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    }),
  setUser: (user) =>
    set({
      user,
    }),
  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),
}));
