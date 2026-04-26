import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { labsApi, type CreateLabOrderRequest } from "../api/labs.api";
import { VISIT_KEYS } from "./useVisits";
import { toast } from "sonner";

export const LAB_KEYS = {
  all: ["labs"] as const,
  byVisit: (visitId: string) => [...LAB_KEYS.all, "visit", visitId] as const,
};

export function useLabs(visitId: string) {
  return useQuery({
    queryKey: LAB_KEYS.byVisit(visitId),
    queryFn: () => labsApi.findByVisit(visitId),
    enabled: !!visitId,
  });
}

export function useCreateLabOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLabOrderRequest) => labsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: LAB_KEYS.byVisit(variables.visitId),
      });
      queryClient.invalidateQueries({
        queryKey: VISIT_KEYS.detail(variables.visitId),
      });
      toast.success("Lab order requested successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to request lab order",
      );
    },
  });
}

export function useCompleteLabOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (visitId: string) => labsApi.complete(visitId),
    onSuccess: (_, visitId) => {
      queryClient.invalidateQueries({ queryKey: LAB_KEYS.byVisit(visitId) });
      queryClient.invalidateQueries({ queryKey: VISIT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: VISIT_KEYS.detail(visitId) });
      toast.success("Lab order marked as completed");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to complete lab order",
      );
    },
  });
}
