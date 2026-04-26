import api from "@/lib/axios";

export interface LabOrder {
  id: string;
  visitId: string;
  orderedById: string | null;
  testName: string;
  notes: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface CreateLabOrderRequest {
  visitId: string;
  testName: string;
  notes?: string;
}

export const labsApi = {
  create: async (data: CreateLabOrderRequest) => {
    const res = await api.post<LabOrder>("/lab-orders", data);
    return res.data;
  },

  findByVisit: async (visitId: string) => {
    const res = await api.get<LabOrder[]>(`/lab-orders/visit/${visitId}`);
    return res.data;
  },

  complete: async (visitId: string) => {
    const res = await api.post<{ success: true }>(
      `/lab-orders/${visitId}/complete`,
    );
    return res.data;
  },
};
