import {
  LayoutDashboard,
  Users,
  LogOut,
  ShieldCheck,
  UserCheck,
  ClipboardList,
  FlaskConical,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";

interface NavItem {
  id: string;
  path: string;
  icon: any;
  label: string;
  roles: string[];
}

const navItems: NavItem[] = [
  // Admin Routes
  {
    id: "admin_overview",
    path: "/admin",
    icon: LayoutDashboard,
    label: "System Overview",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    id: "staff",
    path: "/admin/staff",
    icon: UserCheck,
    label: "Staff Directory",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    id: "audit",
    path: "/admin/audit",
    icon: ShieldCheck,
    label: "Security Vault",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },

  // Doctor Routes
  {
    id: "doctor_dash",
    path: "/doctor",
    icon: LayoutDashboard,
    label: "Clinical Cockpit",
    roles: ["DOCTOR"],
  },
  {
    id: "doctor_patients",
    path: "/doctor/patients",
    icon: Users,
    label: "Patient Registry",
    roles: ["DOCTOR"],
  },

  // Nurse Routes
  {
    id: "nurse_dash",
    path: "/nurse",
    icon: LayoutDashboard,
    label: "Nursing Station",
    roles: ["NURSE"],
  },
  {
    id: "nurse_queue",
    path: "/nurse/queue",
    icon: ClipboardList,
    label: "Clinical Queue",
    roles: ["NURSE"],
  },
  {
    id: "nurse_patients",
    path: "/nurse/patients",
    icon: Users,
    label: "Patient List",
    roles: ["NURSE"],
  },

  // Lab Routes
  {
    id: "lab_dash",
    path: "/lab",
    icon: FlaskConical,
    label: "Diagnostic Lab",
    roles: ["LAB_SCIENTIST"],
  },

  // Secretary Routes
  {
    id: "secretary_dash",
    path: "/secretary",
    icon: LayoutDashboard,
    label: "Front Desk",
    roles: ["SECRETARY"],
  },
  {
    id: "secretary_patients",
    path: "/secretary/patients",
    icon: Users,
    label: "Patient Registry",
    roles: ["SECRETARY"],
  },
];

const Sidebar = () => {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role || "";
  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/login");
      },
    });
  };

  return (
    <aside className="w-64 h-screen bg-surface-container-lowest flex flex-col border-none shrink-0 overflow-y-auto">
      <div className="p-8">
        <h2 className="text-white text-xl font-bold tracking-tighter flex items-center gap-2">
          <div className="w-6 h-6 bg-clinical-blue rounded-sm" />
          PraiseJah{" "}
          <span className="text-on-surface-variant font-normal">EMR</span>
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
                  ? "text-white bg-surface-bright/10"
                  : "text-on-surface-variant hover:text-white hover:bg-surface-bright/5"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute left-0 w-[2px] h-6 bg-clinical-blue"
                />
              )}
              <item.icon
                size={18}
                className={isActive ? "text-clinical-blue" : ""}
              />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 px-8 border-t border-surface-bright/10 space-y-4">
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
