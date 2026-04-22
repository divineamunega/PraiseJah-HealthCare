import api from '@/lib/axios';

export type Sex = 'MALE' | 'FEMALE' | 'OTHER';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: Sex;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: Sex;
  phone?: string;
  address?: string;
}

export interface PatientQuery {
  page?: number;
  limit?: number;
  name?: string;
  phone?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export const patientsApi = {
  create: async (data: CreatePatientRequest) => {
    const res = await api.post<Patient>('/patients', data);
    return res.data;
  },

  findAll: async (query?: PatientQuery) => {
    const res = await api.get<PaginatedResponse<Patient>>('/patients', { params: query });
    return res.data;
  },

  findOne: async (id: string) => {
    const res = await api.get<Patient>(`/patients/${id}`);
    return res.data;
  },

  update: async (id: string, data: Partial<CreatePatientRequest>) => {
    const res = await api.patch<Patient>(`/patients/${id}`, data);
    return res.data;
  },

  remove: async (id: string) => {
    await api.delete(`/patients/${id}`);
  },
};
