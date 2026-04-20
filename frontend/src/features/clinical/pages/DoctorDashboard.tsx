import { useAuthStore } from "@/features/auth/stores/auth.store";
import {
  Activity,
  Clock,
  UserPlus,
  Calendar,
  Check,
  AlertTriangle,
} from "lucide-react";

const Doctor_Dashboard = () => {
  const { user } = useAuthStore();

  // Mock data - in reality would come from API
  const activeEncounters = [
    {
      id: "PX-2042",
      name: "Jonathan Harker",
      time: "10:30 AM",
      status: "In Progress",
      wait: "12m",
    },
    {
      id: "PX-2043",
      name: "Mina Murray",
      time: "11:15 AM",
      status: "Ready",
      wait: "05m",
    },
  ];

  const pendingTasks = {
    unsignedNotes: 4,
    labResults: 2,
    prescriptionRefills: 1,
  };

  const todayStats = {
    visitsCompleted: 8,
    avgPatientTime: "22m",
    patientSatisfaction: "94%",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <p className="mono-label text-clinical-blue mb-1 uppercase">
            Clinical Cockpit
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tighter">
            Dr. {user?.firstName} {user?.lastName?.substring(0, 1)}.
          </h1>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-low px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-white border border-white/5 transition-colors">
            HISTORY
          </button>
          <button className="bg-clinical-blue px-6 py-2 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-colors flex items-center gap-2">
            <UserPlus size={14} />
            NEXT PATIENT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            MY ACTIVE ENCOUNTERS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeEncounters.map((p, i) => (
              <div
                key={i}
                className="bg-surface-container-low p-5 hover:bg-surface-bright/10 transition-all cursor-pointer group border border-white/5"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="data-value text-clinical-blue text-[10px] mb-1">
                      {p.id}
                    </p>
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 border ${i === 0 ? "border-clinical-blue text-clinical-blue bg-clinical-blue/10" : "border-green-500 text-green-400 bg-green-500/10"}`}
                  >
                    {p.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-6 border-t border-white/5 pt-4 mt-2">
                  <div className="flex items-center gap-2 text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">
                    <Clock size={12} className="text-clinical-blue" />
                    <span>{p.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">
                    <Activity size={12} className="text-clinical-blue" />
                    <span>WAIT: {p.wait}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container-low p-6 border-l-2 border-clinical-blue shadow-lg shadow-black/20">
            <h2 className="text-sm font-bold text-on-surface-variant mb-6 flex items-center gap-2 uppercase tracking-widest">
              <AlertTriangle size={16} className="text-yellow-400" />
              PENDING TASKS
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-background/50 border border-white/5 hover:border-yellow-500/30 transition-colors cursor-pointer group">
                <span className="text-xs text-on-surface-variant uppercase tracking-wider group-hover:text-white">
                  Unsigned Notes
                </span>
                <span className="data-value text-yellow-400 font-bold">
                  {pendingTasks.unsignedNotes}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background/50 border border-white/5 hover:border-blue-500/30 transition-colors cursor-pointer group">
                <span className="text-xs text-on-surface-variant uppercase tracking-wider group-hover:text-white">
                  Lab Results
                </span>
                <span className="data-value text-blue-400 font-bold">
                  {pendingTasks.labResults}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background/50 border border-white/5 hover:border-green-500/30 transition-colors cursor-pointer group">
                <span className="text-xs text-on-surface-variant uppercase tracking-wider group-hover:text-white">
                  Prescription Refills
                </span>
                <span className="data-value text-green-400 font-bold">
                  {pendingTasks.prescriptionRefills}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low p-6">
          <h2 className="text-sm font-bold text-on-surface-variant mb-6 flex items-center gap-2 uppercase tracking-widest">
            <Calendar size={16} className="text-clinical-blue" />
            TODAY'S SUMMARY
          </h2>
          <div className="space-y-3">
            {[
              {
                label: "Visits Completed",
                value: todayStats.visitsCompleted,
                icon: Check,
                color: "text-green-400",
              },
              {
                label: "Avg Time/Patient",
                value: todayStats.avgPatientTime,
                icon: Clock,
                color: "text-clinical-blue",
              },
              {
                label: "Patient Satisfaction",
                value: todayStats.patientSatisfaction,
                icon: Check,
                color: "text-green-400",
              },
            ].map((stat) => (
              <div className="flex items-center justify-between p-2 bg-background/50 border border-white/5 rounded-sm">
                <span className="text-xs text-on-surface-variant">
                  {stat.label}
                </span>
                <span className={`data-value font-bold ${stat.color}`}>
                  {stat.value}
                </span>
                <stat.icon size={12} className={`${stat.color} ml-2`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Doctor_Dashboard;
