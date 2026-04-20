import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/login', data);
  return res.data;
}

export async function refreshTokens(): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/refresh');
  return res.data;
}

export async function logoutUser(): Promise<void> {
  await api.post('/auth/logout');
}

export async function forgotPassword(
  data: ForgotPasswordRequest,
): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>(
    '/auth/forgot-password',
    data,
  );
  return res.data;
}

export async function resetPassword(
  data: ResetPasswordRequest,
): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>('/auth/reset-password', data);
  return res.data;
}

export async function changePassword(
  data: ChangePasswordRequest,
): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>(
    '/auth/change-password',
    data,
  );
  return res.data;
}

export async function getMe(): Promise<AuthUser> {
  const res = await api.get<AuthUser>('/users/me');
  return res.data;
}
