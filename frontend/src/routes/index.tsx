import { Routes, Route, Navigate } from 'react-router';
import LoginPage from '../pages/auth/LoginPage';
import DashboardLayout from '../components/layout/DashboardLayout';
import AdminOverview from '../pages/admin/Overview';
import StaffManagement from '../pages/admin/StaffManagement';
import AuditVault from '../pages/admin/AuditVault';
import DoctorDashboard from '../pages/DoctorDashboard';
import NurseDashboard from '../pages/NurseDashboard';
import { useAuthStore } from '../store/useAuthStore';

// Simple Auth Guard for real-world simulation
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      }>
        <Route index element={<Navigate to="/admin" replace />} />
        
        {/* Admin Section */}
        <Route path="admin">
          <Route index element={<AdminOverview />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="audit" element={<AuditVault />} />
        </Route>

        {/* Other Roles (For demo/extensibility) */}
        <Route path="doctor" element={<DoctorDashboard />} />
        <Route path="nurse" element={<NurseDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
