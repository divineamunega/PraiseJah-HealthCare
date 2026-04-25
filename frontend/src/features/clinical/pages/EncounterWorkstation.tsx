import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { 
  Activity, 
  ChevronLeft, 
  Clock, 
  Stethoscope, 
  Zap, 
  CheckCircle2, 
  Pill, 
  Microscope,
  Thermometer,
  RefreshCw,
  MoreVertical,
  Loader2,
  AlertCircle,
  FileText,
  CloudSync,
} from "lucide-react";
import { useVisit, useCompleteVisit } from "../hooks/useVisits";
import { useNotes, useCreateNote } from "../hooks/useNotes";
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
  
  const { data: visit, isLoading: isLoadingVisit } = useVisit(visitId!);
  const { data: existingNote, isLoading: isLoadingNote } = useNotes(visitId!);
  
  const createNote = useCreateNote();
  const completeVisit = useCompleteVisit();
  
  const [activeTab, setActiveTab] = useState<'DOCUMENTATION' | 'DIAGNOSTICS' | 'PHARMACY'>('DOCUMENTATION');
  
  // SOAP Note State
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [soap, setSoap] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: ""
  });

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initial Data Population
  useEffect(() => {
    if (existingNote && !Array.isArray(existingNote)) {
      setChiefComplaint((existingNote as any).chiefComplaint || "");
      
      // Extract SOAP parts from content string
      const content = (existingNote as any).content || "";
      const subjectiveMatch = content.match(/\[SUBJECTIVE\]\n([\s\S]*?)\n\n\[OBJECTIVE\]/);
      const objectiveMatch = content.match(/\[OBJECTIVE\]\n([\s\S]*?)\n\n\[ASSESSMENT\]/);
      const assessmentMatch = content.match(/\[ASSESSMENT\]\n([\s\S]*?)\n\n\[PLAN\]/);
      const planMatch = content.match(/\[PLAN\]\n([\s\S]*)/);

      setSoap({
        subjective: subjectiveMatch ? subjectiveMatch[1] : "",
        objective: objectiveMatch ? objectiveMatch[1] : "",
        assessment: assessmentMatch ? assessmentMatch[1] : "",
        plan: planMatch ? planMatch[1] : ""
      });
    }
  }, [existingNote]);

  // Real-time Auto-save Logic (Debounced)
  useEffect(() => {
    if (!visitId || isLoadingNote) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      const content = `[SUBJECTIVE]\n${soap.subjective}\n\n[OBJECTIVE]\n${soap.objective}\n\n[ASSESSMENT]\n${soap.assessment}\n\n[PLAN]\n${soap.plan}`;
      
      if (chiefComplaint || soap.subjective || soap.objective || soap.assessment || soap.plan) {
        await createNote.mutateAsync({
          visitId,
          chiefComplaint,
          content
        });
      }
    }, 1500); // Auto-save 1.5s after typing stops

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [chiefComplaint, soap, visitId, isLoadingNote]);

  const handleFinish = async () => {
    if (!visitId) return;
    await completeVisit.mutateAsync(visitId, {
      onSuccess: () => navigate('/doctor')
    });
  };

  if (isLoadingVisit) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 size={32} className="text-clinical-blue animate-spin" />
        <p className="mono-label text-[10px] text-on-surface-variant uppercase tracking-[0.3em]">Synchronizing Clinical Environment...</p>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center space-y-6">
        <AlertCircle size={48} className="text-red-400 opacity-20" />
        <div className="text-center">
          <h2 className="text-white font-bold uppercase tracking-widest">Encounter Reference Invalid</h2>
          <button onClick={() => navigate('/doctor')} className="mt-4 text-clinical-blue text-[10px] font-bold uppercase hover:underline border border-clinical-blue/20 px-4 py-2 hover:bg-clinical-blue/5 transition-all">Return to Cockpit</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden animate-in fade-in duration-500">
      {/* Top Clinical Bar */}
      <header className="h-20 bg-surface-container-low border-b border-white/5 flex items-center px-8 shrink-0 relative z-30 shadow-xl">
        <div className="flex items-center gap-6 flex-1">
          <button onClick={() => navigate('/doctor')} className="p-2 hover:bg-white/5 rounded-full text-on-surface-variant hover:text-white transition-all">
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-4 border-l border-white/10 pl-6">
             <div className="w-10 h-10 bg-background border border-white/5 flex items-center justify-center text-sm font-bold text-clinical-blue shadow-inner uppercase">
                {visit.patient?.firstName?.[0]}{visit.patient?.lastName?.[0]}
             </div>
             <div>
                <h1 className="text-xl font-bold text-white tracking-tighter uppercase leading-none mb-1">
                   {visit.patient?.firstName} {visit.patient?.lastName}
                </h1>
                <div className="flex items-center gap-3 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest font-mono">
                   <span className="bg-clinical-blue/10 text-clinical-blue px-1.5 py-0.5 rounded-sm border border-clinical-blue/20">PX-{visit.patient?.id?.slice(-6).toUpperCase()}</span>
                   <span>{visit.patient?.sex}</span>
                   <span className="text-white/20">•</span>
                   <span>{calculateAge(visit.patient?.dateOfBirth)} YRS</span>
                   <span className="text-white/20">•</span>
                   <span className="text-green-400 flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                      Session Active
                   </span>
                </div>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3 px-4 py-2 bg-background/50 border border-white/5 rounded-sm">
              <CloudSync size={16} className={createNote.isPending ? "text-clinical-blue animate-spin" : "text-green-400 opacity-50"} />
              <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                 {createNote.isPending ? 'Auto-Saving...' : 'Chart Synced'}
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
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Simplified Sidebar: Vitals Only */}
        <aside className="w-80 bg-surface-container-lowest border-r border-white/5 overflow-y-auto shrink-0 p-6 space-y-8 custom-scrollbar">
           <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] flex items-center gap-2">
                 <Activity size={12} className="text-clinical-blue" />
                 Triage Vitals
              </h3>
              {visit.vitals && visit.vitals.length > 0 ? (
                 <div className="space-y-2">
                    {[
                      { label: 'Pressure', value: `${visit.vitals[0].systolicBP}/${visit.vitals[0].diastolicBP}`, unit: 'mmHg', icon: Activity, color: 'text-yellow-400' },
                      { label: 'Pulse', value: visit.vitals[0].heartRate, unit: 'BPM', icon: Activity, color: 'text-clinical-blue' },
                      { label: 'Temp', value: visit.vitals[0].temperatureCelsius, unit: '°C', icon: Thermometer, color: 'text-red-400' },
                      { label: 'Resp.', value: visit.vitals[0].respiratoryRate, unit: 'BPM', icon: RefreshCw, color: 'text-green-400' },
                      { label: 'Weight', value: visit.vitals[0].weightKg, unit: 'KG', icon: Weight, color: 'text-on-surface-variant' },
                    ].map(v => (
                       <div key={v.label} className="bg-surface-container-low border border-white/5 p-3 flex justify-between items-center group">
                          <div>
                             <p className="text-[7px] text-on-surface-variant uppercase font-bold opacity-60">{v.label}</p>
                             <p className="text-sm font-bold text-white data-value">{v.value || '--'} <span className="text-[8px] font-normal text-on-surface-variant">{v.unit}</span></p>
                          </div>
                          <v.icon size={14} className={`${v.color} opacity-20 group-hover:opacity-100 transition-opacity`} />
                       </div>
                    ))}
                 </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-white/5 opacity-50">
                   <p className="text-[8px] text-on-surface-variant uppercase tracking-widest font-bold">Waiting for Triage</p>
                </div>
              )}
           </div>

           <div className="pt-6 border-t border-white/5 bg-clinical-blue/5 p-4 rounded-sm">
              <div className="flex items-center gap-3 mb-2">
                 <Zap size={14} className="text-clinical-blue" />
                 <span className="text-[9px] font-bold text-white uppercase tracking-widest">Encounter Active</span>
              </div>
              <p className="text-[9px] text-on-surface-variant leading-relaxed uppercase tracking-tighter font-bold">
                 System is monitoring inputs. Documentation is automatically persisted to the primary record.
              </p>
           </div>
        </aside>

        {/* Focused Documentation Workspace */}
        <main className="flex-1 flex flex-col bg-background relative overflow-hidden">
           <nav className="h-14 bg-surface-container-low/50 border-b border-white/5 flex items-center px-10 gap-12 shrink-0">
              {[
                { id: 'DOCUMENTATION', label: 'Clinical Documentation', icon: FileText },
                { id: 'DIAGNOSTICS', label: 'Investigation Orders', icon: Microscope },
                { id: 'PHARMACY', label: 'E-Prescription', icon: Pill },
              ].map(tab => (
                 <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`h-full flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative group ${
                    activeTab === tab.id ? 'text-clinical-blue' : 'text-on-surface-variant hover:text-white'
                  }`}
                 >
                    <tab.icon size={14} className={activeTab === tab.id ? 'text-clinical-blue' : 'text-on-surface-variant opacity-40'} />
                    {tab.label}
                    {activeTab === tab.id && (
                       <motion.div layoutId="active-encounter-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-clinical-blue shadow-[0_0_12px_rgba(0,183,255,0.4)]" />
                    )}
                 </button>
              ))}
           </nav>

           <div className="flex-1 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {activeTab === 'DOCUMENTATION' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="p-10 max-w-5xl mx-auto space-y-10"
                  >
                    <section className="space-y-4">
                       <h4 className="text-[10px] font-bold text-clinical-blue uppercase tracking-[0.4em] flex items-center gap-3">
                          <Zap size={14} className="text-yellow-400" />
                          Chief Complaint
                       </h4>
                       <input 
                         type="text"
                         placeholder="Why is the patient here today?"
                         className="w-full bg-surface-container-low border border-white/5 p-6 text-xl font-bold text-white outline-none focus:border-clinical-blue/30 transition-all placeholder:text-white/5 shadow-inner rounded-sm"
                         value={chiefComplaint}
                         onChange={e => setChiefComplaint(e.target.value)}
                       />
                    </section>

                    <div className="grid grid-cols-2 gap-10">
                       {[
                         { key: 'subjective', label: 'Subjective', sub: 'Symptoms & History' },
                         { key: 'objective', label: 'Objective', sub: 'Examination Findings' },
                         { key: 'assessment', label: 'Assessment', sub: 'Clinical Impressions' },
                         { key: 'plan', label: 'Plan', sub: 'Action & Treatment' },
                       ].map(field => (
                          <section key={field.key} className="space-y-4">
                             <div className="flex flex-col gap-1">
                                <h4 className="text-[10px] font-bold text-clinical-blue uppercase tracking-[0.3em]">{field.label}</h4>
                                <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">{field.sub}</p>
                             </div>
                             <textarea 
                               placeholder={`Enter ${field.label.toLowerCase()} details...`}
                               className="w-full bg-surface-container-low border border-white/5 p-6 text-white text-sm min-h-[250px] outline-none focus:border-clinical-blue/30 transition-all leading-relaxed placeholder:text-white/5 custom-scrollbar shadow-inner rounded-sm"
                               value={(soap as any)[field.key]}
                               onChange={e => setSoap(s => ({ ...s, [field.key]: e.target.value }))}
                             />
                          </section>
                       ))}
                    </div>
                  </motion.div>
                )}

                {activeTab !== 'DOCUMENTATION' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center opacity-10 space-y-4 py-40"
                  >
                    <AlertCircle size={48} className="text-on-surface-variant" />
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Sub-Module Under Maintenance</p>
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
