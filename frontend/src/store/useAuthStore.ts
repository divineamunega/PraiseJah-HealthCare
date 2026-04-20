import { create } from 'zustand';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'DOCTOR' | 'NURSE';
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (email) => {
    // Demo: auto-assign admin role for any login
    set({
      isAuthenticated: true,
      user: {
        id: 'USR-001',
        email,
        firstName: 'Demo',
        lastName: 'Admin',
        role: 'ADMIN'
      }
    });
  },
  logout: () => set({ isAuthenticated: false, user: null }),
}));
