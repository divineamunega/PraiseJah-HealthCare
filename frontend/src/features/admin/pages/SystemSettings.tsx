import { useAuthStore } from "@/features/auth/stores/auth.store";
import {
  Settings,
  Database,
  Shield,
  Save,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const SUPER_ADMIN_SystemSettings = () => {
  useAuthStore();

  const systemSettings = {
    hospitalName: "PraiseJah HealthCare",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    language: "en-US",
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireMFA: false,
    auditLogRetention: 90,
  };

  const emailSettings = {
    smtpHost: "smtp.resend.com",
    smtpPort: 587,
    fromEmail: "noreply@praisejah.com",
    fromName: "PraiseJah EMR",
  };

  const backupSettings = {
    autoBackup: true,
    backupFrequency: "daily",
    retentionDays: 30,
    lastBackup: "2026-04-20 02:00:00",
    nextBackup: "2026-04-21 02:00:00",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <p className="mono-label text-clinical-blue mb-1 uppercase">
            System Configuration
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tighter">
            System Settings
          </h1>
        </div>
        <button className="bg-clinical-blue px-6 py-2 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-colors flex items-center gap-2">
          <Save size={14} />
          SAVE CHANGES
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="bg-surface-container-low p-6 border-l-2 border-clinical-blue/50">
          <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
            <Settings size={16} className="text-clinical-blue" />
            GENERAL SETTINGS
          </h2>
          <div className="space-y-4">
            {Object.entries(systemSettings).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <label className="mono-label text-on-surface-variant text-[10px] uppercase">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </label>
                {typeof value === "boolean" ? (
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-sm border ${value ? "bg-clinical-blue border-clinical-blue" : "border-white/20"}`}
                    />
                    <span className="text-xs text-white">
                      {value ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                ) : (
                  <input
                    type={typeof value === "number" ? "number" : "text"}
                    defaultValue={value}
                    className="w-full bg-background border border-white/5 p-2 text-sm text-white focus:border-clinical-blue outline-none"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-surface-container-low p-6 border-l-2 border-green-500/30">
          <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
            <Shield size={16} className="text-green-400" />
            EMAIL CONFIGURATION
          </h2>
          <div className="space-y-4">
            {Object.entries(emailSettings).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <label className="mono-label text-on-surface-variant text-[10px] uppercase">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </label>
                <input
                  type={typeof value === "number" ? "number" : "text"}
                  defaultValue={value}
                  className="w-full bg-background border border-white/5 p-2 text-sm text-white focus:border-clinical-blue outline-none"
                />
              </div>
            ))}
            <button className="w-full bg-surface-container-low px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-white border border-white/5 transition-colors flex items-center justify-center gap-2 mt-4">
              <RefreshCw size={14} />
              TEST EMAIL CONFIGURATION
            </button>
          </div>
        </div>
      </div>

      {/* Backup Settings */}
      <div className="bg-surface-container-low p-6 border-l-2 border-yellow-500/30">
        <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
          <Database size={16} className="text-yellow-400" />
          BACKUP & RECOVERY
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {Object.entries(backupSettings).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-background/50 border border-white/5"
              >
                <span className="text-xs text-on-surface-variant uppercase tracking-wider">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className="data-value text-xs text-white">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <button className="w-full bg-clinical-blue px-4 py-2 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-colors flex items-center justify-center gap-2">
              <Download size={14} />
              CREATE BACKUP NOW
            </button>
            <button className="w-full bg-surface-container-low px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-white border border-white/5 transition-colors flex items-center justify-center gap-2">
              <Upload size={14} />
              RESTORE FROM BACKUP
            </button>
            <button className="w-full bg-surface-container-low px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-white border border-white/5 transition-colors flex items-center justify-center gap-2">
              <RefreshCw size={14} />
              SCHEDULE BACKUP
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-surface-container-low p-6 border-l-2 border-on-surface-variant/30">
        <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
          <AlertTriangle size={16} className="text-on-surface-variant" />
          SYSTEM STATUS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Database", status: "Healthy", color: "text-green-400" },
            {
              label: "Email Service",
              status: "Operational",
              color: "text-green-400",
            },
            {
              label: "Redis Queue",
              status: "Operational",
              color: "text-green-400",
            },
            { label: "API Server", status: "Running", color: "text-green-400" },
            {
              label: "Disk Space",
              status: "45% Used",
              color: "text-yellow-400",
            },
            { label: "Memory", status: "62% Used", color: "text-yellow-400" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-3 bg-background/50 border border-white/5"
            >
              <span className="text-xs text-on-surface-variant uppercase tracking-wider">
                {item.label}
              </span>
              <span
                className={`data-value text-xs font-bold ${item.color} flex items-center gap-2`}
              >
                <CheckCircle size={12} />
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SUPER_ADMIN_SystemSettings;
