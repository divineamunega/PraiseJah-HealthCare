import { create } from 'zustand';

export type Role = 'ADMIN' | 'DOCTOR' | 'NURSE';

interface DashboardState {
  role: Role;
  activeTab: string;
  setRole: (role: Role) => void;
  setActiveTab: (tab: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  role: 'ADMIN', 
  activeTab: 'overview',
  setRole: (role) => set({ 
    role, 
    activeTab: 'overview' // Reset tab on role change
  }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
