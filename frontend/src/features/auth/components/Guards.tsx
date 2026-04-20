import React from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '../stores/auth.store';

type Role = string;

export const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN: '/admin',
  ADMIN: '/admin',
  DOCTOR: '/doctor',
  NURSE: '/nurse',
  SECRETARY: '/secretary',
};

export function getRoleHome(role: Role): string {
  return ROLE_HOME[role] || '/admin';
}

const ROLE_ACCESS: Record<string, string[]> = {
  SUPER_ADMIN: ['/admin', '/doctor', '/nurse', '/secretary'],
  ADMIN: ['/admin', '/doctor', '/nurse', '/secretary'],
  DOCTOR: ['/doctor'],
  NURSE: ['/nurse'],
  SECRETARY: ['/secretary'],
};

export function canAccess(role: Role, path: string): boolean {
  const allowed = ROLE_ACCESS[role] || [];
  return allowed.some((prefix) => path.startsWith(prefix));
}

const SUPER_ADMIN_ONLY_PATHS = ['/admin/settings', '/admin/database', '/admin/permissions'];

export function isSuperAdminOnly(path: string): boolean {
  return SUPER_ADMIN_ONLY_PATHS.some((prefix) => path.startsWith(prefix));
}

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
  </div>
);

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export const RoleGuard = ({ path, children }: { path: string; children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (isSuperAdminOnly(path) && user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (!canAccess(user.role, path)) return <Navigate to={getRoleHome(user.role)} replace />;
  return <>{children}</>;
};

export const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }
  return <>{children}</>;
};
