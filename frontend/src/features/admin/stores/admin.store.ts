import { create } from 'zustand';

export type UserRole = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'SECRETARY';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type PatientStatus = 'CRITICAL' | 'STABLE' | 'WAITING';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
}

export interface Patient {
  id: string;
  name: string;
  status: PatientStatus;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: 'USER_CREATED' | 'USER_SUSPENDED' | 'USER_ACTIVATED';
  target: string;
  timestamp: string;
}

interface AdminState {
  users: User[];
  patients: Patient[];
  logs: AuditLog[];
  
  // Actions
  addUser: (user: Omit<User, 'id' | 'status' | 'lastLogin'>) => void;
  toggleUserStatus: (userId: string) => void;
  
  // Derived Helpers (used in components)
  getMetrics: () => {
    totalStaff: number;
    activeUsers: number;
    suspendedUsers: number;
    criticalPatients: number;
  };
}

const INITIAL_USERS: User[] = [
  { id: 'USR-001', email: 'admin@praisejah.com', firstName: 'Demo', lastName: 'Admin', role: 'ADMIN', status: 'ACTIVE', lastLogin: '2026-04-18 08:30' },
  { id: 'USR-002', email: 'sarah.j@praisejah.com', firstName: 'Sarah', lastName: 'Johnson', role: 'DOCTOR', status: 'ACTIVE', lastLogin: '2026-04-18 09:15' },
  { id: 'USR-003', email: 'b.king@praisejah.com', firstName: 'Brenda', lastName: 'King', role: 'NURSE', status: 'ACTIVE', lastLogin: '2026-04-17 14:20' },
  { id: 'USR-004', email: 'l.spaceman@praisejah.com', firstName: 'Leo', lastName: 'Spaceman', role: 'DOCTOR', status: 'SUSPENDED', lastLogin: '2026-04-10 11:00' },
];

const INITIAL_PATIENTS: Patient[] = [
  { id: 'PX-2042', name: 'Jonathan Harker', status: 'STABLE' },
  { id: 'PX-2044', name: 'Arthur Holmwood', status: 'CRITICAL' },
  { id: 'PX-2045', name: 'Quincey Morris', status: 'WAITING' },
  { id: 'PX-2048', name: 'Lucy Westenra', status: 'CRITICAL' },
  { id: 'PX-2050', name: 'Renfield S.', status: 'WAITING' },
];

export const useAdminStore = create<AdminState>((set, get) => ({
  users: INITIAL_USERS,
  patients: INITIAL_PATIENTS,
  logs: [
    { id: 'LOG-001', actor: 'System', action: 'USER_ACTIVATED', target: 'Demo Admin', timestamp: new Date().toISOString() }
  ],

  addUser: (userData) => {
    const newUser: User = {
      ...userData,
      id: `USR-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      status: 'ACTIVE',
      lastLogin: 'Never',
    };

    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      actor: 'Demo Admin', // Simulated current user
      action: 'USER_CREATED',
      target: `${newUser.firstName} ${newUser.lastName}`,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      users: [newUser, ...state.users],
      logs: [newLog, ...state.logs],
    }));
  },

  toggleUserStatus: (userId) => {
    set((state) => {
      const userIndex = state.users.findIndex((u) => u.id === userId);
      if (userIndex === -1) return state;

      const user = state.users[userIndex];
      const newStatus: UserStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      const action = newStatus === 'ACTIVE' ? 'USER_ACTIVATED' : 'USER_SUSPENDED';

      const updatedUsers = [...state.users];
      updatedUsers[userIndex] = { ...user, status: newStatus };

      const newLog: AuditLog = {
        id: crypto.randomUUID(),
        actor: 'Demo Admin',
        action,
        target: `${user.firstName} ${user.lastName}`,
        timestamp: new Date().toISOString(),
      };

      return {
        users: updatedUsers,
        logs: [newLog, ...state.logs],
      };
    });
  },

  getMetrics: () => {
    const { users, patients } = get();
    return {
      totalStaff: users.length,
      activeUsers: users.filter((u) => u.status === 'ACTIVE').length,
      suspendedUsers: users.filter((u) => u.status === 'SUSPENDED').length,
      criticalPatients: patients.filter((p) => p.status === 'CRITICAL').length,
    };
  },
}));
