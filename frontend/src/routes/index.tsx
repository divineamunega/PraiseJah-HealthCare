import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router";
import { Loader2 } from "lucide-react";

// Lazy load feature components
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/features/auth/pages/ResetPasswordPage"));
const ChangePasswordPage = lazy(() => import("@/features/auth/pages/ChangePasswordPage"));
const DashboardLayout = lazy(() => import("@/components/shared/layout/DashboardLayout"));
const AdminOverview = lazy(() => import("@/features/admin/pages/Overview"));
const StaffManagement = lazy(() => import("@/features/admin/pages/StaffManagement"));
const AuditVault = lazy(() => import("@/features/admin/pages/AuditVault"));
const PatientManagement = lazy(() => import("@/features/admin/pages/PatientManagement"));
const SystemSettings = lazy(() => import("@/features/admin/pages/SystemSettings"));
const DatabaseManagement = lazy(() => import("@/features/admin/pages/DatabaseManagement"));
const RolePermissions = lazy(() => import("@/features/admin/pages/RolePermissions"));
const DoctorDashboard = lazy(() => import("@/features/clinical/pages/DoctorDashboard"));
const EncounterWorkstation = lazy(() => import("@/features/clinical/pages/EncounterWorkstation"));
const NurseDashboard = lazy(() => import("@/features/clinical/pages/NurseDashboard"));
const SecretaryDashboard = lazy(() => import("@/features/clinical/pages/SecretaryDashboard"));
const PharmacyDashboard = lazy(() => import("@/features/clinical/pages/PharmacyDashboard"));
const PatientListPage = lazy(() => import("@/features/clinical/pages/PatientListPage"));
const PatientProfilePage = lazy(() => import("@/features/clinical/pages/PatientProfilePage"));

import { useAuthStore } from "@/features/auth/stores/auth.store";
import {
  AuthGuard,
  RoleGuard,
  GuestGuard,
  getRoleHome,
} from "@/features/auth/components/Guards";

const LoadingOverlay = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <Loader2 size={40} className="text-clinical-blue animate-spin" />
  </div>
);

const DefaultRedirect = () => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.status === "PENDING")
    return <Navigate to="/change-password" replace />;
  return <Navigate to={getRoleHome(user.role)} replace />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingOverlay />}>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestGuard>
              <ForgotPasswordPage />
            </GuestGuard>
          }
        />
        <Route
          path="/reset-password"
          element={
            <GuestGuard>
              <ResetPasswordPage />
            </GuestGuard>
          }
        />
        <Route
          path="/change-password"
          element={
            <AuthGuard>
              <ChangePasswordPage />
            </AuthGuard>
          }
        />

        <Route
          path="/"
          element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }
        >
          <Route index element={<DefaultRedirect />} />

          {/* Admin Routes */}
          <Route
            path="admin"
            element={
              <RoleGuard path="/admin">
                <AdminOverview />
              </RoleGuard>
            }
          />
          <Route
            path="admin/staff"
            element={
              <RoleGuard path="/admin">
                <StaffManagement />
              </RoleGuard>
            }
          />
          <Route
            path="admin/audit"
            element={
              <RoleGuard path="/admin">
                <AuditVault />
              </RoleGuard>
            }
          />
          <Route
            path="admin/patients"
            element={
              <RoleGuard path="/admin">
                <PatientManagement />
              </RoleGuard>
            }
          />
          <Route
            path="admin/settings"
            element={
              <RoleGuard path="/admin/settings">
                <SystemSettings />
              </RoleGuard>
            }
          />
          <Route
            path="admin/database"
            element={
              <RoleGuard path="/admin/database">
                <DatabaseManagement />
              </RoleGuard>
            }
          />
          <Route
            path="admin/permissions"
            element={
              <RoleGuard path="/admin/permissions">
                <RolePermissions />
              </RoleGuard>
            }
          />

          {/* Doctor Routes */}
          <Route
            path="doctor"
            element={
              <RoleGuard path="/doctor">
                <DoctorDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="doctor/encounter/:visitId"
            element={
              <RoleGuard path="/doctor">
                <EncounterWorkstation />
              </RoleGuard>
            }
          />
          <Route
            path="doctor/patients"
            element={
              <RoleGuard path="/doctor/patients">
                <PatientListPage />
              </RoleGuard>
            }
          />
          <Route
            path="doctor/patients/:id"
            element={
              <RoleGuard path="/doctor/patients">
                <PatientProfilePage />
              </RoleGuard>
            }
          />

          {/* Nurse Routes */}
          <Route
            path="nurse"
            element={
              <RoleGuard path="/nurse">
                <NurseDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="nurse/patients"
            element={
              <RoleGuard path="/nurse/patients">
                <PatientListPage />
              </RoleGuard>
            }
          />
          <Route
            path="nurse/patients/:id"
            element={
              <RoleGuard path="/nurse/patients">
                <PatientProfilePage />
              </RoleGuard>
            }
          />

          {/* Secretary Routes */}
          <Route
            path="secretary"
            element={
              <RoleGuard path="/secretary">
                <SecretaryDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="secretary/patients"
            element={
              <RoleGuard path="/secretary/patients">
                <PatientListPage />
              </RoleGuard>
            }
          />
          <Route
            path="secretary/patients/:id"
            element={
              <RoleGuard path="/secretary/patients">
                <PatientProfilePage />
              </RoleGuard>
            }
          />

          {/* Pharmacy Routes */}
          <Route
            path="pharmacy"
            element={
              <RoleGuard path="/pharmacy">
                <PharmacyDashboard />
              </RoleGuard>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
