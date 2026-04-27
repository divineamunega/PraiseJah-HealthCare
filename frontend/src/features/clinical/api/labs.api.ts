import api from "@/lib/axios";

export interface LabOrder {
  id: string;
  visitId: string;
  orderedById: string | null;
  testName: string;
  notes: string | null;
  status: 'PENDING' | 'COMPLETED';
  results: Record<string, any> | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface CreateLabOrderRequest {
  visitId: string;
  testName: string;
  notes?: string;
}

export interface CreateBulkLabOrdersRequest {
  visitId: string;
  testNames: string[];
  notes?: string;
}

export const labsApi = {
  create: async (data: CreateLabOrderRequest) => {
    const res = await api.post<LabOrder>("/lab-orders", data);
    return res.data;
  },

  createBulk: async (data: CreateBulkLabOrdersRequest) => {
    const res = await api.post<LabOrder[]>("/lab-orders/bulk", data);
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

  completeWithResults: async (
    orderId: string,
    results: Record<string, any>,
  ) => {
    const res = await api.post<LabOrder>(
      `/lab-orders/${orderId}/complete-with-results`,
      { results },
    );
    return res.data;
  },
};

