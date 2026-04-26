import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  type LoginRequest,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
  type ChangePasswordRequest,
} from "../api/auth.api";
import { useAuthStore } from "../stores/auth.store";
import { setAccessToken } from "../utils/token.util";

const AUTH_KEYS = {
  me: ["auth", "me"] as const,
};

export function useLogin() {
  const storeLogin = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (data: LoginRequest) => loginUser(data),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      storeLogin(data.user);
    },
  });
}

export function useLogout() {
  const storeLogout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutUser(),
    onSuccess: () => {
      setAccessToken(null);
      storeLogout();
      queryClient.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => forgotPassword(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => resetPassword(data),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
  });
}

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: AUTH_KEYS.me,
    queryFn: getMe,
    enabled: isAuthenticated,
    retry: false,
  });
}
