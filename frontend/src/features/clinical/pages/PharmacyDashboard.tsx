import { useMemo } from "react";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import {
  RefreshCw,
  Loader2,
  Pill,
  CheckCircle2,
  Package,
  Clock3,
} from "lucide-react";
import { useClinicalSocket } from "../hooks/useClinicalSocket";
import {
  useDispenseVisitPrescriptions,
  usePharmacyQueue,
} from "../hooks/usePrescriptions";

const calculateAge = (dob: string | undefined) => {
  if (!dob) return "??";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

const PharmacyDashboard = () => {
  const { user } = useAuthStore();
  useClinicalSocket();

  const { data, isLoading, isFetching } = usePharmacyQueue();
  const dispenseMutation = useDispenseVisitPrescriptions();

  const pharmacyQueue = useMemo(() => {
    const queue = Array.isArray(data) ? [...data] : [];

    return queue.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [data]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3">
            <p className="mono-label text-clinical-blue uppercase tracking-widest">
              Pharmacy Operations
            </p>
            {isFetching && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-clinical-blue/10 border border-clinical-blue/20 rounded-full">
                <RefreshCw size={10} className="text-clinical-blue animate-spin" />
                <span className="text-[8px] font-bold text-clinical-blue uppercase tracking-tighter">
                  Live Syncing
                </span>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">
            {user?.firstName} {user?.lastName}
          </h1>
        </div>

        <div className="text-right">
          <p className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">
            Pending Dispense Queue
          </p>
          <div className="flex items-center gap-2 justify-end">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <span className="text-xs font-bold text-white data-value">
              {pharmacyQueue.length} PATIENTS
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2 uppercase tracking-[0.2em]">
            <Package size={16} className="text-clinical-blue" />
            Dispensing Queue
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="p-20 text-center border border-dashed border-white/5 bg-surface-container-low/20">
              <Loader2 size={32} className="text-clinical-blue animate-spin mx-auto mb-4" />
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                Accessing Pharmacy Queue...
              </p>
            </div>
          ) : pharmacyQueue.length > 0 ? (
            pharmacyQueue.map((visit) => {
              const isDispensing =
                dispenseMutation.isPending && dispenseMutation.variables === visit.id;

              return (
                <div
                  key={visit.id}
                  className="bg-surface-container-low border border-white/5 flex flex-col items-stretch border-l-4 border-l-yellow-400/50"
                >
                  <div className="p-6 border-b border-white/5 flex gap-6 items-center">
                    <div className="w-12 h-12 flex items-center justify-center font-bold text-lg bg-background text-on-surface-variant border border-white/5">
                      {visit.patient?.firstName?.[0]}
                      {visit.patient?.lastName?.[0]}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white uppercase leading-none mb-2">
                        {visit.patient?.firstName} {visit.patient?.lastName}
                      </h3>
                      <div className="flex items-center gap-3 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                        <span>PX-{visit.patient?.id?.slice(-6).toUpperCase()}</span>
                        <span>•</span>
                        <span>{visit.patient?.sex}</span>
                        <span>•</span>
                        <span>{calculateAge(visit.patient?.dateOfBirth)} YRS</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-yellow-300">
                          <Clock3 size={10} />
                          {new Date(visit.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div className="ml-auto">
                      <button
                        onClick={() => dispenseMutation.mutate(visit.id)}
                        disabled={dispenseMutation.isPending}
                        className="flex items-center gap-3 px-6 py-3 bg-green-500 border border-green-400/20 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-green-400 disabled:opacity-50 transition-all"
                      >
                        {isDispensing ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Dispense & Complete Visit
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-background/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[8px] text-on-surface-variant uppercase font-bold tracking-[0.2em]">
                        Prescriptions ({visit.prescriptions.length})
                      </p>
                      <p className="text-[8px] uppercase text-on-surface-variant tracking-widest font-bold">
                        Doctor: {visit.doctor?.firstName || "-"} {visit.doctor?.lastName || ""}
                      </p>
                    </div>

                    <ul className="space-y-3">
                      {visit.prescriptions.map((prescription) => (
                        <li
                          key={prescription.id}
                          className="bg-surface-container-low border border-white/5 p-4 flex flex-wrap gap-4 items-start justify-between"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-background border border-white/5 flex items-center justify-center">
                              <Pill size={14} className="text-clinical-blue" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white uppercase tracking-tight">
                                {prescription.medication}
                              </p>
                              <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">
                                {prescription.dosage} • {prescription.frequency}
                                {prescription.duration ? ` • ${prescription.duration}` : ""}
                              </p>
                              {prescription.notes && (
                                <p className="text-[10px] text-on-surface-variant mt-2">
                                  {prescription.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">
                            Issued {new Date(prescription.createdAt).toLocaleTimeString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-20 text-center border border-dashed border-white/5 bg-surface-container-low/10">
              <Pill size={28} className="text-clinical-blue opacity-20 mx-auto mb-6" />
              <h3 className="text-sm font-bold text-white uppercase tracking-[0.3em] mb-2">
                Pharmacy Queue Clear
              </h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest max-w-[300px] mx-auto leading-relaxed">
                New prescriptions will appear here automatically when doctors issue
                medication orders.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
