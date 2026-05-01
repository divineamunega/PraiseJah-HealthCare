import axios from "axios";
import {
  getAccessToken,
  setAccessToken,
} from "@/features/auth/utils/token.util";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<any> | null = null;

api.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data && typeof data === "object" && "success" in data) {
      if (data.success) {
        response.data = data.data ?? { message: data.message };
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${import.meta.env.VITE_API_URL || "/api/v1"}/auth/refresh`, null, { withCredentials: true })
          .then((res) => {
            const data = res.data?.data ?? res.data;
            setAccessToken(data.accessToken);
            return data;
          })
          .catch((err) => {
            setAccessToken(null);
            throw err;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        await refreshPromise;
        const token = getAccessToken();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch {
        setAccessToken(null);
        window.location.href = "/login";
        return Promise.reject(
          new Error("Session expired. Please log in again."),
        );
      }
    }

    const message =
      error.response?.data?.message || "An unexpected error occurred";
    return Promise.reject(new Error(message));
  },
);

export default api;
