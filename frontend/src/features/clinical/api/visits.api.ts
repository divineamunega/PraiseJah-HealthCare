import api from '@/lib/axios';
import { type Patient } from './patients.api';

export type VisitStatus = 'CREATED' | 'IN_PROGRESS' | 'COMPLETED';
export type QueueStatus = 'WAITING_FOR_VITALS' | 'READY_FOR_DOCTOR' | 'ASSIGNED' | 'IN_PROGRESS' | 'DONE';

export interface QueueEntry {
  id: string;
  visitId: string;
  userId?: string;
  status: QueueStatus;
  createdAt: string;
  updatedAt: string;
  visit: Visit;
}

export interface Visit {
  id: string;
  patientId: string;
  doctorId?: string;
  status: VisitStatus;
  createdAt: string;
  updatedAt: string;
  patient?: Partial<Patient>;
  doctor?: { id: string; firstName: string; lastName: string };
  queueEntry?: QueueEntry;
}

export const visitsApi = {
  create: async (data: { patientId: string; doctorId?: string }) => {
    const res = await api.post<Visit>('/visits', data);
    return res.data;
  },

  findAll: async () => {
    const res = await api.get<Visit[]>('/visits');
    return res.data;
  },

  findOne: async (id: string) => {
    const res = await api.get<Visit>(`/visits/${id}`);
    return res.data;
  },

  update: async (id: string, data: any) => {
    const res = await api.patch<Visit>(`/visits/${id}`, data);
    return res.data;
  },

  complete: async (id: string) => {
    const res = await api.post<Visit>(`/visits/${id}/complete`);
    return res.data;
  },
};
