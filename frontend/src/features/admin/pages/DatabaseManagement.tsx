import { useAuthStore } from "@/features/auth/stores/auth.store";
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
} from "lucide-react";

const SUPER_ADMIN_DatabaseManagement = () => {
  useAuthStore();

  const recentBackups = [
    {
      id: "BK-001",
      name: "daily_backup_2026-04-20",
      size: "245 MB",
      date: "2026-04-20 02:00:00",
      status: "COMPLETED",
    },
    {
      id: "BK-002",
      name: "daily_backup_2026-04-19",
      size: "243 MB",
      date: "2026-04-19 02:00:00",
      status: "COMPLETED",
    },
    {
      id: "BK-003",
      name: "daily_backup_2026-04-18",
      size: "241 MB",
      date: "2026-04-18 02:00:00",
      status: "COMPLETED",
    },
    {
      id: "BK-004",
      name: "manual_backup_2026-04-17",
      size: "239 MB",
      date: "2026-04-17 14:30:00",
      status: "COMPLETED",
    },
  ];

  const databaseStats = {
    totalSize: "2.4 GB",
    tables: 12,
    records: 15420,
    indexes: 28,
    lastOptimized: "2026-04-19 03:00:00",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "border-green-500/30 text-green-400 bg-green-500/10";
      case "IN_PROGRESS":
        return "border-clinical-blue/30 text-clinical-blue bg-clinical-blue/10";
      case "FAILED":
        return "border-red-500/30 text-red-400 bg-red-500/10";
      default:
        return "border-on-surface-variant/30 text-on-surface-variant";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <p className="mono-label text-clinical-blue mb-1 uppercase">
            Database Administration
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tighter">
            Database Management
          </h1>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-low px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-white border border-white/5 transition-colors flex items-center gap-2">
            <RefreshCw size={14} />
            REFRESH
          </button>
          <button className="bg-clinical-blue px-6 py-2 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-colors flex items-center gap-2">
            <Download size={14} />
            CREATE BACKUP
          </button>
        </div>
      </div>

      {/* Database Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          {
            label: "TOTAL SIZE",
            value: databaseStats.totalSize,
            icon: HardDrive,
            color: "text-clinical-blue",
          },
          {
            label: "TABLES",
            value: databaseStats.tables,
            icon: Database,
            color: "text-green-400",
          },
          {
            label: "RECORDS",
            value: databaseStats.records.toLocaleString(),
            icon: FileText,
            color: "text-yellow-400",
          },
          {
            label: "INDEXES",
            value: databaseStats.indexes,
            icon: CheckCircle,
            color: "text-blue-400",
          },
          {
            label: "LAST OPTIMIZED",
            value: "Yesterday",
            icon: Clock,
            color: "text-on-surface-variant",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container-low p-6 space-y-2 border-none"
          >
            <div className="flex items-center gap-2">
              <stat.icon size={14} className={stat.color} />
              <span className="mono-label text-on-surface-variant">
                {stat.label}
              </span>
            </div>
            <p className="text-4xl font-bold text-white data-value">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Backups */}
        <div className="bg-surface-container-low p-6 border-l-2 border-clinical-blue/50">
          <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
            <Database size={16} className="text-clinical-blue" />
            RECENT BACKUPS
          </h2>
          <div className="space-y-3">
            {recentBackups.map((backup) => (
              <div
                key={backup.id}
                className="flex items-center justify-between p-3 bg-background/50 border border-white/5 hover:border-clinical-blue/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-background border border-white/5 flex items-center justify-center">
                    <Database size={16} className="text-clinical-blue" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-clinical-blue transition-colors">
                      {backup.name}
                    </p>
                    <p className="text-[10px] text-on-surface-variant lowercase data-value">
                      {backup.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="data-value text-[10px] text-on-surface-variant">
                    {backup.size}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 border ${getStatusColor(backup.status)}`}
                  >
                    {backup.status}
                  </span>
                  <div className="flex gap-2">
                    <button className="text-on-surface-variant hover:text-white transition-colors">
                      <Download size={14} />
                    </button>
                    <button className="text-on-surface-variant hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database Operations */}
        <div className="bg-surface-container-low p-6 border-l-2 border-green-500/30">
          <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
            <RefreshCw size={16} className="text-green-400" />
            DATABASE OPERATIONS
          </h2>
          <div className="space-y-4">
            <button className="w-full bg-surface-container-low px-4 py-3 text-xs font-bold text-on-surface-variant hover:text-white border border-white/5 transition-colors flex items-center justify-center gap-2">
              <RefreshCw size={14} />
              OPTIMIZE DATABASE
            </button>
            <button className="w-full bg-surface-container-low px-4 py-3 text-xs font-bold text-on-surface-variant hover:text-white border border-white/5 transition-colors flex items-center justify-center gap-2">
              <FileText size={14} />
              ANALYZE TABLES
            </button>
            <button className="w-full bg-surface-container-low px-4 py-3 text-xs font-bold text-on-surface-variant hover:text-white border border-white/5 transition-colors flex items-center justify-center gap-2">
              <CheckCircle size={14} />
              REBUILD INDEXES
            </button>
            <button className="w-full bg-surface-container-low px-4 py-3 text-xs font-bold text-on-surface-variant hover:text-white border border-white/5 transition-colors flex items-center justify-center gap-2">
              <Upload size={14} />
              RESTORE FROM BACKUP
            </button>
            <button className="w-full bg-red-500/10 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors flex items-center justify-center gap-2">
              <AlertTriangle size={14} />
              RESET DATABASE (DANGER)
            </button>
          </div>
        </div>
      </div>

      {/* Backup Schedule */}
      <div className="bg-surface-container-low p-6 border-l-2 border-yellow-500/30">
        <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
          <Clock size={16} className="text-yellow-400" />
          BACKUP SCHEDULE
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              type: "Daily",
              time: "02:00 AM",
              retention: "7 days",
              status: "Active",
            },
            {
              type: "Weekly",
              time: "Sunday 03:00 AM",
              retention: "4 weeks",
              status: "Active",
            },
            {
              type: "Monthly",
              time: "1st 04:00 AM",
              retention: "12 months",
              status: "Active",
            },
          ].map((schedule) => (
            <div
              key={schedule.type}
              className="p-4 bg-background/50 border border-white/5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-white">
                  {schedule.type}
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 border ${schedule.status === "Active" ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"}`}
                >
                  {schedule.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Time</span>
                  <span className="data-value text-white">{schedule.time}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Retention</span>
                  <span className="data-value text-white">
                    {schedule.retention}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SUPER_ADMIN_DatabaseManagement;
