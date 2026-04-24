import React, { useState } from "react";
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
  X,
  Loader2,
  Thermometer,
  Weight,
  Ruler,
  RefreshCw,
  Droplets,
  Zap,
} from "lucide-react";
import { useVisits } from "../hooks/useVisits";
import { useCreateVital, useRecentVitals } from "../hooks/useVitals";
import { useClinicalSocket } from "../hooks/useClinicalSocket";
import { motion, AnimatePresence } from "framer-motion";

const VitalsCaptureModal = ({ visit, onClose }: { visit: any, onClose: () => void }) => {
  const [formData, setFormData] = useState({
    visitId: visit.id,
    systolicBP: undefined as number | undefined,
    diastolicBP: undefined as number | undefined,
    heartRate: undefined as number | undefined,
    respiratoryRate: undefined as number | undefined,
    temperatureCelsius: undefined as number | undefined,
    weightKg: undefined as number | undefined,
    heightCm: undefined as number | undefined,
  });

  const createVital = useCreateVital();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createVital.mutateAsync(formData, {
      onSuccess: () => onClose()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-surface-container-low border border-white/5 p-8 shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-on-surface-variant hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="px-2 py-0.5 bg-clinical-blue/10 border border-clinical-blue/20 rounded-full">
              <span className="text-[8px] font-bold text-clinical-blue uppercase tracking-tighter">Triage Session</span>
            </div>
            <span className="text-[10px] text-on-surface-variant data-value uppercase">Visit ID: {visit.id.slice(-8).toUpperCase()}</span>
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter flex items-center gap-3">
            <Activity size={24} className="text-clinical-blue" />
            Capture Clinical Vitals
          </h2>
          <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Patient: {visit.patient?.firstName} {visit.patient?.lastName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] border-b border-white/5 pb-2">Cardiovascular</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="mono-label text-[10px] text-on-surface-variant uppercase">Systolic BP</label>
                  <div className="flex items-center gap-2 bg-background border border-white/5 p-3 focus-within:border-clinical-blue transition-colors">
                    <input 
                      type="number" 
                      placeholder="120"
                      className="bg-transparent border-none outline-none text-sm text-white w-full"
                      value={formData.systolicBP || ''}
                      onChange={e => setFormData(d => ({ ...d, systolicBP: e.target.value ? parseInt(e.target.value) : undefined }))}
                    />
                    <span className="text-[8px] font-bold text-on-surface-variant uppercase">mmHg</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="mono-label text-[10px] text-on-surface-variant uppercase">Diastolic BP</label>
                  <div className="flex items-center gap-2 bg-background border border-white/5 p-3 focus-within:border-clinical-blue transition-colors">
                    <input 
                      type="number" 
                      placeholder="80"
                      className="bg-transparent border-none outline-none text-sm text-white w-full"
                      value={formData.diastolicBP || ''}
                      onChange={e => setFormData(d => ({ ...d, diastolicBP: e.target.value ? parseInt(e.target.value) : undefined }))}
                    />
                    <span className="text-[8px] font-bold text-on-surface-variant uppercase">mmHg</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="mono-label text-[10px] text-on-surface-variant uppercase">Heart Rate</label>
                <div className="flex items-center gap-2 bg-background border border-white/5 p-3 focus-within:border-clinical-blue transition-colors">
                  <Activity size={14} className="text-on-surface-variant" />
                  <input 
                    type="number" 
                    placeholder="72"
                    className="bg-transparent border-none outline-none text-sm text-white w-full"
                    value={formData.heartRate || ''}
                    onChange={e => setFormData(d => ({ ...d, heartRate: e.target.value ? parseInt(e.target.value) : undefined }))}
                  />
                  <span className="text-[8px] font-bold text-on-surface-variant uppercase">BPM</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] border-b border-white/5 pb-2">Metabolic</h3>
              <div className="space-y-1">
                <label className="mono-label text-[10px] text-on-surface-variant uppercase">Temperature</label>
                <div className="flex items-center gap-2 bg-background border border-white/5 p-3 focus-within:border-clinical-blue transition-colors">
                  <Thermometer size={14} className="text-on-surface-variant" />
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="36.6"
                    className="bg-transparent border-none outline-none text-sm text-white w-full"
                    value={formData.temperatureCelsius || ''}
                    onChange={e => setFormData(d => ({ ...d, temperatureCelsius: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  />
                  <span className="text-[8px] font-bold text-on-surface-variant uppercase">°C</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="mono-label text-[10px] text-on-surface-variant uppercase">Respiratory Rate</label>
                <div className="flex items-center gap-2 bg-background border border-white/5 p-3 focus-within:border-clinical-blue transition-colors">
                  <RefreshCw size={14} className="text-on-surface-variant" />
                  <input 
                    type="number" 
                    placeholder="16"
                    className="bg-transparent border-none outline-none text-sm text-white w-full"
                    value={formData.respiratoryRate || ''}
                    onChange={e => setFormData(d => ({ ...d, respiratoryRate: e.target.value ? parseInt(e.target.value) : undefined }))}
                  />
                  <span className="text-[8px] font-bold text-on-surface-variant uppercase">BPM</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] border-b border-white/5 pb-2">Biometrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="mono-label text-[10px] text-on-surface-variant uppercase">Weight</label>
                  <div className="flex items-center gap-2 bg-background border border-white/5 p-3 focus-within:border-clinical-blue transition-colors">
                    <Weight size={14} className="text-on-surface-variant" />
                    <input 
                      type="number" 
                      step="0.1" 
                      placeholder="70.0"
                      className="bg-transparent border-none outline-none text-sm text-white w-full"
                      value={formData.weightKg || ''}
                      onChange={e => setFormData(d => ({ ...d, weightKg: e.target.value ? parseFloat(e.target.value) : undefined }))}
                    />
                    <span className="text-[8px] font-bold text-on-surface-variant uppercase">KG</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="mono-label text-[10px] text-on-surface-variant uppercase">Height</label>
                  <div className="flex items-center gap-2 bg-background border border-white/5 p-3 focus-within:border-clinical-blue transition-colors">
                    <Ruler size={14} className="text-on-surface-variant" />
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="175.0"
                      className="bg-transparent border-none outline-none text-sm text-white w-full"
                      value={formData.heightCm || ''}
                      onChange={e => setFormData(d => ({ ...d, heightCm: e.target.value ? parseFloat(e.target.value) : undefined }))}
                    />
                    <span className="text-[8px] font-bold text-on-surface-variant uppercase">CM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={createVital.isPending}
            className="w-full bg-clinical-blue py-4 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-clinical-blue/10"
          >
            {createVital.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                TRANSMITTING CLINICAL DATA...
              </>
            ) : (
              'AUTHORIZE & ADVANCE TO DOCTOR'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const Nurse_Dashboard = () => {
  useClinicalSocket(); 
  const { data: visitsData, isLoading, isFetching } = useVisits();
  const { data: recentVitals, isLoading: isLoadingRecent } = useRecentVitals();
  const [selectedVisit, setSelectedVisit] = useState<any>(null);

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
          <div className="flex items-center gap-3">
            <p className="mono-label text-clinical-blue mb-1 uppercase tracking-widest">Clinical Triage & Vitals</p>
            {isFetching && (
               <div className="flex items-center gap-1.5 px-2 py-0.5 bg-clinical-blue/10 border border-clinical-blue/20 rounded-full">
               <RefreshCw size={10} className="text-clinical-blue animate-spin" />
               <span className="text-[8px] font-bold text-clinical-blue uppercase tracking-tighter">Live Syncing</span>
             </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">Nursing Station</h1>
        </div>
        <div className="flex gap-3">
          <div className={`flex items-center gap-3 bg-surface-container-low px-4 py-2 border transition-all ${isFetching ? 'border-clinical-blue shadow-[0_0_15px_rgba(0,183,255,0.1)]' : 'border-white/5'}`}>
            <Search size={14} className="text-on-surface-variant" />
            <input
              type="text"
              placeholder="SCAN PATIENT ID..."
              className="bg-transparent border-none outline-none text-[10px] font-bold text-white placeholder:text-on-surface-variant/50 w-48"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "WAITING FOR VITALS", count: stats.waitingForVitals, color: "text-yellow-400", icon: Clock },
          { label: "READY FOR DOCTOR", count: stats.readyForDoctor, color: "text-green-400", icon: CheckCircle2 },
          { label: "IN CLINICAL REVIEW", count: stats.inProgress, color: "text-clinical-blue", icon: Stethoscope },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-low p-6 border-none relative overflow-hidden group">
            <div className="flex items-center gap-2">
              <stat.icon size={14} className={stat.color} />
              <span className="mono-label text-on-surface-variant text-[10px] tracking-widest">{stat.label}</span>
            </div>
            <p className="text-4xl font-bold text-white data-value mt-2">{isLoading ? "..." : stat.count}</p>
            <div className={`absolute bottom-0 left-0 h-0.5 bg-current opacity-20 transition-all group-hover:opacity-50 ${stat.color}`} style={{ width: '100%' }} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Clinical Queue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2 uppercase tracking-widest">
                <ClipboardList size={16} className="text-clinical-blue" />
                Active Clinical Queue
              </h2>
              <span className="data-value text-[10px] text-clinical-blue font-bold tracking-widest uppercase">
                {activeVisits.length} Records Active
              </span>
            </div>

            <div className="space-y-3 relative">
               <AnimatePresence>
                {isFetching && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-1 left-0 h-[1px] bg-clinical-blue z-20 shadow-[0_0_8px_#00b7ff]"
                  />
                )}
              </AnimatePresence>

              {isLoading ? (
                <div className="p-20 text-center border border-dashed border-white/5 bg-surface-container-low/30">
                  <Loader2 size={24} className="animate-spin mx-auto text-clinical-blue mb-4" />
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Synchronizing Clinical Feed...</p>
                </div>
              ) : activeVisits.length > 0 ? (
                activeVisits.map((visit) => {
                  const isWaiting = visit.queueEntry?.status === 'WAITING_FOR_VITALS';
                  return (
                    <div
                      key={visit.id}
                      className={`bg-surface-container-low p-4 flex items-center justify-between group transition-all border border-white/5 border-l-2 ${
                        isWaiting ? 'border-l-yellow-400 hover:bg-yellow-400/[0.02]' : 'border-l-clinical-blue hover:bg-clinical-blue/[0.02]'
                      }`}
                    >
                      <div className="flex gap-6 items-center">
                        <div className={`data-value text-[10px] w-16 font-bold ${isWaiting ? 'text-yellow-400' : 'text-clinical-blue'}`}>
                          {new Date(visit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white transition-colors uppercase">
                            {visit.patient?.firstName} {visit.patient?.lastName}
                          </h3>
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">
                            Visit: {visit.id.slice(-6).toUpperCase()} • {visit.queueEntry?.status?.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {isWaiting && (
                          <button 
                            onClick={() => setSelectedVisit(visit)}
                            className="flex items-center gap-2 bg-yellow-400/5 border border-yellow-400/20 px-4 py-2 text-[10px] font-bold text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all uppercase tracking-tighter"
                          >
                            <Activity size={14} />
                            Capture Vitals
                          </button>
                        )}
                        {!isWaiting && (
                           <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-sm">
                             <CheckCircle2 size={12} className="text-green-400" />
                             <span className="text-[9px] font-bold text-green-400 uppercase tracking-tighter">Ready</span>
                           </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-20 text-center border border-dashed border-white/5 bg-surface-container-low/10">
                  <AlertCircle size={24} className="mx-auto text-on-surface-variant mb-3 opacity-20" />
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">Queue Clear — Clinical Station Standby</p>
                </div>
              )}
            </div>
          </div>

          {/* Real-time Activity Feed */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2 uppercase tracking-widest">
              <RefreshCw size={16} className="text-green-500" />
              Recent Clinical Activity
            </h2>
            <div className="space-y-2">
              {isLoadingRecent ? (
                <div className="h-20 bg-surface-container-low border border-white/5 animate-pulse" />
              ) : recentVitals && recentVitals.length > 0 ? (
                recentVitals.map((v: any) => (
                  <div key={v.id} className="bg-surface-container-low/50 p-4 border border-white/5 flex items-center justify-between group">
                    <div className="flex gap-4 items-center">
                      <div className="w-8 h-8 rounded-sm bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                         <Droplets size={14} className="text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white uppercase">{v.visit?.patient?.firstName} {v.visit?.patient?.lastName}</p>
                        <p className="text-[8px] text-on-surface-variant uppercase data-value">
                          Recorded: {new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6 text-[10px] font-bold text-on-surface-variant data-value">
                      <div className="flex items-center gap-1.5">
                        <Zap size={10} className="text-yellow-400" />
                        <span>{v.systolicBP}/{v.diastolicBP}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Activity size={10} className="text-clinical-blue" />
                        <span>{v.heartRate} BPM</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Thermometer size={10} className="text-red-400" />
                        <span>{v.temperatureCelsius}°C</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-surface-container-low border border-white/5 p-8 text-center">
                   <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">No clinical recordings yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container-low border border-white/5 p-6 space-y-6">
            <h2 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Station Analytics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold">Facility Throughput</span>
                <span className="text-xl font-bold text-white data-value">92%</span>
              </div>
              <div className="h-1 bg-background w-full overflow-hidden rounded-full">
                <div className="h-full bg-green-500 w-[92%]" />
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase">Clinical Sync</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-green-400 font-bold uppercase tracking-tighter">Connected</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-clinical-blue/5 border border-clinical-blue/10 p-4">
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw size={16} className="text-clinical-blue" />
              <span className="text-[10px] font-bold text-clinical-blue uppercase tracking-widest">Auto-Queue Active</span>
            </div>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              Patients automatically advance to Doctor Review upon successful vital capture.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedVisit && (
          <VitalsCaptureModal 
            visit={selectedVisit} 
            onClose={() => setSelectedVisit(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Nurse_Dashboard;
