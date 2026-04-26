import api from '@/lib/axios';

export interface Prescription {
  id: string;
  visitId: string;
  prescriberId: string | null;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string | null;
  notes: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface CreatePrescriptionRequest {
  visitId: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration?: string;
  notes?: string;
}

export const prescriptionsApi = {
  create: async (data: CreatePrescriptionRequest) => {
    const res = await api.post<Prescription>('/prescriptions', data);
    return res.data;
  },

  findByVisit: async (visitId: string) => {
    const res = await api.get<Prescription[]>(`/prescriptions/visit/${visitId}`);
    return res.data;
  },
};
