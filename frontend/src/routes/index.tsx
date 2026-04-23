import { Routes, Route, Navigate } from 'react-router';
import LoginPage from '@/features/auth/pages/LoginPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import ChangePasswordPage from '@/features/auth/pages/ChangePasswordPage';
import DashboardLayout from '@/components/shared/layout/DashboardLayout';
import AdminOverview from '@/features/admin/pages/Overview';
import StaffManagement from '@/features/admin/pages/StaffManagement';
import AuditVault from '@/features/admin/pages/AuditVault';
import PatientManagement from '@/features/admin/pages/PatientManagement';
import SystemSettings from '@/features/admin/pages/SystemSettings';
import DatabaseManagement from '@/features/admin/pages/DatabaseManagement';
import RolePermissions from '@/features/admin/pages/RolePermissions';
import DoctorDashboard from '@/features/clinical/pages/DoctorDashboard';
import NurseDashboard from '@/features/clinical/pages/NurseDashboard';
import SecretaryDashboard from '@/features/clinical/pages/SecretaryDashboard';
import PatientListPage from '@/features/clinical/pages/PatientListPage';

import { useAuthStore } from '@/features/auth/stores/auth.store';
import { AuthGuard, RoleGuard, GuestGuard, getRoleHome } from '@/features/auth/components/Guards';

const DefaultRedirect = () => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.status === 'PENDING') return <Navigate to="/change-password" replace />;
  return <Navigate to={getRoleHome(user.role)} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
      <Route path="/forgot-password" element={<GuestGuard><ForgotPasswordPage /></GuestGuard>} />
      <Route path="/reset-password" element={<GuestGuard><ResetPasswordPage /></GuestGuard>} />
      <Route path="/change-password" element={<AuthGuard><ChangePasswordPage /></AuthGuard>} />

      <Route path="/" element={<AuthGuard><DashboardLayout /></AuthGuard>}>
        <Route index element={<DefaultRedirect />} />
...
        {/* Admin Routes */}
        <Route path="admin" element={<RoleGuard path="/admin"><AdminOverview /></RoleGuard>} />
        <Route path="admin/staff" element={<RoleGuard path="/admin"><StaffManagement /></RoleGuard>} />
        <Route path="admin/audit" element={<RoleGuard path="/admin"><AuditVault /></RoleGuard>} />
        <Route path="admin/patients" element={<RoleGuard path="/admin"><PatientManagement /></RoleGuard>} />
        
        {/* SUPER_ADMIN Only Routes */}
        <Route path="admin/settings" element={<RoleGuard path="/admin/settings"><SystemSettings /></RoleGuard>} />
        <Route path="admin/database" element={<RoleGuard path="/admin/database"><DatabaseManagement /></RoleGuard>} />
        <Route path="admin/permissions" element={<RoleGuard path="/admin/permissions"><RolePermissions /></RoleGuard>} />

        {/* Doctor Routes */}
        <Route path="doctor" element={<RoleGuard path="/doctor"><DoctorDashboard /></RoleGuard>} />

        {/* Nurse Routes */}
        <Route path="nurse" element={<RoleGuard path="/nurse"><NurseDashboard /></RoleGuard>} />
        <Route path="nurse/patients" element={<RoleGuard path="/nurse"><PatientListPage /></RoleGuard>} />

        {/* Secretary Routes */}
        <Route path="secretary" element={<RoleGuard path="/secretary"><SecretaryDashboard /></RoleGuard>} />
        <Route path="secretary/patients" element={<RoleGuard path="/secretary"><PatientListPage /></RoleGuard>} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
