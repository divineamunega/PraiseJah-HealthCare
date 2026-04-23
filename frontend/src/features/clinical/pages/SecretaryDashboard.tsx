import React, { useState } from "react";
import {
  Clock,
  Users,
  Search,
  Plus,
  CheckCircle,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { usePatients } from "../hooks/usePatients";
import RegisterPatientModal from "../components/RegisterPatientModal";

const Secretary_Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch real patients
  // Note: axios interceptor unwraps the backend { success: true, data: [...] } structure
  // So 'patients' here is directly the array (or object if paginated, but your JSON showed the array)
  const { data: patientsData, isLoading } = usePatients({
    name: searchTerm || undefined,
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Handle both array and paginated object (just in case)
  const patients = Array.isArray(patientsData)
    ? patientsData
    : (patientsData as any)?.data || [];

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
          { label: "WAITING", value: 3, icon: Clock, color: "text-yellow-400" },
          {
            label: "CHECKED IN",
            value: 1,
            icon: CheckCircle,
            color: "text-green-400",
          },
          {
            label: "IN PROGRESS",
            value: 1,
            icon: AlertCircle,
            color: "text-clinical-blue",
          },
          {
            label: "COMPLETED",
            value: 8,
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-clinical-blue" />
              {searchTerm ? "SEARCH RESULTS" : "RECENTLY REGISTERED"}
            </h2>
            <span className="data-value text-[10px] text-clinical-blue font-bold uppercase">
              {isLoading ? "Loading..." : `${patients.length} PATIENTS`}
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
                        {patient.firstName[0]}
                        {patient.lastName[0]}
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
                      <span className="text-[9px] font-bold px-2 py-0.5 border border-white/10 text-on-surface-variant">
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </span>
                      <button className="text-on-surface-variant hover:text-white transition-colors">
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                ))
              : !isLoading && (
                  <div className="p-12 text-center border border-dashed border-white/5">
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">
                      No patients found
                    </p>
                  </div>
                )}
          </div>
        </div>

        <div className="space-y-4 opacity-50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              RECENT VISITS (PENDING)
            </h2>
          </div>
          <div className="p-8 border border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-4">
            <AlertCircle size={24} className="text-on-surface-variant" />
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest max-w-[200px]">
              Visit module implementation required to track clinical flow
            </p>
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
