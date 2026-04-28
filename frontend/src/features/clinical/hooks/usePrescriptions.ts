import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  prescriptionsApi,
  type CreatePrescriptionRequest,
} from "../api/prescriptions.api";
import { VISIT_KEYS } from "./useVisits";
import { toast } from "sonner";

export const PRESCRIPTION_KEYS = {
  all: ["prescriptions"] as const,
  byVisit: (visitId: string) =>
    [...PRESCRIPTION_KEYS.all, "visit", visitId] as const,
  pharmacyQueue: () => [...PRESCRIPTION_KEYS.all, "pharmacy", "queue"] as const,
};

export function usePrescriptions(visitId: string) {
  return useQuery({
    queryKey: PRESCRIPTION_KEYS.byVisit(visitId),
    queryFn: () => prescriptionsApi.findByVisit(visitId),
    enabled: !!visitId,
  });
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePrescriptionRequest) =>
      prescriptionsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PRESCRIPTION_KEYS.byVisit(variables.visitId),
      });
      queryClient.invalidateQueries({
        queryKey: VISIT_KEYS.detail(variables.visitId),
      });
      queryClient.invalidateQueries({
        queryKey: PRESCRIPTION_KEYS.pharmacyQueue(),
      });
      toast.success("Prescription added successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to add prescription",
      );
    },
  });
}

export function usePharmacyQueue() {
  return useQuery({
    queryKey: PRESCRIPTION_KEYS.pharmacyQueue(),
    queryFn: () => prescriptionsApi.findPharmacyQueue(),
  });
}

export function useDispenseVisitPrescriptions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (visitId: string) => prescriptionsApi.dispenseByVisit(visitId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: PRESCRIPTION_KEYS.pharmacyQueue(),
      });
      queryClient.invalidateQueries({ queryKey: VISIT_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: VISIT_KEYS.detail(data.visitId),
      });
      toast.success(`Dispensed ${data.dispensedCount} prescription(s)`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to dispense prescriptions",
      );
    },
  });
}
