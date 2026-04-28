import { useMemo, useState } from "react";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import {
  Clock,
  Stethoscope,
  ClipboardList,
  RefreshCw,
  Search,
  Zap,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useVisits } from "../hooks/useVisits";
import { useClinicalSocket } from "../hooks/useClinicalSocket";
import { useNavigate } from "react-router";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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

const Doctor_Dashboard = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  useClinicalSocket();

  const { data: visitsData, isLoading, isFetching } = useVisits();
  const activeVisits = Array.isArray(visitsData) ? visitsData : [];

  // Logic: Patients ready for review or currently in-progress with this doctor
  const doctorQueue = useMemo(() => {
    return activeVisits
      .filter(
        (v) =>
          v.status === "IN_PROGRESS" ||
          (v.status === "CREATED" &&
            v.queueEntry?.status === "READY_FOR_DOCTOR"),
      )
      .sort((a, b) => {
        // Prioritize active encounters, then by time
        if (a.status === "IN_PROGRESS" && b.status !== "IN_PROGRESS") return -1;
        if (a.status !== "IN_PROGRESS" && b.status === "IN_PROGRESS") return 1;
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
  }, [activeVisits]);

  const [startingVisitId, setStartingVisitId] = useState<string | null>(null);

  const handleStartEncounter = async (visitId: string) => {
    if (!user?.id) {
      toast.error("Unable to start encounter: doctor session is not ready");
      return;
    }

    setStartingVisitId(visitId);

    try {
      await api.patch(`/visits/${visitId}`, {
        status: "IN_PROGRESS",
        doctorId: user.id,
      });
      await queryClient.invalidateQueries({ queryKey: ["visits"] });
      navigate(`/doctor/encounter/${visitId}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to initialize encounter. Please retry.");
    } finally {
      setStartingVisitId((current) => (current === visitId ? null : current));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* 1. Header & Quick Stats */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3">
            <p className="mono-label text-clinical-blue uppercase tracking-widest">
              Clinical Cockpit
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
            Dr. {user?.firstName} {user?.lastName}
          </h1>
        </div>

        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">
              Queue Status
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                <span className="text-xs font-bold text-white data-value">
                  {doctorQueue.filter((v) => v.status === "CREATED").length}{" "}
                  WAITING
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-clinical-blue shadow-[0_0_8px_#00b7ff]" />
                <span className="text-xs font-bold text-white data-value">
                  {doctorQueue.filter((v) => v.status === "IN_PROGRESS").length}{" "}
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Action Area: The Cleared List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2 uppercase tracking-[0.2em]">
            <ClipboardList size={16} className="text-clinical-blue" />
            Patients Cleared for Review
          </h2>
          <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 border border-white/5 focus-within:border-clinical-blue transition-all">
            <Search size={14} className="text-on-surface-variant" />
            <input
              type="text"
              placeholder="FILTER QUEUE..."
              className="bg-transparent border-none outline-none text-[10px] font-bold text-white placeholder:text-on-surface-variant/50 w-48"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="p-20 text-center border border-dashed border-white/5 bg-surface-container-low/20">
              <Loader2
                size={32}
                className="text-clinical-blue animate-spin mx-auto mb-4"
              />
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                Synchronizing Clinical Records...
              </p>
            </div>
          ) : doctorQueue.length > 0 ? (
            doctorQueue.map((visit) => {
              const latestVital = visit.vitals?.[0];
              const isActive = visit.status === "IN_PROGRESS";

              const isStarting = startingVisitId === visit.id;

              return (
                <div
                  key={visit.id}
                  className={`bg-surface-container-low border border-white/5 flex items-stretch group hover:border-clinical-blue/30 transition-all ${isActive ? "bg-clinical-blue/[0.03] border-l-4 border-l-clinical-blue" : "border-l-4 border-l-yellow-400/50"}`}
                >
                  {/* Identity Section */}
                  <div className="p-6 border-r border-white/5 flex gap-6 items-center min-w-[300px]">
                    <div
                      className={`w-12 h-12 flex items-center justify-center font-bold text-lg border ${isActive ? "bg-clinical-blue text-white border-clinical-blue shadow-lg shadow-clinical-blue/20" : "bg-background text-on-surface-variant border-white/5"}`}
                    >
                      {visit.patient?.firstName?.[0]}
                      {visit.patient?.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase leading-none mb-2 group-hover:text-clinical-blue transition-colors">
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

                  {/* Triage Stats Section */}
                  <div className="flex-1 p-6 flex items-center gap-12 bg-background/20">
                    {latestVital ? (
                      <>
                        <div className="space-y-1">
                          <p className="text-[8px] text-on-surface-variant uppercase font-bold tracking-tighter opacity-60">
                            Blood Pressure
                          </p>
                          <p className="text-sm font-bold text-white data-value">
                            {latestVital.systolicBP}/{latestVital.diastolicBP}{" "}
                            <span className="text-[8px] text-on-surface-variant font-normal">
                              mmHg
                            </span>
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] text-on-surface-variant uppercase font-bold tracking-tighter opacity-60">
                            Heart Rate
                          </p>
                          <p className="text-sm font-bold text-white data-value">
                            {latestVital.heartRate}{" "}
                            <span className="text-[8px] text-on-surface-variant font-normal">
                              BPM
                            </span>
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] text-on-surface-variant uppercase font-bold tracking-tighter opacity-60">
                            Temp
                          </p>
                          <p className="text-sm font-bold text-white data-value">
                            {latestVital.temperatureCelsius}°{" "}
                            <span className="text-[8px] text-on-surface-variant font-normal">
                              C
                            </span>
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] text-on-surface-variant uppercase font-bold tracking-tighter opacity-60">
                            Wait Time
                          </p>
                          <p className="text-sm font-bold text-yellow-400 data-value flex items-center gap-1">
                            <Clock size={10} />
                            12m
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-3 opacity-30">
                        <Zap size={14} className="text-on-surface-variant" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          Triage data syncing...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA Section */}
                  <div className="p-6 flex items-center bg-background/40">
                    <button
                      onClick={() =>
                        isActive
                          ? navigate(`/doctor/encounter/${visit.id}`)
                          : handleStartEncounter(visit.id)
                      }
                      disabled={!isActive && isStarting}
                      className={`flex items-center gap-3 px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                        isActive
                          ? "bg-green-500 text-white hover:bg-green-400 shadow-lg shadow-green-500/10"
                          : "bg-clinical-blue text-white hover:bg-clinical-blue/90 shadow-lg shadow-clinical-blue/10"
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Stethoscope size={16} />
                          CONTINUE REVIEW
                        </>
                      ) : isStarting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          OPENING...
                        </>
                      ) : (
                        <>
                          <ArrowRight size={16} />
                          OPEN ENCOUNTER
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-20 text-center border border-dashed border-white/5 bg-surface-container-low/10 rounded-sm">
              <div className="w-16 h-16 rounded-full bg-clinical-blue/5 border border-clinical-blue/10 flex items-center justify-center mx-auto mb-6">
                <Stethoscope
                  size={28}
                  className="text-clinical-blue opacity-20"
                />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-[0.3em] mb-2">
                No Patients Cleared
              </h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest max-w-[300px] mx-auto leading-relaxed">
                The clinical queue is empty. New patients will appear here once
                triage is completed by the nursing unit.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctor_Dashboard;
