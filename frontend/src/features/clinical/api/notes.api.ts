import api from '@/lib/axios';

export interface ClinicalNote {
  id: string;
  visitId: string;
  authorId: string;
  chiefComplaint?: string;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    firstName: string;
    lastName: string;
  };
}

export interface CreateNoteRequest {
  visitId: string;
  chiefComplaint?: string;
  content: string;
  version?: number;
}

export const notesApi = {
  create: async (data: CreateNoteRequest) => {
    const res = await api.post<ClinicalNote>('/clinical-notes', data);
    return res.data;
  },

  findByVisit: async (visitId: string) => {
    const res = await api.get<ClinicalNote>(`/clinical-notes/visit/${visitId}`);
    return res.data;
  },

  findOne: async (id: string) => {
    const res = await api.get<ClinicalNote>(`/clinical-notes/${id}`);
    return res.data;
  },
};
