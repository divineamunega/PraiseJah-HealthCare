import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useDashboardStore, type Role } from '../../store/useDashboardStore';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'framer-motion';

interface NavItem {
  id: string;
  path: string;
  icon: any;
  label: string;
  roles: Role[];
}

const navItems: NavItem[] = [
  // Admin
  { id: 'overview', path: '/admin', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN'] },
  { id: 'staff', path: '/admin/staff', icon: UserCheck, label: 'Staff Management', roles: ['ADMIN'] },
  { id: 'audit', path: '/admin/audit', icon: ShieldCheck, label: 'Security Audit', roles: ['ADMIN'] },
  
  // Shared / Role Specific
  { id: 'doctor_dash', path: '/doctor', icon: LayoutDashboard, label: 'Doctor Dash', roles: ['DOCTOR'] },
  { id: 'nurse_dash', path: '/nurse', icon: LayoutDashboard, label: 'Nurse Dash', roles: ['NURSE'] },
  { id: 'patients', path: '/patients', icon: Users, label: 'Patients', roles: ['DOCTOR', 'NURSE'] },
];

const Sidebar = () => {
  const { role } = useDashboardStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const filteredItems = navItems.filter(item => item.roles.includes(role));

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
        <button className="flex items-center gap-3 text-red-400 hover:text-red-300 text-sm transition-colors w-full">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
