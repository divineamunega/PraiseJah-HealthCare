import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { prescriptionsApi, type CreatePrescriptionRequest } from '../api/prescriptions.api';
import { VISIT_KEYS } from './useVisits';
import { toast } from 'sonner';

export const PRESCRIPTION_KEYS = {
  all: ['prescriptions'] as const,
  byVisit: (visitId: string) => [...PRESCRIPTION_KEYS.all, 'visit', visitId] as const,
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
    mutationFn: (data: CreatePrescriptionRequest) => prescriptionsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PRESCRIPTION_KEYS.byVisit(variables.visitId) });
      queryClient.invalidateQueries({ queryKey: VISIT_KEYS.detail(variables.visitId) });
      toast.success('Prescription added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add prescription');
    },
  });
}
