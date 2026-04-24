import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vitalsApi, type CreateVitalRequest } from '../api/vitals.api';
import { VISIT_KEYS } from './useVisits';
import { toast } from 'sonner';

export const VITAL_KEYS = {
  all: ['vitals'] as const,
  byVisit: (visitId: string) => [...VITAL_KEYS.all, 'visit', visitId] as const,
  detail: (id: string) => [...VITAL_KEYS.all, 'detail', id] as const,
};

export function useVitals(visitId: string) {
  return useQuery({
    queryKey: VITAL_KEYS.byVisit(visitId),
    queryFn: () => vitalsApi.findByVisit(visitId),
    enabled: !!visitId,
  });
}

export function useRecentVitals() {
  return useQuery({
    queryKey: [...VITAL_KEYS.all, 'recent'],
    queryFn: vitalsApi.findRecent,
  });
}

export function useCreateVital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVitalRequest) => vitalsApi.create(data),
    onSuccess: (_, variables) => {
      // Invalidate both vitals history and the parent visit (to update queue status)
      queryClient.invalidateQueries({ queryKey: VITAL_KEYS.all });
      queryClient.invalidateQueries({ queryKey: VISIT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: VISIT_KEYS.detail(variables.visitId) });
      toast.success('Clinical vitals recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record vitals');
    },
  });
}
