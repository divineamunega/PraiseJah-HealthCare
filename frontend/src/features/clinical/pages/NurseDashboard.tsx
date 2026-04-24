import React from "react";
import {
  Activity,
  Search,
  ClipboardList,
  AlertCircle,
  Clock,
  CheckCircle2,
  Stethoscope,
  ArrowRight,
  Plus,
  User,
} from "lucide-react";
import { useVisits } from "../hooks/useVisits";
import { useClinicalSocket } from "../hooks/useClinicalSocket";

const Nurse_Dashboard = () => {
  useClinicalSocket(); // Real-time updates
  const { data: visitsData, isLoading } = useVisits();

  // Filter visits that are not completed (active queue)
  const activeVisits = Array.isArray(visitsData) 
    ? visitsData.filter(v => v.status !== 'COMPLETED') 
    : [];

  const stats = {
    waitingForVitals: activeVisits.filter(v => v.queueEntry?.status === 'WAITING_FOR_VITALS').length,
    readyForDoctor: activeVisits.filter(v => v.queueEntry?.status === 'READY_FOR_DOCTOR').length,
    inProgress: activeVisits.filter(v => v.status === 'IN_PROGRESS').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <p className="mono-label text-clinical-blue mb-1 uppercase tracking-widest">Clinical Triage & Vitals</p>
          <h1 className="text-3xl font-bold text-white tracking-tighter">Nursing Unit Workstation</h1>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 border border-white/5 group focus-within:border-clinical-blue transition-all">
            <Search size={14} className="text-on-surface-variant group-focus-within:text-clinical-blue" />
            <input
              type="text"
              placeholder="SCAN PATIENT ID..."
              className="bg-transparent border-none outline-none text-[10px] font-bold text-white placeholder:text-on-surface-variant/50 w-48"
            />
          </div>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "WAITING FOR VITALS", count: stats.waitingForVitals, color: "text-yellow-400", icon: Clock },
          { label: "READY FOR DOCTOR", count: stats.readyForDoctor, color: "text-green-400", icon: CheckCircle2 },
          { label: "IN CLINICAL REVIEW", count: stats.inProgress, color: "text-clinical-blue", icon: Stethoscope },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-low p-6 space-y-2 border-none">
            <div className="flex items-center gap-2">
              <stat.icon size={14} className={stat.color} />
              <span className="mono-label text-on-surface-variant text-[10px] tracking-widest">{stat.label}</span>
            </div>
            <p className="text-4xl font-bold text-white data-value">{isLoading ? "..." : stat.count}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                <ClipboardList size={16} className="text-clinical-blue" />
                ACTIVE CLINICAL QUEUE
              </h2>
              <span className="data-value text-[10px] text-clinical-blue font-bold tracking-widest">
                {activeVisits.length} PATIENTS IN FACILITY
              </span>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="p-12 text-center border border-dashed border-white/5 bg-surface-container-low/30">
                  <p className="animate-pulse text-[10px] text-on-surface-variant uppercase tracking-widest">Loading Live Feed...</p>
                </div>
              ) : activeVisits.length > 0 ? (
                activeVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="bg-surface-container-low p-4 flex items-center justify-between group hover:bg-surface-bright/10 transition-colors cursor-pointer border border-white/5 border-l-2 hover:border-l-clinical-blue"
                  >
                    <div className="flex gap-6 items-center">
                      <div className="data-value text-[10px] text-clinical-blue w-16 font-bold">
                        {new Date(visit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-clinical-blue transition-colors uppercase">
                          {visit.patient?.firstName} {visit.patient?.lastName}
                        </h3>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                          {visit.queueEntry?.status.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-background border border-white/10 flex items-center justify-center text-[8px] font-bold text-clinical-blue uppercase">
                          {visit.patient?.sex?.[0]}
                        </div>
                      </div>
                      <button className="bg-clinical-blue/10 p-2 text-clinical-blue hover:bg-clinical-blue hover:text-white transition-all">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center border border-dashed border-white/5 bg-surface-container-low/30">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Queue Clear - No Active Patients</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
              <Activity size={16} className="text-green-500" />
              RECENT VITALS RECORDED
            </h2>
            <div className="bg-surface-container-low border border-white/5 p-4 opacity-50">
              <p className="text-[10px] text-on-surface-variant uppercase text-center py-4 tracking-widest">Vitals module pending integration</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container-low border border-white/5 p-6 space-y-6">
            <h2 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Station Controls</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-background/50 border border-white/5 hover:border-clinical-blue transition-all group">
                <div className="flex items-center gap-3">
                  <Activity size={18} className="text-clinical-blue" />
                  <span className="text-xs font-bold text-white uppercase tracking-tighter">Capture Vitals</span>
                </div>
                <ArrowRight size={14} className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-background/50 border border-white/5 hover:border-yellow-400/30 transition-all group">
                <div className="flex items-center gap-3">
                  <ClipboardList size={18} className="text-yellow-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-tighter">Manage Queue</span>
                </div>
                <ArrowRight size={14} className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="pt-6 border-t border-white/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase">Sensor Status</span>
                <span className="text-[10px] text-green-400 font-bold uppercase">Online</span>
              </div>
              <div className="h-1 bg-background w-full overflow-hidden">
                <div className="h-full bg-clinical-blue w-1/3 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="bg-red-500/5 border border-red-500/10 p-4">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Critical Alerts</span>
            </div>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">No critical flags detected.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nurse_Dashboard;
