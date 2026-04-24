import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  Activity, 
  ChevronLeft, 
  Clock, 
  Stethoscope, 
  ClipboardList, 
  Zap, 
  CheckCircle2, 
  Pill, 
  Microscope,
  Thermometer,
  RefreshCw,
  MoreVertical,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useVisit, useCompleteVisit } from "../hooks/useVisits";
import { useClinicalSocket } from "../hooks/useClinicalSocket";
import { motion, AnimatePresence } from "framer-motion";

const calculateAge = (dob: string | undefined) => {
  if (!dob) return "??";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const EncounterWorkstation = () => {
  const { visitId } = useParams();
  const navigate = useNavigate();
  useClinicalSocket();
  
  const { data: visit, isLoading } = useVisit(visitId!);
  const completeVisit = useCompleteVisit();
  
  const [activeTab, setActiveTab] = useState<'DOCUMENTATION' | 'DIAGNOSTICS' | 'PHARMACY'>('DOCUMENTATION');

  const handleFinish = async () => {
    if (!visitId) return;
    await completeVisit.mutateAsync(visitId, {
      onSuccess: () => navigate('/doctor')
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 size={32} className="text-clinical-blue animate-spin" />
        <p className="mono-label text-[10px] text-on-surface-variant uppercase tracking-[0.3em]">Initializing Clinical Environment...</p>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center space-y-6">
        <AlertCircle size={48} className="text-red-400 opacity-20" />
        <div className="text-center">
          <h2 className="text-white font-bold uppercase tracking-widest">Clinical Record Not Found</h2>
          <button onClick={() => navigate('/doctor')} className="mt-4 text-clinical-blue text-[10px] font-bold uppercase hover:underline">Return to Cockpit</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden animate-in fade-in duration-500">
      {/* Top Clinical Bar */}
      <header className="h-20 bg-surface-container-low border-b border-white/5 flex items-center px-8 shrink-0 relative z-30 shadow-xl">
        <div className="flex items-center gap-6 flex-1">
          <button 
            onClick={() => navigate('/doctor')}
            className="p-2 hover:bg-white/5 rounded-full text-on-surface-variant hover:text-white transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-4 border-l border-white/10 pl-6">
             <div className="w-10 h-10 bg-background border border-white/5 flex items-center justify-center text-sm font-bold text-clinical-blue shadow-inner">
                {visit.patient?.firstName?.[0]}{visit.patient?.lastName?.[0]}
             </div>
             <div>
                <h1 className="text-xl font-bold text-white tracking-tighter uppercase leading-none mb-1">
                   {visit.patient?.firstName} {visit.patient?.lastName}
                </h1>
                <div className="flex items-center gap-3 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                   <span className="bg-clinical-blue/10 text-clinical-blue px-1.5 py-0.5 rounded-sm">PX-{visit.patient?.id?.slice(-6).toUpperCase()}</span>
                   <span>{visit.patient?.sex}</span>
                   <span>•</span>
                   <span>{calculateAge(visit.patient?.dateOfBirth)} YRS</span>
                   <span>•</span>
                   <span className="text-green-400">ENCOUNTER ACTIVE</span>
                </div>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="text-right mr-4 border-r border-white/10 pr-6">
              <p className="text-[8px] text-on-surface-variant font-bold uppercase tracking-tighter">Session Duration</p>
              <p className="data-value text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 justify-end">
                 <Clock size={12} className="text-clinical-blue" />
                 12:45
              </p>
           </div>
           <button 
             onClick={handleFinish}
             disabled={completeVisit.isPending}
             className="bg-green-500 px-6 py-3 text-[10px] font-bold text-white hover:bg-green-400 transition-all flex items-center gap-3 shadow-lg shadow-green-500/10 uppercase tracking-widest"
           >
             {completeVisit.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={16} />}
             Authorize & Complete
           </button>
           <button className="p-3 bg-white/5 border border-white/5 text-on-surface-variant hover:text-white transition-all">
              <MoreVertical size={18} />
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Clinical Summary & History */}
        <aside className="w-80 bg-surface-container-lowest border-r border-white/5 overflow-y-auto shrink-0 p-6 space-y-8">
           <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-2">
                 <Activity size={12} className="text-clinical-blue" />
                 Triage Vitals
              </h3>
              {visit.vitals?.[0] ? (
                 <div className="space-y-2">
                    {[
                      { label: 'Pressure', value: `${visit.vitals[0].systolicBP}/${visit.vitals[0].diastolicBP}`, unit: 'mmHg', icon: Activity, color: 'text-yellow-400' },
                      { label: 'Pulse', value: visit.vitals[0].heartRate, unit: 'BPM', icon: Activity, color: 'text-clinical-blue' },
                      { label: 'Temp', value: visit.vitals[0].temperatureCelsius, unit: '°C', icon: Thermometer, color: 'text-red-400' },
                      { label: 'Resp.', value: visit.vitals[0].respiratoryRate, unit: 'BPM', icon: RefreshCw, color: 'text-green-400' },
                    ].map(v => (
                       <div key={v.label} className="bg-background/40 border border-white/5 p-3 flex justify-between items-center group">
                          <div>
                             <p className="text-[7px] text-on-surface-variant uppercase font-bold opacity-60">{v.label}</p>
                             <p className="text-sm font-bold text-white data-value">{v.value} <span className="text-[8px] font-normal text-on-surface-variant">{v.unit}</span></p>
                          </div>
                          <v.icon size={14} className={`${v.color} opacity-20`} />
                       </div>
                    ))}
                 </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-white/5 opacity-50">
                   <p className="text-[8px] text-on-surface-variant uppercase tracking-widest">No Triage Data</p>
                </div>
              )}
           </div>

           <div className="pt-6 border-t border-white/5 space-y-4">
              <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Encounter Roadmap</h3>
              <div className="space-y-3">
                 {[
                   { label: 'Patient Triage', status: 'COMPLETE', icon: CheckCircle2, active: false },
                   { label: 'Clinical Assessment', status: 'IN PROGRESS', icon: Stethoscope, active: true },
                   { label: 'Order Execution', status: 'PENDING', icon: Zap, active: false },
                   { label: 'Final Clearance', status: 'PENDING', icon: CheckCircle2, active: false },
                 ].map(step => (
                    <div key={step.label} className={`flex items-start gap-3 p-3 transition-colors ${step.active ? 'bg-clinical-blue/5 border-l-2 border-clinical-blue' : 'opacity-40'}`}>
                       <step.icon size={14} className={step.active ? 'text-clinical-blue' : 'text-on-surface-variant'} />
                       <div>
                          <p className={`text-[10px] font-bold uppercase tracking-tight ${step.active ? 'text-white' : 'text-on-surface-variant'}`}>{step.label}</p>
                          <p className="text-[7px] font-bold uppercase text-clinical-blue/60">{step.status}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 flex flex-col bg-background relative overflow-hidden">
           {/* Workstation Tabs */}
           <nav className="h-14 bg-surface-container-low/50 border-b border-white/5 flex items-center px-8 gap-10">
              {[
                { id: 'DOCUMENTATION', label: 'Clinical Notes', icon: ClipboardList },
                { id: 'DIAGNOSTICS', label: 'Lab & Imaging', icon: Microscope },
                { id: 'PHARMACY', label: 'Medications', icon: Pill },
              ].map(tab => (
                 <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`h-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-all relative group ${
                    activeTab === tab.id ? 'text-clinical-blue' : 'text-on-surface-variant hover:text-white'
                  }`}
                 >
                    <tab.icon size={14} />
                    {tab.label}
                    {activeTab === tab.id && (
                       <motion.div layoutId="active-encounter-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-clinical-blue shadow-[0_0_8px_#00b7ff]" />
                    )}
                 </button>
              ))}
           </nav>

           <div className="flex-1 p-10 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'DOCUMENTATION' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="max-w-4xl mx-auto space-y-10"
                  >
                    <section className="space-y-4">
                       <h4 className="text-[10px] font-bold text-clinical-blue uppercase tracking-[0.3em]">Assessment Documentation</h4>
                       <textarea 
                         placeholder="Enter clinical assessment notes..."
                         className="w-full bg-surface-container-low border border-white/5 p-6 text-white text-sm min-h-[400px] outline-none focus:border-clinical-blue/30 transition-all leading-relaxed placeholder:text-white/10"
                       />
                    </section>
                  </motion.div>
                )}
                
                {activeTab !== 'DOCUMENTATION' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center opacity-20 space-y-4"
                  >
                    <AlertCircle size={48} className="text-on-surface-variant" />
                    <div className="text-center space-y-2">
                       <p className="text-xs font-bold text-white uppercase tracking-[0.3em]">Infrastructure Pending</p>
                       <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Order transmission and fulfillment module is currently offline</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </main>
      </div>
    </div>
  );
};

export default EncounterWorkstation;
