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
import {
  useLabs,
  useCompleteLabOrder,
  useCompleteLabWithResults,
} from "../hooks/useLabs";
import { DynamicResultForm } from "../components/DynamicResultForm";

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
  const completeWithResultsMutation = useCompleteLabWithResults();

  if (isLoading)
    return <div className="animate-pulse h-4 bg-white/5 w-32 rounded" />;

  const pendingLabs = labs?.filter((l) => l.status === "PENDING") || [];
  const completedLabs = labs?.filter((l) => l.status === "COMPLETED") || [];

  return (
    <div className="space-y-6">
      {pendingLabs.length > 0 && (
        <div className="space-y-4">
          {pendingLabs.map((order) => (
            <DynamicResultForm
              key={order.id}
              testName={order.testName}
              isSubmitting={
                completeWithResultsMutation.isPending &&
                completeWithResultsMutation.variables?.orderId === order.id
              }
              onSubmit={(results) =>
                completeWithResultsMutation.mutate({
                  orderId: order.id,
                  results,
                })
              }
            />
          ))}
        </div>
      )}

      {completedLabs.length > 0 && (
        <div className="pt-4 border-t border-white/5">
          <p className="text-[8px] text-green-400 uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
            <CheckCircle2 size={10} /> Completed Tests
          </p>
          <ul className="space-y-1">
            {completedLabs.map((order) => (
              <li
                key={order.id}
                className="text-[10px] text-on-surface-variant flex items-center gap-2"
              >
                <span className="w-1 h-1 bg-green-500 rounded-full" />
                <span className="font-medium text-white/70">
                  {order.testName}
                </span>
                <span className="text-[9px] opacity-50 italic">
                  — Results: {JSON.stringify(order.results)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
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
                className="bg-surface-container-low border border-white/5 flex flex-col items-stretch border-l-4 border-l-yellow-400/50"
              >
                {/* Patient Info */}
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

                  <div className="ml-auto">
                    <button
                      onClick={() => handleComplete(visit.id)}
                      disabled={completeLabOrderMutation.isPending}
                      className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 disabled:opacity-50 transition-all"
                    >
                      {completeLabOrderMutation.isPending &&
                      completeLabOrderMutation.variables === visit.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      Finalize All & Return
                    </button>
                  </div>
                </div>

                {/* Tests Section */}
                <div className="p-6 bg-background/20">
                  <p className="text-[8px] text-on-surface-variant uppercase font-bold tracking-[0.2em] mb-4">
                    Laboratory Entry Forms
                  </p>
                  <LabOrderList visitId={visit.id} />
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

