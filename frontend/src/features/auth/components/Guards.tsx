import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "../stores/auth.store";

type Role = string;

export const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN: "/admin",
  ADMIN: "/admin",
  DOCTOR: "/doctor",
  NURSE: "/nurse",
  SECRETARY: "/secretary",
  LAB_SCIENTIST: "/lab",
  PHARMACIST: "/pharmacy",
};

export function getRoleHome(role: Role): string {
  return ROLE_HOME[role] || "/admin";
}

const ROLE_ACCESS: Record<string, string[]> = {
  SUPER_ADMIN: [
    "/admin",
    "/doctor",
    "/nurse",
    "/secretary",
    "/lab",
    "/pharmacy",
  ],
  ADMIN: ["/admin", "/doctor", "/nurse", "/secretary", "/lab", "/pharmacy"],
  DOCTOR: ["/doctor"],
  NURSE: ["/nurse"],
  SECRETARY: ["/secretary"],
  LAB_SCIENTIST: ["/lab"],
  PHARMACIST: ["/pharmacy"],
};

export function canAccess(role: Role, path: string): boolean {
  const allowed = ROLE_ACCESS[role] || [];
  return allowed.some((prefix) => path.startsWith(prefix));
}

const SUPER_ADMIN_ONLY_PATHS = [
  "/admin/settings",
  "/admin/database",
  "/admin/permissions",
];

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
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect PENDING users to change-password if they aren't already there
  if (user?.status === "PENDING" && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  // Prevent ACTIVE users from going to change-password
  if (user?.status === "ACTIVE" && location.pathname === "/change-password") {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return <>{children}</>;
};

export const RoleGuard = ({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.status === "PENDING")
    return <Navigate to="/change-password" replace />;

  if (isSuperAdminOnly(path) && user.role !== "SUPER_ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  if (!canAccess(user.role, path))
    return <Navigate to={getRoleHome(user.role)} replace />;
  return <>{children}</>;
};

export const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated && user) {
    if (user.status === "PENDING")
      return <Navigate to="/change-password" replace />;
    return <Navigate to={getRoleHome(user.role)} replace />;
  }
  return <>{children}</>;
};
