import { useAuthStore } from "@/features/auth/stores/auth.store";

import {
  Activity,
  Thermometer,
  Plus,
  Search,
  UserCheck,
  ClipboardList,
  AlertCircle,
} from "lucide-react";

const Nurse_Dashboard = () => {
  useAuthStore();

  // Mock triage queue data
  const triageQueue = [
    {
      id: "PX-2044",
      name: "Arthur Holmwood",
      time: "11:45 AM",
      priority: "High",
      reason: "Chest Pain",
      status: "WAITING_FOR_VITALS",
    },
    {
      id: "PX-2045",
      name: "Quincey Morris",
      time: "12:00 PM",
      priority: "Medium",
      reason: "Routine Checkup",
      status: "WAITING_FOR_VITALS",
    },
    {
      id: "PX-2046",
      name: "Renfield S.",
      time: "12:15 PM",
      priority: "Low",
      reason: "Follow-up",
      status: "WAITING_FOR_VITALS",
    },
    {
      id: "PX-2047",
      name: "Lucy Westenra",
      time: "12:30 PM",
      priority: "High",
      reason: "Fainting",
      status: "READY_FOR_DOCTOR",
    },
  ];

  const vitalsRecorded = [
    {
      id: "PX-2042",
      name: "Jonathan Harker",
      time: "10:30 AM",
      bp: "120/80",
      hr: 72,
      temp: "36.8",
    },
    {
      id: "PX-2043",
      name: "Mina Murray",
      time: "11:15 AM",
      bp: "118/76",
      hr: 68,
      temp: "36.6",
    },
  ];

  const realTimeMetrics = {
    avgBPM: 72,
    meanTemp: 36.8,
    patientsInQueue: 4,
    vitalsCompleted: 8,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "border-red-500/50 text-red-400 bg-red-400/5";
      case "Medium":
        return "border-yellow-400/50 text-yellow-400 bg-yellow-400/5";
      case "Low":
        return "border-on-surface-variant/30 text-on-surface-variant";
      default:
        return "border-on-surface-variant/30 text-on-surface-variant";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING_FOR_VITALS":
        return "border-yellow-400/30 text-yellow-400";
      case "READY_FOR_DOCTOR":
        return "border-green-500/30 text-green-400";
      case "IN_PROGRESS":
        return "border-clinical-blue/30 text-clinical-blue";
      default:
        return "border-on-surface-variant/30 text-on-surface-variant";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <p className="mono-label text-clinical-blue mb-1 uppercase tracking-widest">
            Triage & Vitals Station
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tighter">
            Central Nursing Unit
          </h1>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 border border-white/5 group focus-within:border-clinical-blue transition-all">
            <Search
              size={14}
              className="text-on-surface-variant group-focus-within:text-clinical-blue"
            />
            <input
              type="text"
              placeholder="FIND PATIENT..."
              className="bg-transparent border-none outline-none text-[10px] font-bold text-white placeholder:text-on-surface-variant/50 w-32"
            />
          </div>
          <button className="bg-clinical-blue px-6 py-2 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-colors">
            CHECK-IN PATIENT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {/* Triage Queue */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-clinical-blue" />
              TRIAGE QUEUE
            </h2>
            <span className="data-value text-[10px] text-clinical-blue font-bold">
              {triageQueue.length} PENDING
            </span>
          </div>

          <div className="space-y-3">
            {triageQueue.map((p, i) => (
              <div
                key={i}
                className="bg-surface-container-low p-4 flex items-center justify-between group hover:bg-surface-bright/10 transition-colors cursor-pointer border border-white/5 border-l-2 hover:border-l-clinical-blue"
              >
                <div className="flex gap-6 items-center">
                  <div className="data-value text-[10px] text-clinical-blue w-16 font-bold">
                    {p.time}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-clinical-blue transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                      {p.reason}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 border ${getPriorityColor(p.priority)}`}
                  >
                    {p.priority.toUpperCase()}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 border ${getStatusColor(p.status)}`}
                  >
                    {p.status.replace("_", " ")}
                  </span>
                  <button className="text-on-surface-variant hover:text-white transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Vitals Recorded Today */}
          <div className="flex items-center justify-between mt-8">
            <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              VITALS RECORDED TODAY
            </h2>
            <span className="data-value text-[10px] text-green-400 font-bold">
              {vitalsRecorded.length} COMPLETED
            </span>
          </div>

          <div className="space-y-3">
            {vitalsRecorded.map((v, i) => (
              <div
                key={i}
                className="bg-surface-container-low p-4 flex items-center justify-between group hover:bg-surface-bright/10 transition-colors cursor-pointer border border-white/5"
              >
                <div className="flex gap-6 items-center">
                  <div className="data-value text-[10px] text-green-400 w-16 font-bold">
                    {v.time}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">
                      {v.name}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                      Vitals Complete
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <Activity size={12} className="text-clinical-blue" />
                    <span className="data-value">{v.hr} BPM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer size={12} className="text-blue-400" />
                    <span className="data-value">{v.temp}°C</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="data-value">{v.bp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Monitoring */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
            Real-Time Monitoring
          </h2>
          <div className="bg-surface-container-low p-6 space-y-8 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                    Average BPM
                  </p>
                  <p className="data-value text-2xl text-white">
                    {realTimeMetrics.avgBPM}{" "}
                    <span className="text-xs font-normal text-on-surface-variant">
                      BPM
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <Thermometer size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                    Mean Temp
                  </p>
                  <p className="data-value text-2xl text-white">
                    {realTimeMetrics.meanTemp}{" "}
                    <span className="text-xs font-normal text-on-surface-variant">
                      °C
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">
                  Patients in Queue
                </span>
                <span className="data-value text-clinical-blue font-bold">
                  {realTimeMetrics.patientsInQueue}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">
                  Vitals Completed
                </span>
                <span className="data-value text-green-400 font-bold">
                  {realTimeMetrics.vitalsCompleted}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-surface-container-low p-6 border border-white/5">
            <h3 className="text-sm font-bold text-on-surface-variant mb-4 uppercase tracking-widest">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 bg-background/50 border border-white/5 hover:border-clinical-blue/30 transition-colors text-left">
                <UserCheck size={16} className="text-clinical-blue" />
                <span className="text-xs text-white">Record Vitals</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-background/50 border border-white/5 hover:border-green-500/30 transition-colors text-left">
                <ClipboardList size={16} className="text-green-400" />
                <span className="text-xs text-white">View Queue</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-background/50 border border-white/5 hover:border-yellow-400/30 transition-colors text-left">
                <AlertCircle size={16} className="text-yellow-400" />
                <span className="text-xs text-white">Alerts</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nurse_Dashboard;
