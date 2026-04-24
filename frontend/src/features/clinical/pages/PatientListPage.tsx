import React, { useState } from 'react';
import { Database, Users, Search, Plus, Filter, MoreHorizontal, Loader2, RefreshCw } from 'lucide-react';
import { usePatients } from '../hooks/usePatients';
import { useCheckIn } from '../hooks/useVisits';
import { useClinicalSocket } from '../hooks/useClinicalSocket';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { motion, AnimatePresence } from 'framer-motion';

const calculateAge = (dob: string) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const PatientListPage = () => {
  const { user } = useAuthStore();
  useClinicalSocket(); 
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const { data: patientsData, isLoading, isFetching } = usePatients({
    name: searchTerm || undefined,
    page,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const checkIn = useCheckIn();

  const patients = Array.isArray(patientsData) 
    ? patientsData 
    : (patientsData as any)?.data || [];
  
  const meta = (patientsData as any)?.meta;

  const handleCheckIn = (patient: any) => {
    checkIn.mutate({
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`
    });
  };

  const isSecretary = user?.role === 'SECRETARY';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <p className="mono-label text-clinical-blue uppercase tracking-widest">Clinical Records</p>
            <AnimatePresence>
              {isFetching && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-1.5 px-2 py-0.5 bg-clinical-blue/10 border border-clinical-blue/20 rounded-full"
                >
                  <RefreshCw size={10} className="text-clinical-blue animate-spin" />
                  <span className="text-[8px] font-bold text-clinical-blue uppercase tracking-tighter">Live Syncing</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tighter flex items-center gap-3">
            <Database size={24} className="text-clinical-blue" />
            Patient Registry
          </h1>
        </div>
        
        <div className="flex gap-3">
          <div className={`flex items-center gap-3 bg-surface-container-low px-4 py-2 border transition-all relative overflow-hidden ${isFetching ? 'border-clinical-blue shadow-[0_0_15px_rgba(0,183,255,0.1)]' : 'border-white/5 group focus-within:border-clinical-blue'}`}>
            <Search size={14} className={`transition-colors relative z-10 ${isFetching ? 'text-clinical-blue' : 'text-on-surface-variant group-focus-within:text-clinical-blue'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="SEARCH BY NAME..."
              className="bg-transparent border-none outline-none text-[10px] font-bold text-white placeholder:text-on-surface-variant/50 w-64 relative z-10"
            />
          </div>
          <button className="bg-surface-container-low p-2 border border-white/5 text-on-surface-variant hover:text-white transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-surface-container-low border border-white/5 overflow-hidden relative">
        {/* Prominent Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/5 z-20">
          <AnimatePresence>
            {isFetching && (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="h-full bg-clinical-blue shadow-[0_0_8px_#00b7ff]"
              />
            )}
          </AnimatePresence>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-surface-container-lowest/50">
              <th className="px-6 py-4 mono-label text-on-surface-variant text-[10px]">PATIENT IDENTITY</th>
              <th className="px-6 py-4 mono-label text-on-surface-variant text-[10px]">GENDER / DOB / AGE</th>
              <th className="px-6 py-4 mono-label text-on-surface-variant text-[10px]">RECORDED ON</th>
              <th className="px-6 py-4 mono-label text-on-surface-variant text-[10px] text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-6 py-8 bg-white/5"></td>
                </tr>
              ))
            ) : patients.length > 0 ? (
              patients.map((patient: any) => (
                <tr key={patient.id} className="hover:bg-surface-bright/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-background border border-white/5 flex items-center justify-center font-bold text-clinical-blue text-xs uppercase group-hover:border-clinical-blue/30 transition-colors">
                        {patient.firstName?.[0]}{patient.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white group-hover:text-clinical-blue transition-colors">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-[10px] text-on-surface-variant data-value">
                          ID: PX-{patient.id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/90 uppercase">{patient.sex}</span>
                      <span className="text-xs text-on-surface-variant">•</span>
                      <span className="text-xs text-white/90">{calculateAge(patient.dateOfBirth)} YRS</span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant uppercase mt-0.5">
                      DOB: {new Date(patient.dateOfBirth).toLocaleDateString([], { dateStyle: 'medium' })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] text-on-surface-variant data-value uppercase">
                      {new Date(patient.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {isSecretary && (
                        <button 
                          onClick={() => handleCheckIn(patient)}
                          disabled={checkIn.isPending}
                          className="flex items-center gap-2 bg-clinical-blue/10 border border-clinical-blue/20 px-3 py-1.5 text-[10px] font-bold text-clinical-blue hover:bg-clinical-blue hover:text-white transition-all disabled:opacity-50 uppercase tracking-tighter"
                        >
                          {checkIn.isPending && checkIn.variables?.patientId === patient.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Plus size={14} />
                          )}
                          Check In
                        </button>
                      )}
                      <button className="p-2 hover:bg-background border border-transparent hover:border-white/5 text-on-surface-variant hover:text-white transition-all">
                        <MoreHorizontal size={16} title="Options" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-40">
                    <Users size={48} />
                    <p className="mono-label text-xs uppercase tracking-[0.2em]">Registry entry not found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.lastPage > 1 && (
        <div className="flex justify-between items-center bg-surface-container-low px-6 py-4 border border-white/5">
          <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
            Page {page} of {meta.lastPage} — Total {meta.total} records
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 text-[10px] font-bold border border-white/5 hover:bg-surface-bright/5 disabled:opacity-30 uppercase transition-all"
            >
              Previous
            </button>
            <button
              disabled={page === meta.lastPage}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-[10px] font-bold border border-white/5 hover:bg-surface-bright/5 disabled:opacity-30 uppercase transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientListPage;
