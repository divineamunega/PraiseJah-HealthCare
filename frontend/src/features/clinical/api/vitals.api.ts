import api from '@/lib/axios';

export interface Vital {
  id: string;
  visitId: string;
  recordedById: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperatureCelsius?: number;
  weightKg?: number;
  heightCm?: number;
  recordedAt: string;
}

export interface CreateVitalRequest {
  visitId: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperatureCelsius?: number;
  weightKg?: number;
  heightCm?: number;
}

export const vitalsApi = {
  create: async (data: CreateVitalRequest) => {
    const res = await api.post<Vital>('/vitals', data);
    return res.data;
  },

  findByVisit: async (visitId: string) => {
    const res = await api.get<Vital[]>(`/vitals/visit/${visitId}`);
    return res.data;
  },

  findRecent: async () => {
    const res = await api.get<any[]>('/vitals/recent');
    return res.data;
  },

  findOne: async (id: string) => {
    const res = await api.get<Vital>(`/vitals/${id}`);
    return res.data;
  },
};
