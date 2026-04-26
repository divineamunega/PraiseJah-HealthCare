import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Activity,
  ChevronLeft,
  Zap,
  CheckCircle2,
  Pill,
  Microscope,
  Thermometer,
  RefreshCw,
  Weight,
  Loader2,
  AlertCircle,
  FileText,
  CloudSync,
  AlertTriangle,
  Plus,
  Beaker,
} from "lucide-react";
import { useVisit, useCompleteVisit } from "../hooks/useVisits";
import { useNotes } from "../hooks/useNotes";
import { useLabs, useCreateLabOrder } from "../hooks/useLabs";
import {
  usePrescriptions,
  useCreatePrescription,
} from "../hooks/usePrescriptions";
import { useClinicalSocket } from "../hooks/useClinicalSocket";
import { useAutosaveSOAP, type SoapData } from "../hooks/useAutosaveSOAP";
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

// Format time for display
const formatLastSaved = (date: Date | null): string => {
  if (!date) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  return date.toLocaleTimeString();
};

const EncounterWorkstation = () => {
  const { visitId } = useParams();
  const navigate = useNavigate();
  useClinicalSocket();

  const { data: visit, isLoading: isLoadingVisit } = useVisit(visitId!);
  const { data: existingNote } = useNotes(visitId!);

  const completeVisit = useCompleteVisit();

  const [activeTab, setActiveTab] = useState<
    "DOCUMENTATION" | "LAB_ORDERS" | "E_PRESCRIPTION"
  >("DOCUMENTATION");
  const [testName, setTestName] = useState("");

  const [prescriptionForm, setPrescriptionForm] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
  });

  const { data: labs, isLoading: isLoadingLabs } = useLabs(visitId!);
  const { data: prescriptions, isLoading: isLoadingPrescriptions } =
    usePrescriptions(visitId!);
  const createLabOrder = useCreateLabOrder();
  const createPrescription = useCreatePrescription();

  // SOAP Note State
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [soap, setSoap] = useState<
    Pick<SoapData, "subjective" | "objective" | "assessment" | "plan">
  >({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });

  // Build soapData for the autosave hook
  const soapData: SoapData = {
    chiefComplaint,
    subjective: soap.subjective,
    objective: soap.objective,
    assessment: soap.assessment,
    plan: soap.plan,
  };

  // Use the autosave hook
  const { state: autosaveState, saveNow } = useAutosaveSOAP({
    visitId: visitId || "",
    data: soapData,
    debounceMs: 1500,
    onError: (error) => {
      console.error("Autosave failed:", error.message);
    },
  });

  // Parse existing note content into SOAP fields
  useEffect(() => {
    if (existingNote && typeof existingNote === "object") {
      setChiefComplaint((existingNote as any).chiefComplaint || "");

      // Extract SOAP parts from content string
      const content = (existingNote as any).content || "";
      const subjectiveMatch = content.match(
        /\[SUBJECTIVE\]\n([\s\S]*?)\n\n\[OBJECTIVE\]/,
      );
      const objectiveMatch = content.match(
        /\[OBJECTIVE\]\n([\s\S]*?)\n\n\[ASSESSMENT\]/,
      );
      const assessmentMatch = content.match(
        /\[ASSESSMENT\]\n([\s\S]*?)\n\n\[PLAN\]/,
      );
      const planMatch = content.match(/\[PLAN\]\n([\s\S]*)/);

      setSoap({
        subjective: subjectiveMatch ? subjectiveMatch[1] : "",
        objective: objectiveMatch ? objectiveMatch[1] : "",
        assessment: assessmentMatch ? assessmentMatch[1] : "",
        plan: planMatch ? planMatch[1] : "",
      });
    }
  }, [existingNote]);

  // Get sync status display
  const getSyncDisplay = () => {
    switch (autosaveState.syncStatus) {
      case "saving":
        return {
          icon: <Loader2 size={16} className="animate-spin" />,
          text: "Auto-Saving...",
          color: "text-clinical-blue",
          bgColor: "bg-clinical-blue/10",
        };
      case "synced":
        return {
          icon: <CheckCircle2 size={16} className="text-green-400" />,
          text: autosaveState.lastSavedAt
            ? `Saved ${formatLastSaved(autosaveState.lastSavedAt)}`
            : "Chart Synced",
          color: "text-green-400",
          bgColor: "bg-green-400/10",
        };
      case "error":
        return {
          icon: <AlertTriangle size={16} className="text-red-400" />,
          text: "Sync Error",
          color: "text-red-400",
          bgColor: "bg-red-400/10",
        };
      default:
        return {
          icon: (
            <CloudSync
              size={16}
              className="text-on-surface-variant opacity-50"
            />
          ),
          text: "Ready",
          color: "text-on-surface-variant",
          bgColor: "bg-white/5",
        };
    }
  };

  const syncDisplay = getSyncDisplay();

  const handleRequestLab = async () => {
    if (!testName.trim() || !visitId) return;
    await createLabOrder.mutateAsync({
      visitId,
      testName: testName.trim(),
    });
    setTestName("");
  };

  const handleAddPrescription = async () => {
    const { medication, dosage, frequency, duration } = prescriptionForm;
    if (!medication.trim() || !dosage.trim() || !frequency.trim() || !visitId)
      return;

    await createPrescription.mutateAsync({
      visitId,
      medication: medication.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      duration: duration.trim() || undefined,
    });

    setPrescriptionForm({
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
    });
  };

  const handleFinish = async () => {
    if (!visitId) return;

    // Ensure any pending save is complete before finishing
    if (autosaveState.isSaving) {
      saveNow();
      // Wait a moment for save to complete
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    await completeVisit.mutateAsync(visitId, {
      onSuccess: () => navigate("/doctor"),
    });
  };

  if (isLoadingVisit) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 size={32} className="text-clinical-blue animate-spin" />
        <p className="mono-label text-[10px] text-on-surface-variant uppercase tracking-[0.3em]">
          Synchronizing Clinical Environment...
        </p>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center space-y-6">
        <AlertCircle size={48} className="text-red-400 opacity-20" />
        <div className="text-center">
          <h2 className="text-white font-bold uppercase tracking-widest">
            Encounter Reference Invalid
          </h2>
          <button
            onClick={() => navigate("/doctor")}
            className="mt-4 text-clinical-blue text-[10px] font-bold uppercase hover:underline border border-clinical-blue/20 px-4 py-2 hover:bg-clinical-blue/5 transition-all"
          >
            Return to Cockpit
          </button>
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
            onClick={() => navigate("/doctor")}
            className="p-2 hover:bg-white/5 rounded-full text-on-surface-variant hover:text-white transition-all"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-4 border-l border-white/10 pl-6">
            <div className="w-10 h-10 bg-background border border-white/5 flex items-center justify-center text-sm font-bold text-clinical-blue shadow-inner uppercase">
              {visit.patient?.firstName?.[0]}
              {visit.patient?.lastName?.[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tighter uppercase leading-none mb-1">
                {visit.patient?.firstName} {visit.patient?.lastName}
              </h1>
              <div className="flex items-center gap-3 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest font-mono">
                <span className="bg-clinical-blue/10 text-clinical-blue px-1.5 py-0.5 rounded-sm border border-clinical-blue/20">
                  PX-{visit.patient?.id?.slice(-6).toUpperCase()}
                </span>
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
          <div
            className={`flex items-center gap-3 px-4 py-2 ${syncDisplay.bgColor} border border-white/5 rounded-sm`}
          >
            {syncDisplay.icon}
            <p
              className={`text-[9px] font-bold ${syncDisplay.color} uppercase tracking-widest`}
            >
              {syncDisplay.text}
            </p>
          </div>

          <button
            onClick={handleFinish}
            disabled={completeVisit.isPending}
            className="bg-green-500 px-6 py-3 text-[10px] font-bold text-white hover:bg-green-400 transition-all flex items-center gap-3 shadow-lg shadow-green-500/10 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completeVisit.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
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
                  {
                    label: "Pressure",
                    value: `${visit.vitals[0].systolicBP}/${visit.vitals[0].diastolicBP}`,
                    unit: "mmHg",
                    icon: Activity,
                    color: "text-yellow-400",
                  },
                  {
                    label: "Pulse",
                    value: visit.vitals[0].heartRate,
                    unit: "BPM",
                    icon: Activity,
                    color: "text-clinical-blue",
                  },
                  {
                    label: "Temp",
                    value: visit.vitals[0].temperatureCelsius,
                    unit: "°C",
                    icon: Thermometer,
                    color: "text-red-400",
                  },
                  {
                    label: "Resp.",
                    value: visit.vitals[0].respiratoryRate,
                    unit: "BPM",
                    icon: RefreshCw,
                    color: "text-green-400",
                  },
                  {
                    label: "Weight",
                    value: visit.vitals[0].weightKg,
                    unit: "KG",
                    icon: Weight,
                    color: "text-on-surface-variant",
                  },
                ].map((v) => (
                  <div
                    key={v.label}
                    className="bg-surface-container-low border border-white/5 p-3 flex justify-between items-center group"
                  >
                    <div>
                      <p className="text-[7px] text-on-surface-variant uppercase font-bold opacity-60">
                        {v.label}
                      </p>
                      <p className="text-sm font-bold text-white data-value">
                        {v.value || "--"}{" "}
                        <span className="text-[8px] font-normal text-on-surface-variant">
                          {v.unit}
                        </span>
                      </p>
                    </div>
                    <v.icon
                      size={14}
                      className={`${v.color} opacity-20 group-hover:opacity-100 transition-opacity`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-white/5 opacity-50">
                <p className="text-[8px] text-on-surface-variant uppercase tracking-widest font-bold">
                  Waiting for Triage
                </p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/5 bg-clinical-blue/5 p-4 rounded-sm">
            <div className="flex items-center gap-3 mb-2">
              <Zap size={14} className="text-clinical-blue" />
              <span className="text-[9px] font-bold text-white uppercase tracking-widest">
                Encounter Active
              </span>
            </div>
            <p className="text-[9px] text-on-surface-variant leading-relaxed uppercase tracking-tighter font-bold">
              System is monitoring inputs. Documentation is automatically
              persisted to the primary record.
            </p>
          </div>
        </aside>

        {/* Focused Documentation Workspace */}
        <main className="flex-1 flex flex-col bg-background relative overflow-hidden">
          <nav className="h-14 bg-surface-container-low/50 border-b border-white/5 flex items-center px-10 gap-12 shrink-0">
            {[
              {
                id: "DOCUMENTATION",
                label: "Clinical Documentation",
                icon: FileText,
              },
              {
                id: "LAB_ORDERS",
                label: "Laboratory Requests",
                icon: Microscope,
              },
              { id: "E_PRESCRIPTION", label: "E-Prescription", icon: Pill },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`h-full flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative group ${
                  activeTab === tab.id
                    ? "text-clinical-blue"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                <tab.icon
                  size={14}
                  className={
                    activeTab === tab.id
                      ? "text-clinical-blue"
                      : "text-on-surface-variant opacity-40"
                  }
                />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-encounter-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-clinical-blue shadow-[0_0_12px_rgba(0,183,255,0.4)]"
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === "DOCUMENTATION" && (
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
                      onChange={(e) => setChiefComplaint(e.target.value)}
                    />
                  </section>

                  <div className="grid grid-cols-2 gap-10">
                    {[
                      {
                        key: "subjective",
                        label: "Subjective",
                        sub: "Symptoms & History",
                      },
                      {
                        key: "objective",
                        label: "Objective",
                        sub: "Examination Findings",
                      },
                      {
                        key: "assessment",
                        label: "Assessment",
                        sub: "Clinical Impressions",
                      },
                      { key: "plan", label: "Plan", sub: "Action & Treatment" },
                    ].map((field) => (
                      <section key={field.key} className="space-y-4">
                        <div className="flex flex-col gap-1">
                          <h4 className="text-[10px] font-bold text-clinical-blue uppercase tracking-[0.3em]">
                            {field.label}
                          </h4>
                          <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">
                            {field.sub}
                          </p>
                        </div>
                        <textarea
                          placeholder={`Enter ${field.label.toLowerCase()} details...`}
                          className="w-full bg-surface-container-low border border-white/5 p-6 text-white text-sm min-h-[250px] outline-none focus:border-clinical-blue/30 transition-all leading-relaxed placeholder:text-white/5 custom-scrollbar shadow-inner rounded-sm"
                          value={(soap as any)[field.key]}
                          onChange={(e) =>
                            setSoap((s) => ({
                              ...s,
                              [field.key]: e.target.value,
                            }))
                          }
                        />
                      </section>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "LAB_ORDERS" && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-10 max-w-5xl mx-auto space-y-10"
                >
                  <section className="space-y-6">
                    <div className="flex flex-col gap-1">
                      <h4 className="text-[10px] font-bold text-clinical-blue uppercase tracking-[0.4em] flex items-center gap-3">
                        <Beaker size={14} className="text-clinical-blue" />
                        New Lab Order
                      </h4>
                      <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">
                        Request diagnostic investigations for this patient
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <input
                        type="text"
                        placeholder="Enter test name (e.g. Full Blood Count, Malaria Parasite...)"
                        className="flex-1 bg-surface-container-low border border-white/5 p-4 text-white text-sm outline-none focus:border-clinical-blue/30 transition-all placeholder:text-white/5 shadow-inner rounded-sm"
                        value={testName}
                        onChange={(e) => setTestName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleRequestLab()
                        }
                      />
                      <button
                        onClick={handleRequestLab}
                        disabled={createLabOrder.isPending || !testName.trim()}
                        className="bg-clinical-blue px-6 py-4 text-[10px] font-bold text-background hover:bg-clinical-blue/90 transition-all flex items-center gap-3 shadow-lg shadow-clinical-blue/10 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {createLabOrder.isPending ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Plus size={16} />
                        )}
                        Request Lab Order
                      </button>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="flex flex-col gap-1">
                      <h4 className="text-[10px] font-bold text-clinical-blue uppercase tracking-[0.3em]">
                        Pending & Recent Orders
                      </h4>
                      <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">
                        Orders placed during this clinical session
                      </p>
                    </div>

                    <div className="space-y-3">
                      {isLoadingLabs ? (
                        <div className="p-12 flex flex-col items-center justify-center border border-dashed border-white/5 opacity-30 gap-4">
                          <Loader2 size={24} className="animate-spin" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">
                            Fetching Orders...
                          </p>
                        </div>
                      ) : labs && labs.length > 0 ? (
                        labs.map((order) => (
                          <div
                            key={order.id}
                            className="bg-surface-container-low border border-white/5 p-4 flex justify-between items-center group hover:border-clinical-blue/20 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 bg-background border border-white/5 flex items-center justify-center">
                                <Microscope
                                  size={14}
                                  className="text-clinical-blue/50"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white uppercase tracking-tight">
                                  {order.testName}
                                </p>
                                <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">
                                  Ordered{" "}
                                  {new Date(
                                    order.createdAt,
                                  ).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[8px] font-bold bg-yellow-400/10 text-yellow-400 px-2 py-1 border border-yellow-400/20 uppercase tracking-widest">
                                Pending Result
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-12 flex flex-col items-center justify-center border border-dashed border-white/5 opacity-30 gap-4">
                          <Microscope
                            size={32}
                            className="text-on-surface-variant"
                          />
                          <p className="text-[10px] font-bold uppercase tracking-widest">
                            No lab orders requested yet
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === "E_PRESCRIPTION" && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-10 max-w-5xl mx-auto space-y-10"
                >
                  <section className="space-y-6">
                    <div className="flex flex-col gap-1">
                      <h4 className="text-[10px] font-bold text-clinical-blue uppercase tracking-[0.4em] flex items-center gap-3">
                        <Pill size={14} className="text-clinical-blue" />
                        New Prescription
                      </h4>
                      <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">
                        Issue electronic medications for this patient
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                          Medication
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Paracetamol"
                          className="w-full bg-surface-container-low border border-white/5 p-4 text-white text-sm outline-none focus:border-clinical-blue/30 transition-all placeholder:text-white/5 shadow-inner rounded-sm"
                          value={prescriptionForm.medication}
                          onChange={(e) =>
                            setPrescriptionForm((p) => ({
                              ...p,
                              medication: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                          Dosage
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 500mg"
                          className="w-full bg-surface-container-low border border-white/5 p-4 text-white text-sm outline-none focus:border-clinical-blue/30 transition-all placeholder:text-white/5 shadow-inner rounded-sm"
                          value={prescriptionForm.dosage}
                          onChange={(e) =>
                            setPrescriptionForm((p) => ({
                              ...p,
                              dosage: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                          Frequency
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Twice Daily"
                          className="w-full bg-surface-container-low border border-white/5 p-4 text-white text-sm outline-none focus:border-clinical-blue/30 transition-all placeholder:text-white/5 shadow-inner rounded-sm"
                          value={prescriptionForm.frequency}
                          onChange={(e) =>
                            setPrescriptionForm((p) => ({
                              ...p,
                              frequency: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                          Duration (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 5 Days"
                          className="w-full bg-surface-container-low border border-white/5 p-4 text-white text-sm outline-none focus:border-clinical-blue/30 transition-all placeholder:text-white/5 shadow-inner rounded-sm"
                          value={prescriptionForm.duration}
                          onChange={(e) =>
                            setPrescriptionForm((p) => ({
                              ...p,
                              duration: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleAddPrescription}
                        disabled={
                          createPrescription.isPending ||
                          !prescriptionForm.medication.trim() ||
                          !prescriptionForm.dosage.trim() ||
                          !prescriptionForm.frequency.trim()
                        }
                        className="bg-clinical-blue px-6 py-4 text-[10px] font-bold text-background hover:bg-clinical-blue/90 transition-all flex items-center gap-3 shadow-lg shadow-clinical-blue/10 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {createPrescription.isPending ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Plus size={16} />
                        )}
                        Add Prescription
                      </button>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="flex flex-col gap-1">
                      <h4 className="text-[10px] font-bold text-clinical-blue uppercase tracking-[0.3em]">
                        Active Prescriptions
                      </h4>
                      <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">
                        Medications issued during this clinical session
                      </p>
                    </div>

                    <div className="space-y-3">
                      {isLoadingPrescriptions ? (
                        <div className="p-12 flex flex-col items-center justify-center border border-dashed border-white/5 opacity-30 gap-4">
                          <Loader2 size={24} className="animate-spin" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">
                            Fetching Prescriptions...
                          </p>
                        </div>
                      ) : prescriptions && prescriptions.length > 0 ? (
                        prescriptions.map((rx) => (
                          <div
                            key={rx.id}
                            className="bg-surface-container-low border border-white/5 p-4 flex justify-between items-center group hover:border-clinical-blue/20 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 bg-background border border-white/5 flex items-center justify-center">
                                <Pill
                                  size={14}
                                  className="text-clinical-blue/50"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white uppercase tracking-tight">
                                  {rx.medication}
                                </p>
                                <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">
                                  {rx.dosage} • {rx.frequency}{" "}
                                  {rx.duration ? `• ${rx.duration}` : ""}
                                </p>
                              </div>
                            </div>
                            <div className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">
                              Issued{" "}
                              {new Date(rx.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-12 flex flex-col items-center justify-center border border-dashed border-white/5 opacity-30 gap-4">
                          <Pill size={32} className="text-on-surface-variant" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">
                            No prescriptions added yet
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
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
