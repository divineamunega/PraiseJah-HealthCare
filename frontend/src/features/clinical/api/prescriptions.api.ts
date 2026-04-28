import api from "@/lib/axios";
import type { QueueEntry, VisitStatus } from "./visits.api";

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

export interface PharmacyQueueVisit {
  id: string;
  status: VisitStatus;
  createdAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    sex: string;
    dateOfBirth: string;
  };
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  queueEntry: QueueEntry;
  prescriptions: Prescription[];
}

export interface DispensePrescriptionsResponse {
  success: boolean;
  visitId: string;
  dispensedCount: number;
}

export const prescriptionsApi = {
  create: async (data: CreatePrescriptionRequest) => {
    const res = await api.post<Prescription>("/prescriptions", data);
    return res.data;
  },

  findByVisit: async (visitId: string) => {
    const res = await api.get<Prescription[]>(
      `/prescriptions/visit/${visitId}`,
    );
    return res.data;
  },

  findPharmacyQueue: async () => {
    const res = await api.get<PharmacyQueueVisit[]>("/prescriptions/pharmacy/queue");
    return res.data;
  },

  dispenseByVisit: async (visitId: string) => {
    const res = await api.post<DispensePrescriptionsResponse>(
      `/prescriptions/pharmacy/visit/${visitId}/dispense`,
    );
    return res.data;
  },
};
