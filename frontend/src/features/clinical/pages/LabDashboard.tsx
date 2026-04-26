import { useMemo } from "react";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import {
  RefreshCw,
  Loader2,
  FlaskConical,
  Beaker,
  CheckCircle2,
} from "lucide-react";
import { useVisits } from "../hooks/useVisits";
import { useClinicalSocket } from "../hooks/useClinicalSocket";
import { useLabs, useCompleteLabOrder } from "../hooks/useLabs";

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

const LabOrderList = ({ visitId }: { visitId: string }) => {
  const { data: labs, isLoading } = useLabs(visitId);

  if (isLoading)
    return <div className="animate-pulse h-4 bg-white/5 w-32 rounded" />;

  return (
    <ul className="space-y-1">
      {labs?.map((order) => (
        <li
          key={order.id}
          className="text-sm text-white flex items-center gap-2"
        >
          <Beaker size={12} className="text-clinical-blue" />
          <span className="font-medium">{order.testName}</span>
          {order.notes && (
            <span className="text-[10px] text-on-surface-variant italic">
              ({order.notes})
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};

const LabDashboard = () => {
  const { user } = useAuthStore();
  useClinicalSocket();

  const { data: visitsData, isLoading, isFetching } = useVisits();
  const activeVisits = Array.isArray(visitsData) ? visitsData : [];

  const completeLabOrderMutation = useCompleteLabOrder();

  const labQueue = useMemo(() => {
    return activeVisits
      .filter((v) => v.queueEntry?.status === "WAITING_FOR_LAB")
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }, [activeVisits]);

  const handleComplete = (visitId: string) => {
    completeLabOrderMutation.mutate(visitId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3">
            <p className="mono-label text-clinical-blue uppercase tracking-widest">
              Diagnostic Lab
            </p>
            {isFetching && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-clinical-blue/10 border border-clinical-blue/20 rounded-full">
                <RefreshCw
                  size={10}
                  className="text-clinical-blue animate-spin"
                />
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
            Lab Queue
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <span className="text-xs font-bold text-white data-value">
              {labQueue.length} PENDING SAMPLES
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2 uppercase tracking-[0.2em]">
            <FlaskConical size={16} className="text-clinical-blue" />
            Active Lab Requests
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="p-20 text-center border border-dashed border-white/5 bg-surface-container-low/20">
              <Loader2
                size={32}
                className="text-clinical-blue animate-spin mx-auto mb-4"
              />
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                Accessing Laboratory Records...
              </p>
            </div>
          ) : labQueue.length > 0 ? (
            labQueue.map((visit) => (
              <div
                key={visit.id}
                className="bg-surface-container-low border border-white/5 flex items-stretch border-l-4 border-l-yellow-400/50"
              >
                {/* Patient Info */}
                <div className="p-6 border-r border-white/5 flex gap-6 items-center min-w-[300px]">
                  <div className="w-12 h-12 flex items-center justify-center font-bold text-lg bg-background text-on-surface-variant border border-white/5">
                    {visit.patient?.firstName?.[0]}
                    {visit.patient?.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase leading-none mb-2">
                      {visit.patient?.firstName} {visit.patient?.lastName}
                    </h3>
                    <div className="flex items-center gap-3 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                      <span>
                        PX-{visit.patient?.id?.slice(-6).toUpperCase()}
                      </span>
                      <span>•</span>
                      <span>{visit.patient?.sex}</span>
                      <span>•</span>
                      <span>
                        {calculateAge(visit.patient?.dateOfBirth)} YRS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tests Section */}
                <div className="flex-1 p-6 bg-background/20">
                  <p className="text-[8px] text-on-surface-variant uppercase font-bold tracking-[0.2em] mb-3">
                    Requested Tests
                  </p>
                  <LabOrderList visitId={visit.id} />
                </div>

                {/* Actions */}
                <div className="p-6 flex items-center bg-background/40">
                  <button
                    onClick={() => handleComplete(visit.id)}
                    disabled={completeLabOrderMutation.isPending}
                    className="flex items-center gap-3 px-6 py-3 bg-clinical-blue text-white text-[10px] font-bold uppercase tracking-widest hover:bg-clinical-blue/90 disabled:opacity-50 transition-all"
                  >
                    {completeLabOrderMutation.isPending &&
                    completeLabOrderMutation.variables === visit.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    MARK AS COMPLETED
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center border border-dashed border-white/5 bg-surface-container-low/10">
              <Beaker
                size={28}
                className="text-clinical-blue opacity-20 mx-auto mb-6"
              />
              <h3 className="text-sm font-bold text-white uppercase tracking-[0.3em] mb-2">
                No Pending Lab Work
              </h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest max-w-[300px] mx-auto leading-relaxed">
                The laboratory queue is currently clear. Requested tests will
                appear here in real-time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabDashboard;
