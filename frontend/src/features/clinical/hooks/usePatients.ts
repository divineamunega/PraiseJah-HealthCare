import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { patientsApi, type CreatePatientRequest, type PatientQuery } from '../api/patients.api';
import { toast } from 'sonner';

export const PATIENT_KEYS = {
  all: ['patients'] as const,
  list: (query?: PatientQuery) => [...PATIENT_KEYS.all, 'list', { query }] as const,
  detail: (id: string) => [...PATIENT_KEYS.all, 'detail', id] as const,
};

export function usePatients(query?: PatientQuery) {
  return useQuery({
    queryKey: PATIENT_KEYS.list(query),
    queryFn: () => patientsApi.findAll(query),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: PATIENT_KEYS.detail(id),
    queryFn: () => patientsApi.findOne(id),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePatientRequest) => patientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.all });
      toast.success('Patient registered successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to register patient');
    },
  });
}

export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CreatePatientRequest>) => patientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.all });
      toast.success('Patient updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update patient');
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => patientsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENT_KEYS.all });
      toast.success('Patient deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete patient');
    },
  });
}
