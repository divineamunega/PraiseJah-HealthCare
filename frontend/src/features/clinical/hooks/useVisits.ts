import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { visitsApi } from "../api/visits.api";
import { toast } from "sonner";

export const VISIT_KEYS = {
  all: ["visits"] as const,
  list: () => [...VISIT_KEYS.all, "list"] as const,
  detail: (id: string) => [...VISIT_KEYS.all, "detail", id] as const,
};

export function useVisits() {
  return useQuery({
    queryKey: VISIT_KEYS.list(),
    queryFn: visitsApi.findAll,
  });
}

export function useVisit(id: string) {
  return useQuery({
    queryKey: VISIT_KEYS.detail(id),
    queryFn: () => visitsApi.findOne(id),
    enabled: !!id,
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      patientId: string;
      doctorId?: string;
      patientName?: string;
    }) =>
      visitsApi.create({
        patientId: variables.patientId,
        doctorId: variables.doctorId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VISIT_KEYS.all });
      toast.success("Patient checked in successfully");
    },
    onError: (error: any, variables) => {
      if (error.message.includes("already has an active visit")) {
        toast.info(
          `${variables.patientName || "This patient"} is already checked in.`,
          {
            description:
              "They are currently in the queue. Please finish their existing visit before starting a new one.",
            duration: 5000,
          },
        );
      } else {
        toast.error(error.message || "Check-in failed");
      }
    },
  });
}

export function useCompleteVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => visitsApi.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: VISIT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: VISIT_KEYS.detail(id) });
      toast.success("Visit marked as completed");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Unable to complete visit",
      );
    },
  });
}
