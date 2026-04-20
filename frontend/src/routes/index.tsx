import { Routes, Route, Navigate } from 'react-router';
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import DashboardLayout from '../components/layout/DashboardLayout';
import AdminOverview from '../pages/admin/Overview';
import StaffManagement from '../pages/admin/StaffManagement';
import AuditVault from '../pages/admin/AuditVault';
import DoctorDashboard from '../pages/DoctorDashboard';
import NurseDashboard from '../pages/NurseDashboard';
import { useAuthStore } from '../store/useAuthStore';

type Role = string;

const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN: '/admin',
  ADMIN: '/admin',
  DOCTOR: '/doctor',
  NURSE: '/nurse',
  SECRETARY: '/nurse',
};

function getRoleHome(role: Role): string {
  return ROLE_HOME[role] || '/admin';
}

const ROLE_ACCESS: Record<string, string[]> = {
  SUPER_ADMIN: ['/admin', '/doctor', '/nurse'],
  ADMIN: ['/admin'],
  DOCTOR: ['/doctor'],
  NURSE: ['/nurse'],
  SECRETARY: ['/nurse'],
};

function canAccess(role: Role, path: string): boolean {
  const allowed = ROLE_ACCESS[role] || [];
  return allowed.some((prefix) => path.startsWith(prefix));
}

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const RoleGuard = ({ path, children }: { path: string; children: React.ReactNode }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (!canAccess(user.role, path)) return <Navigate to={getRoleHome(user.role)} replace />;
  return <>{children}</>;
};

const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }
  return <>{children}</>;
};

const DefaultRedirect = () => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getRoleHome(user.role)} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
      <Route path="/forgot-password" element={<GuestGuard><ForgotPasswordPage /></GuestGuard>} />
      <Route path="/reset-password" element={<GuestGuard><ResetPasswordPage /></GuestGuard>} />

      <Route path="/" element={<AuthGuard><DashboardLayout /></AuthGuard>}>
        <Route index element={<DefaultRedirect />} />

        <Route path="admin" element={<RoleGuard path="/admin"><AdminOverview /></RoleGuard>} />
        <Route path="admin/staff" element={<RoleGuard path="/admin"><StaffManagement /></RoleGuard>} />
        <Route path="admin/audit" element={<RoleGuard path="/admin"><AuditVault /></RoleGuard>} />

        <Route path="doctor" element={<RoleGuard path="/doctor"><DoctorDashboard /></RoleGuard>} />
        <Route path="nurse" element={<RoleGuard path="/nurse"><NurseDashboard /></RoleGuard>} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
