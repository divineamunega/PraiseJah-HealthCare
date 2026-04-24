import React, { useState } from "react";
import {
  UserPlus,
  Clock,
  Users,
  Search,
  Plus,
  X,
  Loader2,
  Activity,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePatients, useCreatePatient } from "../hooks/usePatients";
import { useClinicalSocket } from "../hooks/useClinicalSocket";
import { useCheckIn, useVisits } from "../hooks/useVisits";
import { type Sex } from "../api/patients.api";

const RegisterPatientModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    sex: "MALE" as Sex,
    phone: "",
    address: "",
  });

  const createPatient = useCreatePatient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPatient.mutateAsync(formData, {
      onSuccess: () => {
        onClose();
        setFormData({
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          sex: "MALE",
          phone: "",
          address: "",
        });
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-surface-container-low border border-white/5 p-8 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-white uppercase tracking-tighter flex items-center gap-2">
            <UserPlus size={20} className="text-clinical-blue" />
            Patient Registration
          </h2>
          <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">
            Surgical Governance Protocol v4.2
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="mono-label text-[10px] text-on-surface-variant uppercase">
                First Name
              </label>
              <input
                required
                className="w-full bg-background border border-white/5 p-3 text-sm text-white focus:border-clinical-blue outline-none transition-colors"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, firstName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="mono-label text-[10px] text-on-surface-variant uppercase">
                Last Name
              </label>
              <input
                required
                className="w-full bg-background border border-white/5 p-3 text-sm text-white focus:border-clinical-blue outline-none transition-colors"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, lastName: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="mono-label text-[10px] text-on-surface-variant uppercase">
                Date of Birth
              </label>
              <input
                required
                type="date"
                className="w-full bg-background border border-white/5 p-3 text-sm text-white focus:border-clinical-blue outline-none transition-colors scheme-dark"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, dateOfBirth: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="mono-label text-[10px] text-on-surface-variant uppercase">
                Sex
              </label>
              <select
                required
                className="w-full bg-background border border-white/5 p-3 text-sm text-white focus:border-clinical-blue outline-none transition-colors"
                value={formData.sex}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, sex: e.target.value as Sex }))
                }
              >
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="mono-label text-[10px] text-on-surface-variant uppercase">
              Phone Number (Optional)
            </label>
            <input
              className="w-full bg-background border border-white/5 p-3 text-sm text-white focus:border-clinical-blue outline-none transition-colors"
              placeholder="+234..."
              value={formData.phone}
              onChange={(e) =>
                setFormData((d) => ({ ...d, phone: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1">
            <label className="mono-label text-[10px] text-on-surface-variant uppercase">
              Residential Address (Optional)
            </label>
            <textarea
              className="w-full bg-background border border-white/5 p-3 text-sm text-white focus:border-clinical-blue outline-none transition-colors min-h-20"
              value={formData.address}
              onChange={(e) =>
                setFormData((d) => ({ ...d, address: e.target.value }))
              }
            />
          </div>

          <button
            type="submit"
            disabled={createPatient.isPending}
            className="w-full bg-clinical-blue py-4 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {createPatient.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                REGISTERING...
              </>
            ) : (
              "AUTHORIZE REGISTRATION"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const Secretary_Dashboard = () => {
  useClinicalSocket();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch real patients
  const { data: patientsData, isLoading: isLoadingPatients } = usePatients({
    name: searchTerm || undefined,
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Fetch live visits
  const { data: visitsData, isLoading: isLoadingVisits } = useVisits();

  const checkIn = useCheckIn();

  const patients = Array.isArray(patientsData)
    ? patientsData
    : (patientsData as any)?.data || [];

  const activeVisits = Array.isArray(visitsData) ? visitsData.slice(0, 5) : [];

  const stats = {
    waiting: activeVisits.filter(
      (v) => v.queueEntry?.status === "WAITING_FOR_VITALS",
    ).length,
    inProgress: activeVisits.filter((v) => v.status === "IN_PROGRESS").length,
    completed: Array.isArray(visitsData)
      ? visitsData.filter((v) => v.status === "COMPLETED").length
      : 0,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <p className="mono-label text-clinical-blue mb-1 uppercase tracking-widest">
            Front Desk & Scheduling
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tighter">
            Patient Services
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="FIND PATIENT..."
              className="bg-transparent border-none outline-none text-[10px] font-bold text-white placeholder:text-on-surface-variant/50 w-48"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-clinical-blue px-6 py-2 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-colors flex items-center gap-2"
          >
            <UserPlus size={14} />
            NEW PATIENT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "WAITING",
            value: stats.waiting,
            icon: Clock,
            color: "text-yellow-400",
          },
          {
            label: "ACTIVE VISITS",
            value: activeVisits.filter((v) => v.status !== "COMPLETED").length,
            icon: Activity,
            color: "text-clinical-blue",
          },
          {
            label: "COMPLETED",
            value: stats.completed,
            icon: UserCheck,
            color: "text-green-400",
          },
          {
            label: "TOTAL REGISTRY",
            value: (patientsData as any)?.meta?.total || patients.length,
            icon: Users,
            color: "text-on-surface-variant",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container-low p-6 space-y-2 border-none"
          >
            <div className="flex items-center gap-2">
              <stat.icon size={14} className={stat.color} />
              <span className="mono-label text-on-surface-variant text-[10px] tracking-widest">
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
        {/* Search Results / Registry */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-clinical-blue" />
              {searchTerm ? "SEARCH RESULTS" : "RECENT REGISTRY"}
            </h2>
            <span className="data-value text-[10px] text-clinical-blue font-bold uppercase">
              {isLoadingPatients
                ? "Synchronizing..."
                : `${patients.length} PATIENTS`}
            </span>
          </div>

          <div className="space-y-3">
            {patients.length > 0
              ? patients.map((patient: any) => (
                  <div
                    key={patient.id}
                    className="bg-surface-container-low p-4 flex items-center justify-between group hover:bg-surface-bright/10 transition-colors cursor-pointer border border-white/5"
                  >
                    <div className="flex gap-6 items-center">
                      <div className="w-10 h-10 bg-background border border-white/5 flex items-center justify-center font-bold text-clinical-blue text-xs uppercase">
                        {patient.firstName?.[0]}
                        {patient.lastName?.[0]}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-clinical-blue transition-colors">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider data-value">
                          PX-{patient.id.slice(-4)} • {patient.sex}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        disabled={checkIn.isPending}
                        onClick={() =>
                          checkIn.mutate({
                            patientId: patient.id,
                            patientName: `${patient.firstName} ${patient.lastName}`,
                          })
                        }
                        className="flex items-center gap-2 bg-clinical-blue/5 border border-clinical-blue/20 px-3 py-1.5 text-[10px] font-bold text-clinical-blue hover:bg-clinical-blue hover:text-white transition-all disabled:opacity-50 uppercase tracking-tighter"
                      >
                        {checkIn.isPending &&
                        checkIn.variables?.patientId === patient.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Plus size={12} />
                        )}
                        Check In
                      </button>
                    </div>
                  </div>
                ))
              : !isLoadingPatients && (
                  <div className="p-12 text-center border border-dashed border-white/5">
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold opacity-30">
                      No registry entries found
                    </p>
                  </div>
                )}
          </div>
        </div>

        {/* Live Clinical Feed (Recent Visits) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              LIVE CLINICAL FEED
            </h2>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="data-value text-[10px] text-green-400 font-bold uppercase">
                Socket Online
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {isLoadingVisits ? (
              <div className="p-12 text-center border border-dashed border-white/5 bg-surface-container-low/30">
                <p className="animate-pulse text-[10px] text-on-surface-variant uppercase tracking-widest">
                  Awaiting Clinical Data...
                </p>
              </div>
            ) : activeVisits.length > 0 ? (
              activeVisits.map((visit: any) => (
                <div
                  key={visit.id}
                  className="bg-surface-container-low/50 p-4 flex items-center justify-between border border-white/5"
                >
                  <div className="flex gap-4 items-center">
                    <div className="text-[10px] font-bold text-clinical-blue data-value w-12">
                      {new Date(visit.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase">
                        {visit.patient?.firstName} {visit.patient?.lastName}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[8px] font-bold px-1.5 py-0.5 border uppercase tracking-tighter ${
                            visit.status === "COMPLETED"
                              ? "border-green-500/30 text-green-400"
                              : "border-yellow-400/30 text-yellow-400"
                          }`}
                        >
                          {visit.status}
                        </span>
                        <span className="text-[8px] text-on-surface-variant uppercase font-medium">
                          {visit.queueEntry?.status?.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center border border-dashed border-white/5">
                <Activity
                  size={24}
                  className="mx-auto text-on-surface-variant mb-3 opacity-20"
                />
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest max-w-50 mx-auto leading-relaxed">
                  No patient activity recorded in the current session
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <RegisterPatientModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Secretary_Dashboard;
