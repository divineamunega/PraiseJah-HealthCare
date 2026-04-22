import api from '@/lib/axios';
import { type User, type UserRole, type UserStatus } from '@/types/user';

export const usersApi = {
  getAll: async () => {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  create: async (userData: { firstName: string; lastName: string; email: string; role: UserRole }) => {
    const { data } = await api.post<User>('/users/create', userData);
    return data;
  },

  updateStatus: async (id: string, status: UserStatus) => {
    const { data } = await api.post<User>(`/users/${id}/status`, { status });
    return data;
  },

  update: async (id: string, userData: Partial<User>) => {
    const { data } = await api.post<User>(`/users/${id}/update`, userData);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.post(`/users/${id}/delete`);
    return data;
  },
};
