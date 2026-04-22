import React, { useState, useMemo } from "react";
import {
  UserPlus,
  Calendar,
  Clock,
  Users,
  Search,
  Plus,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePatients, useCreatePatient } from "../hooks/usePatients";
import { Sex } from "../api/patients.api";

const RegisterPatientModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    sex: 'MALE' as Sex,
    phone: '',
    address: '',
  });

  const createPatient = useCreatePatient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPatient.mutateAsync(formData, {
      onSuccess: () => {
        onClose();
        setFormData({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          sex: 'MALE',
          phone: '',
          address: '',
        });
      }
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
          <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Surgical Governance Protocol v4.2</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="mono-label text-[10px] text-on-surface-variant">First Name</label>
              <input
                required
                className="w-full bg-background border border-white/5 p-3 text-sm text-white focus:border-clinical-blue outline-none transition-colors"
                value={formData.firstName}
                onChange={e => setFormData(d => ({ ...d, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="mono-label text-[10px] text-on-surface-variant">Last Name</label>
              <input
                required
                className="w-full bg-background border border-white/5 p-3 text-sm text-white focus:border-clinical-blue outline-none transition-colors"
                value={formData.lastName}
                onChange={e => setFormData(d => ({ ...d, lastName: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="mono-label text-[10px] text-on-surface-variant">Date of Birth</label>
              <input
                required
                type="date"
                className="w-full bg-background border border-white/5 p-3 text-sm text-white focus:border-clinical-blue outline-none transition-colors [color-scheme:dark]"
                value={formData.dateOfBirth}
                onChange={e => setFormData(d => ({ ...d, dateOfBirth: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="mono-label text-[10px] text-on-surface-variant">Sex</label>
              <select
                required
                className="w-full bg-background border border-white/5 p-3 text-sm text-white focus:border-clinical-blue outline-none transition-colors"
                value={formData.sex}
                onChange={e => setFormData(d => ({ ...d, sex: e.target.value as Sex }))}
              >
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="mono-label text-[10px] text-on-surface-variant">Phone Number (Optional)</label>
            <input
              className="w-full bg-background border border-white/5 p-3 text-sm text-white focus:border-clinical-blue outline-none transition-colors"
              placeholder="+234..."
              value={formData.phone}
              onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="mono-label text-[10px] text-on-surface-variant">Residential Address (Optional)</label>
            <textarea
              className="w-full bg-background border border-white/5 p-3 text-sm text-white focus:border-clinical-blue outline-none transition-colors min-h-[80px]"
              value={formData.address}
              onChange={e => setFormData(d => ({ ...d, address: e.target.value }))}
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
              'AUTHORIZE REGISTRATION'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const Secretary_Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch real patients
  const { data: patientsData, isLoading } = usePatients({ 
    name: searchTerm || undefined,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const patients = patientsData?.data || [];

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

      {/* Stats - Still mock until visits/queue are ready */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "WAITING", value: 3, icon: Clock, color: "text-yellow-400" },
          { label: "CHECKED IN", value: 1, icon: CheckCircle, color: "text-green-400" },
          { label: "IN PROGRESS", value: 1, icon: AlertCircle, color: "text-clinical-blue" },
          { label: "COMPLETED", value: 8, icon: Users, color: "text-on-surface-variant" },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-low p-6 space-y-2 border-none">
            <div className="flex items-center gap-2">
              <stat.icon size={14} className={stat.color} />
              <span className="mono-label text-on-surface-variant">{stat.label}</span>
            </div>
            <p className="text-4xl font-bold text-white data-value">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Real Patient List (Search Results) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-clinical-blue" />
              {searchTerm ? 'SEARCH RESULTS' : 'RECENTLY REGISTERED'}
            </h2>
            <span className="data-value text-[10px] text-clinical-blue font-bold uppercase">
              {isLoading ? 'Loading...' : `${patients.length} PATIENTS`}
            </span>
          </div>

          <div className="space-y-3">
            {patients.length > 0 ? patients.map((patient) => (
              <div
                key={patient.id}
                className="bg-surface-container-low p-4 flex items-center justify-between group hover:bg-surface-bright/10 transition-colors cursor-pointer border border-white/5"
              >
                <div className="flex gap-6 items-center">
                  <div className="w-10 h-10 bg-background border border-white/5 flex items-center justify-center font-bold text-clinical-blue text-xs uppercase">
                    {patient.firstName[0]}{patient.lastName[0]}
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
                    <Plus size={18} title="Check In" />
                  </button>
                </div>
              </div>
            )) : !isLoading && (
              <div className="p-12 text-center border border-dashed border-white/5">
                <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">No patients found</p>
              </div>
            )}
          </div>
        </div>

        {/* Placeholder for Recent Visits / Queue until Visit module is ready */}
        <div className="space-y-4 opacity-50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              RECENT VISITS (PENDING)
            </h2>
          </div>
          <div className="p-8 border border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-4">
            <AlertCircle size={24} className="text-on-surface-variant" />
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest max-w-[200px]">Visit module implementation required to track clinical flow</p>
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
