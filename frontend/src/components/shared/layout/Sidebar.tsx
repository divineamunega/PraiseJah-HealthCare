import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
  UserCheck,
  Database,
  FileText,
  Calendar,
  Activity,
  Thermometer,
  ClipboardList,
  UserPlus,
  HardDrive,
  Lock,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'framer-motion';

interface NavItem {
  id: string;
  path: string;
  icon: any;
  label: string;
  roles: string[];
}

const navItems: NavItem[] = [
  // Admin Routes
  { id: 'admin_overview', path: '/admin', icon: LayoutDashboard, label: 'Dashboard', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { id: 'staff', path: '/admin/staff', icon: UserCheck, label: 'Staff Management', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { id: 'patients', path: '/admin/patients', icon: Database, label: 'Patient Registry', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { id: 'audit', path: '/admin/audit', icon: ShieldCheck, label: 'Security Audit', roles: ['SUPER_ADMIN', 'ADMIN'] },
  
  // SUPER_ADMIN Only Routes
  { id: 'settings', path: '/admin/settings', icon: Settings, label: 'System Settings', roles: ['SUPER_ADMIN'] },
  { id: 'database', path: '/admin/database', icon: HardDrive, label: 'Database Management', roles: ['SUPER_ADMIN'] },
  { id: 'permissions', path: '/admin/permissions', icon: Lock, label: 'Role Permissions', roles: ['SUPER_ADMIN'] },

  // Doctor Routes
  { id: 'doctor_dash', path: '/doctor', icon: LayoutDashboard, label: 'Clinical Cockpit', roles: ['DOCTOR'] },
  { id: 'doctor_patients', path: '/doctor/patients', icon: Users, label: 'My Patients', roles: ['DOCTOR'] },
  { id: 'doctor_notes', path: '/doctor/notes', icon: FileText, label: 'Clinical Notes', roles: ['DOCTOR'] },
  { id: 'doctor_prescriptions', path: '/doctor/prescriptions', icon: Activity, label: 'Prescriptions', roles: ['DOCTOR'] },

  // Nurse Routes
  { id: 'nurse_dash', path: '/nurse', icon: LayoutDashboard, label: 'Triage Station', roles: ['NURSE', 'SECRETARY'] },
  { id: 'nurse_queue', path: '/nurse/queue', icon: ClipboardList, label: 'Queue Management', roles: ['NURSE', 'SECRETARY'] },
  { id: 'nurse_vitals', path: '/nurse/vitals', icon: Thermometer, label: 'Vitals Recording', roles: ['NURSE'] },
  { id: 'nurse_patients', path: '/nurse/patients', icon: Users, label: 'Patient List', roles: ['NURSE', 'SECRETARY'] },

  // Secretary Routes
  { id: 'secretary_dash', path: '/secretary', icon: LayoutDashboard, label: 'Front Desk', roles: ['SECRETARY'] },
  { id: 'secretary_schedule', path: '/secretary/schedule', icon: Calendar, label: 'Appointments', roles: ['SECRETARY'] },
  { id: 'secretary_checkin', path: '/secretary/checkin', icon: UserPlus, label: 'Patient Check-In', roles: ['SECRETARY'] },
  { id: 'secretary_visits', path: '/secretary/visits', icon: FileText, label: 'Visit Management', roles: ['SECRETARY'] },
];

const Sidebar = () => {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role || '';
  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };

  return (
    <aside className="w-64 h-screen bg-surface-container-lowest flex flex-col border-none shrink-0 overflow-y-auto">
      <div className="p-8">
        <h2 className="text-white text-xl font-bold tracking-tighter flex items-center gap-2">
          <div className="w-6 h-6 bg-clinical-blue rounded-sm" />
          PraiseJah <span className="text-on-surface-variant font-normal">EMR</span>
        </h2>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all relative group ${
                isActive
                  ? 'text-white bg-surface-bright/10'
                  : 'text-on-surface-variant hover:text-white hover:bg-surface-bright/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute left-0 w-[2px] h-6 bg-clinical-blue"
                />
              )}
              <item.icon size={18} className={isActive ? 'text-clinical-blue' : ''} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 px-8 border-t border-surface-bright/10 space-y-4">
        <button className="flex items-center gap-3 text-on-surface-variant hover:text-white text-sm transition-colors w-full group">
          <Settings size={18} className="group-hover:rotate-45 transition-transform" />
          <span>Settings</span>
        </button>
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="flex items-center gap-3 text-red-400 hover:text-red-300 text-sm transition-colors w-full disabled:opacity-50"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
