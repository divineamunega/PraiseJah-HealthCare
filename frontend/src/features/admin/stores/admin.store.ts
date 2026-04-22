import { create } from 'zustand';

export type PatientStatus = 'CRITICAL' | 'STABLE' | 'WAITING';

export interface Patient {
  id: string;
  name: string;
  status: PatientStatus;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
}

interface AdminState {
  patients: Patient[];
  logs: AuditLog[];
  
  // Actions
  // In a real app, these would also be TanStack Query hooks or separate stores
  setLogs: (logs: AuditLog[]) => void;
  
  // Derived Helpers (used in components)
  getMetrics: (activeUsersCount: number, totalUsersCount: number, suspendedUsersCount: number) => {
    totalStaff: number;
    activeUsers: number;
    suspendedUsers: number;
    criticalPatients: number;
  };
}

const INITIAL_PATIENTS: Patient[] = [
  { id: 'PX-2042', name: 'Jonathan Harker', status: 'STABLE' },
  { id: 'PX-2044', name: 'Arthur Holmwood', status: 'CRITICAL' },
  { id: 'PX-2045', name: 'Quincey Morris', status: 'WAITING' },
  { id: 'PX-2048', name: 'Lucy Westenra', status: 'CRITICAL' },
  { id: 'PX-2050', name: 'Renfield S.', status: 'WAITING' },
];

export const useAdminStore = create<AdminState>((set, get) => ({
  patients: INITIAL_PATIENTS,
  logs: [
    { id: 'LOG-001', actor: 'System', action: 'SYSTEM_BOOT', target: 'Environment', timestamp: new Date().toISOString() }
  ],

  setLogs: (logs) => set({ logs }),

  getMetrics: (activeUsersCount, totalUsersCount, suspendedUsersCount) => {
    const { patients } = get();
    return {
      totalStaff: totalUsersCount,
      activeUsers: activeUsersCount,
      suspendedUsers: suspendedUsersCount,
      criticalPatients: patients.filter((p) => p.status === 'CRITICAL').length,
    };
  },
}));
