import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notesApi, type CreateNoteRequest } from '../api/notes.api';
import { VISIT_KEYS } from './useVisits';
import { toast } from 'sonner';

export const NOTE_KEYS = {
  all: ['notes'] as const,
  byVisit: (visitId: string) => [...NOTE_KEYS.all, 'visit', visitId] as const,
  detail: (id: string) => [...NOTE_KEYS.all, 'detail', id] as const,
};

export function useNotes(visitId: string) {
  return useQuery({
    queryKey: NOTE_KEYS.byVisit(visitId),
    queryFn: () => notesApi.findByVisit(visitId),
    enabled: !!visitId,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNoteRequest) => notesApi.create(data),
    onSuccess: (_, variables) => {
      // Invalidate notes history and the visit
      queryClient.invalidateQueries({ queryKey: NOTE_KEYS.byVisit(variables.visitId) });
      queryClient.invalidateQueries({ queryKey: VISIT_KEYS.detail(variables.visitId) });
      toast.success('Clinical note saved to chart');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save clinical note');
    },
  });
}
