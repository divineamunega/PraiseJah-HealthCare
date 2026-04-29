import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ChevronLeft,
  User,
  Calendar,
  Activity,
  FileText,
  Pill,
  Microscope,
  Clock,
  ExternalLink,
  Shield,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LabResultSummary } from "../components/LabResultSummary";
import { X } from "lucide-react";
import { usePatientHistory } from "../hooks/usePatients";

const LabResultsModal = ({ 
  order, 
  onClose 
}: { 
  order: any; 
  onClose: () => void 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-surface-container-low border border-white/5 p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="px-2 py-0.5 bg-clinical-blue/10 border border-clinical-blue/20 rounded-full text-[8px] font-bold text-clinical-blue uppercase tracking-tighter">
              Diagnostic Report
            </span>
            <span className="text-[10px] text-on-surface-variant data-value uppercase">
              ID: {order.id.slice(-8).toUpperCase()}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">
            {order.testName}
          </h2>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
            Ordered on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <LabResultSummary
          testName={order.testName}
          results={order.results || order.result}
        />
        
        {order.notes && (
          <div className="mt-8 pt-6 border-t border-white/5">
            <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Clinical Notes</h3>
            <p className="text-sm text-white leading-relaxed">{order.notes}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const ClinicalNoteModal = ({ 
  note, 
  onClose 
}: { 
  note: any; 
  onClose: () => void 
}) => {
  // Simple parser for the SOAP format we use in useAutosaveSOAP
  const parseSoap = (content: string) => {
    const sections = {
      subjective: content.match(/\[SUBJECTIVE\]\n([\s\S]*?)(?=\n\n\[|$)/)?.[1] || "",
      objective: content.match(/\[OBJECTIVE\]\n([\s\S]*?)(?=\n\n\[|$)/)?.[1] || "",
      assessment: content.match(/\[ASSESSMENT\]\n([\s\S]*?)(?=\n\n\[|$)/)?.[1] || "",
      plan: content.match(/\[PLAN\]\n([\s\S]*?)(?=\n\n\[|$)/)?.[1] || "",
    };
    return sections;
  };

  const soap = parseSoap(note.content || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-surface-container-low border border-white/5 p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-8 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-clinical-blue/10 border border-clinical-blue/20 rounded-full text-[8px] font-bold text-clinical-blue uppercase tracking-tighter">
              Clinical Documentation
            </span>
            <span className="text-[10px] text-on-surface-variant data-value uppercase">
              Version: {note.version}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter flex items-center gap-3">
            <FileText size={24} className="text-clinical-blue" />
            Encounter Note
          </h2>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
            Authored on {new Date(note.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="space-y-8">
          {note.chiefComplaint && (
            <section className="bg-clinical-blue/5 p-6 border border-clinical-blue/10">
              <h3 className="text-[10px] font-bold text-clinical-blue uppercase tracking-[0.3em] mb-3">Chief Complaint</h3>
              <p className="text-lg font-bold text-white tracking-tight">{note.chiefComplaint}</p>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { label: "Subjective", content: soap.subjective, sub: "Symptoms & History" },
              { label: "Objective", content: soap.objective, sub: "Examination Findings" },
              { label: "Assessment", content: soap.assessment, sub: "Clinical Impressions" },
              { label: "Plan", content: soap.plan, sub: "Action & Treatment" },
            ].map((section) => (
              <section key={section.label} className="space-y-3">
                <div className="flex flex-col">
                  <h4 className="text-[10px] font-bold text-clinical-blue uppercase tracking-widest">{section.label}</h4>
                  <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-tighter">{section.sub}</p>
                </div>
                <div className="bg-background/50 border border-white/5 p-4 min-h-[100px]">
                  <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                    {section.content.trim() || "—"}
                  </p>
                </div>
              </section>
            ))}
          </div>

          {!soap.subjective && !soap.objective && !soap.assessment && !soap.plan && note.content && (
            <section className="space-y-3">
              <h4 className="text-[10px] font-bold text-clinical-blue uppercase tracking-widest">Note Content</h4>
              <div className="bg-background/50 border border-white/5 p-4">
                <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{note.content}</p>
              </div>
            </section>
          )}
        </div>
      </motion.div>
    </div>
  );
};

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

const PatientProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: patient, isLoading, isFetching } = usePatientHistory(id!);

  const [activeTab, setActiveTab] = useState<"VISITS" | "VITALS" | "LABS" | "PX">("VISITS");
  const [selectedLabOrder, setSelectedLabOrder] = useState<any>(null);
  const [selectedNote, setSelectedNote] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center">
        <Loader2 size={40} className="text-clinical-blue animate-spin mb-4" />
        <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.4em] font-bold">
          Accessing Clinical Archives...
        </p>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header / Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Back to Registry</span>
        </button>

        {isFetching && (
          <div className="flex items-center gap-2 px-3 py-1 bg-clinical-blue/10 border border-clinical-blue/20 rounded-full">
            <RefreshCw size={12} className="text-clinical-blue animate-spin" />
            <span className="text-[8px] font-bold text-clinical-blue uppercase tracking-widest">Syncing Records</span>
          </div>
        )}
      </div>

      {/* Patient Summary Card */}
      <div className="bg-surface-container-low border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <User size={120} />
        </div>
        
        <div className="p-8 flex flex-col md:flex-row gap-10 items-start md:items-center">
          <div className="w-24 h-24 bg-background border border-white/10 flex items-center justify-center text-3xl font-bold text-clinical-blue shadow-inner">
            {patient.firstName?.[0]}{patient.lastName?.[0]}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="px-2 py-0.5 bg-clinical-blue/20 text-clinical-blue text-[8px] font-bold uppercase tracking-tighter border border-clinical-blue/20">
                  Patient Profile
                </span>
                <span className="text-[10px] text-on-surface-variant font-bold data-value uppercase tracking-widest">
                  PX-{patient.id.slice(-8).toUpperCase()}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tighter uppercase leading-tight">
                {patient.firstName} {patient.lastName}
              </h1>
            </div>

            <div className="flex flex-wrap gap-8">
              <div className="space-y-1">
                <p className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest">GENDER</p>
                <p className="text-sm font-bold text-white">{patient.sex}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest">AGE</p>
                <p className="text-sm font-bold text-white">{calculateAge(patient.dateOfBirth)} YRS</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest">DOB</p>
                <p className="text-sm font-bold text-white">
                  {new Date(patient.dateOfBirth).toLocaleDateString([], { dateStyle: 'long' })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest">CONTACT</p>
                <p className="text-sm font-bold text-white">{patient.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-10 border-b border-white/5 px-4">
        {[
          { id: "VISITS", label: "Visit History", icon: Calendar },
          { id: "VITALS", label: "Vitals Log", icon: Activity },
          { id: "LABS", label: "Laboratory", icon: Microscope },
          { id: "PX", label: "Prescriptions", icon: Pill },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2.5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${
              activeTab === tab.id ? "text-clinical-blue" : "text-on-surface-variant hover:text-white"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-clinical-blue shadow-[0_0_8px_#00b7ff]" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === "VISITS" && (
            <motion.div
              key="visits"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {patient.visits?.length > 0 ? (
                patient.visits.map((visit: any) => (
                  <div key={visit.id} className="bg-surface-container-low border border-white/5 p-6 flex items-center justify-between group hover:border-clinical-blue/30 transition-all">
                    <div className="flex gap-8 items-center">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-clinical-blue data-value">
                          {new Date(visit.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit' })}
                        </p>
                        <p className="text-[8px] text-on-surface-variant font-bold">{new Date(visit.createdAt).getFullYear()}</p>
                      </div>
                      
                      <div className="h-10 w-px bg-white/5" />

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 border uppercase tracking-tighter ${
                            visit.status === 'COMPLETED' ? 'border-green-500/30 text-green-400' : 'border-yellow-400/30 text-yellow-400'
                          }`}>
                            {visit.status}
                          </span>
                          <span className="text-[10px] font-bold text-white uppercase tracking-tight">
                            Routine Consultation
                          </span>
                        </div>
                        <p className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">
                          Clinician: Dr. {visit.doctor?.firstName} {visit.doctor?.lastName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {visit.clinicalNotes?.length > 0 ? (
                        <button 
                          onClick={() => setSelectedNote(visit.clinicalNotes[0])}
                          className="flex items-center gap-2 px-4 py-2 bg-clinical-blue/10 border border-clinical-blue/30 text-clinical-blue text-[10px] font-bold uppercase tracking-widest hover:bg-clinical-blue hover:text-white transition-all shadow-lg shadow-clinical-blue/5"
                        >
                          <FileText size={14} />
                          Read Encounter Note
                        </button>
                      ) : (
                        <span className="text-[8px] text-on-surface-variant uppercase font-bold tracking-widest opacity-30">
                          No Documentation
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center border border-dashed border-white/5 opacity-50">
                  <Clock size={32} className="mx-auto mb-4" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No previous visits recorded</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "VITALS" && (
            <motion.div
              key="vitals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patient.visits?.flatMap((v: any) => v.vitals || []).map((vital: any) => (
                  <div key={vital.id} className="bg-surface-container-low border border-white/5 p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-clinical-blue" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Clinical Snapshot</span>
                      </div>
                      <span className="text-[9px] text-on-surface-variant font-bold data-value uppercase">
                        {new Date(vital.recordedAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <p className="text-[8px] text-on-surface-variant uppercase font-bold tracking-tighter opacity-60">Blood Pressure</p>
                        <p className="text-lg font-bold text-white data-value">{vital.systolicBP}/{vital.diastolicBP}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] text-on-surface-variant uppercase font-bold tracking-tighter opacity-60">Heart Rate</p>
                        <p className="text-lg font-bold text-white data-value">{vital.heartRate} <span className="text-[8px] font-normal">BPM</span></p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] text-on-surface-variant uppercase font-bold tracking-tighter opacity-60">Temp</p>
                        <p className="text-lg font-bold text-white data-value">{vital.temperatureCelsius}°C</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "LABS" && (
            <motion.div
              key="labs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-surface-container-low border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-background/50 border-b border-white/5">
                      <th className="px-6 py-4 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Test Name</th>
                      <th className="px-6 py-4 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Ordered On</th>
                      <th className="px-6 py-4 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {patient.visits?.flatMap((v: any) => v.labOrders || []).map((order: any) => {
                      const hasResults = !!(order.results || order.result);
                      return (
                        <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4 text-xs font-bold text-white uppercase tracking-tight">{order.testName}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 border uppercase tracking-tighter ${
                              order.status === 'COMPLETED' ? 'border-green-500/30 text-green-400' : 'border-yellow-400/30 text-yellow-400'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[10px] text-on-surface-variant data-value">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {hasResults ? (
                              <button 
                                onClick={() => setSelectedLabOrder(order)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[8px] font-bold uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all"
                              >
                                <ExternalLink size={12} />
                                Results Ready
                              </button>
                            ) : (
                              <span className="text-[8px] text-on-surface-variant uppercase font-bold tracking-widest">Pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === "PX" && (
            <motion.div
              key="px"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {patient.visits?.flatMap((v: any) => v.prescriptions || []).map((px: any) => (
                <div key={px.id} className="bg-surface-container-low border border-white/5 p-6 flex gap-4">
                  <div className="w-10 h-10 bg-clinical-blue/10 border border-clinical-blue/20 flex items-center justify-center shrink-0">
                    <Pill size={18} className="text-clinical-blue" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">{px.medication}</h4>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{px.dosage} • {px.frequency}</p>
                    <p className="text-[8px] text-on-surface-variant uppercase pt-2">Issued {new Date(px.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedLabOrder && (
          <LabResultsModal
            order={selectedLabOrder}
            onClose={() => setSelectedLabOrder(null)}
          />
        )}
        {selectedNote && (
          <ClinicalNoteModal
            note={selectedNote}
            onClose={() => setSelectedNote(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientProfilePage;
