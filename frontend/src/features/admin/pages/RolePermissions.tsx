import { useAuthStore } from "@/features/auth/stores/auth.store";
import {
  Shield,
  Users,
  Lock,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings,
  FileText,
  Activity,
  Thermometer,
  Calendar,
  UserPlus,
} from "lucide-react";

const SUPER_ADMIN_RolePermissions = () => {
  useAuthStore();

  const roles = [
    {
      name: "SUPER_ADMIN",
      description:
        "Full system access including configuration and database management",
      color: "text-purple-400",
      borderColor: "border-purple-500/30",
      permissions: [
        "Create/modify/delete all users",
        "System configuration",
        "Database management",
        "Full audit log access",
        "Role permissions management",
        "Backup and restore",
      ],
    },
    {
      name: "ADMIN",
      description: "Administrative access for staff and patient management",
      color: "text-clinical-blue",
      borderColor: "border-clinical-blue/30",
      permissions: [
        "Create/modify/delete staff (except admins)",
        "Patient management",
        "Queue management",
        "View audit logs",
        "Staff management",
        "Patient registry",
      ],
    },
    {
      name: "DOCTOR",
      description: "Clinical access for patient care and medical records",
      color: "text-green-400",
      borderColor: "border-green-500/30",
      permissions: [
        "View assigned patients",
        "Create clinical notes",
        "Write prescriptions",
        "Order lab tests",
        "View patient history",
        "Manage active encounters",
      ],
    },
    {
      name: "NURSE",
      description: "Clinical access for triage, vitals, and patient care",
      color: "text-yellow-400",
      borderColor: "border-yellow-400/30",
      permissions: [
        "Record vitals",
        "Manage triage queue",
        "View patient information",
        "Check-in patients",
        "View queue status",
        "Record patient data",
      ],
    },
    {
      name: "SECRETARY",
      description: "Front desk access for scheduling and patient registration",
      color: "text-blue-400",
      borderColor: "border-blue-400/30",
      permissions: [
        "Register patients",
        "Schedule appointments",
        "Check-in patients",
        "Create visits",
        "View appointment calendar",
        "Manage patient queue",
      ],
    },
  ];

  const permissionModules = [
    {
      name: "User Management",
      icon: Users,
      permissions: [
        { action: "Create Users", roles: ["SUPER_ADMIN", "ADMIN"] },
        { action: "Edit Users", roles: ["SUPER_ADMIN", "ADMIN"] },
        { action: "Delete Users", roles: ["SUPER_ADMIN", "ADMIN"] },
        {
          action: "View Users",
          roles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "NURSE", "SECRETARY"],
        },
      ],
    },
    {
      name: "Patient Management",
      icon: Activity,
      permissions: [
        {
          action: "Create Patients",
          roles: ["SUPER_ADMIN", "ADMIN", "SECRETARY"],
        },
        {
          action: "Edit Patients",
          roles: ["SUPER_ADMIN", "ADMIN", "SECRETARY"],
        },
        { action: "Delete Patients", roles: ["SUPER_ADMIN", "ADMIN"] },
        {
          action: "View Patients",
          roles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "NURSE", "SECRETARY"],
        },
      ],
    },
    {
      name: "Clinical Records",
      icon: FileText,
      permissions: [
        { action: "Create Notes", roles: ["SUPER_ADMIN", "ADMIN", "DOCTOR"] },
        { action: "Edit Notes", roles: ["SUPER_ADMIN", "ADMIN", "DOCTOR"] },
        {
          action: "View Notes",
          roles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "NURSE"],
        },
        {
          action: "Prescribe Medication",
          roles: ["SUPER_ADMIN", "ADMIN", "DOCTOR"],
        },
      ],
    },
    {
      name: "Queue Management",
      icon: Thermometer,
      permissions: [
        {
          action: "Manage Queue",
          roles: ["SUPER_ADMIN", "ADMIN", "NURSE", "SECRETARY"],
        },
        { action: "Record Vitals", roles: ["SUPER_ADMIN", "ADMIN", "NURSE"] },
        {
          action: "View Queue",
          roles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "NURSE", "SECRETARY"],
        },
        {
          action: "Assign to Doctor",
          roles: ["SUPER_ADMIN", "ADMIN", "NURSE"],
        },
      ],
    },
    {
      name: "System Administration",
      icon: Settings,
      permissions: [
        { action: "System Settings", roles: ["SUPER_ADMIN"] },
        { action: "Database Management", roles: ["SUPER_ADMIN"] },
        { action: "Role Permissions", roles: ["SUPER_ADMIN"] },
        { action: "View Audit Logs", roles: ["SUPER_ADMIN", "ADMIN"] },
      ],
    },
    {
      name: "Scheduling",
      icon: Calendar,
      permissions: [
        {
          action: "Schedule Appointments",
          roles: ["SUPER_ADMIN", "ADMIN", "SECRETARY"],
        },
        {
          action: "View Schedule",
          roles: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "NURSE", "SECRETARY"],
        },
        {
          action: "Cancel Appointments",
          roles: ["SUPER_ADMIN", "ADMIN", "SECRETARY"],
        },
        {
          action: "Check-in Patients",
          roles: ["SUPER_ADMIN", "ADMIN", "SECRETARY"],
        },
      ],
    },
  ];

  const hasPermission = (allowedRoles: string[], role: string) => {
    return allowedRoles.includes(role);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <p className="mono-label text-clinical-blue mb-1 uppercase">
            Access Control
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tighter">
            Role Permissions
          </h1>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-low px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-white border border-white/5 transition-colors flex items-center gap-2">
            <RefreshCw size={14} />
            REFRESH
          </button>
          <button className="bg-clinical-blue px-6 py-2 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-colors flex items-center gap-2">
            <Save size={14} />
            SAVE CHANGES
          </button>
        </div>
      </div>

      {/* Role Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {roles.map((role) => (
          <div
            key={role.name}
            className={`bg-surface-container-low p-6 space-y-4 border-l-2 ${role.borderColor}`}
          >
            <div>
              <h3 className={`text-lg font-bold ${role.color}`}>{role.name}</h3>
              <p className="text-xs text-on-surface-variant mt-2">
                {role.description}
              </p>
            </div>
            <div className="space-y-2">
              {role.permissions.slice(0, 3).map((perm) => (
                <div
                  key={perm}
                  className="flex items-center gap-2 text-xs text-on-surface-variant"
                >
                  <CheckCircle size={10} className={role.color} />
                  <span>{perm}</span>
                </div>
              ))}
              {role.permissions.length > 3 && (
                <p className="text-xs text-on-surface-variant">
                  +{role.permissions.length - 3} more
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Permission Matrix */}
      <div className="bg-surface-container-low p-6 border-l-2 border-clinical-blue/50">
        <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
          <Shield size={16} className="text-clinical-blue" />
          PERMISSION MATRIX
        </h2>
        <div className="space-y-6">
          {permissionModules.map((module) => (
            <div key={module.name} className="space-y-3">
              <div className="flex items-center gap-2">
                <module.icon size={16} className="text-clinical-blue" />
                <h3 className="text-sm font-bold text-white">{module.name}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-4 py-2 mono-label text-on-surface-variant text-[10px]">
                        ACTION
                      </th>
                      {roles.map((role) => (
                        <th
                          key={role.name}
                          className="px-4 py-2 mono-label text-on-surface-variant text-[10px] text-center"
                        >
                          {role.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {module.permissions.map((perm) => (
                      <tr
                        key={perm.action}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="px-4 py-2 text-xs text-white">
                          {perm.action}
                        </td>
                        {roles.map((role) => (
                          <td key={role.name} className="px-4 py-2 text-center">
                            {hasPermission(perm.roles, role.name) ? (
                              <CheckCircle
                                size={16}
                                className="text-green-400 mx-auto"
                              />
                            ) : (
                              <Lock
                                size={16}
                                className="text-on-surface-variant mx-auto"
                              />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-surface-container-low p-6 border-l-2 border-yellow-500/30">
        <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
          <AlertTriangle size={16} className="text-yellow-400" />
          QUICK ACTIONS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-background/50 border border-white/5 hover:border-clinical-blue/30 transition-colors text-left">
            <UserPlus size={16} className="text-clinical-blue" />
            <span className="text-xs text-white">Create Custom Role</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-background/50 border border-white/5 hover:border-green-500/30 transition-colors text-left">
            <RefreshCw size={16} className="text-green-400" />
            <span className="text-xs text-white">Reset to Defaults</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-background/50 border border-white/5 hover:border-red-500/30 transition-colors text-left">
            <AlertTriangle size={16} className="text-red-400" />
            <span className="text-xs text-white">Audit Permission Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SUPER_ADMIN_RolePermissions;
