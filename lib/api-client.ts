import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

import { useAuthStore } from "@/stores/auth-store";
import type { ApiError } from "@/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

/**
 * Shared Axios instance for all API calls.
 * Use the typed `api` helper below from TanStack Query hooks.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the auth token (from the Zustand store) to every request.
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize Axios errors into the app's typed ApiError shape.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const apiError: ApiError = {
      message:
        error.response?.data?.message ?? error.message ?? "Request failed",
      statusCode: error.response?.status ?? 0,
      details: error.response?.data,
    };
    return Promise.reject(apiError);
  }
);

const unwrap = <T>(promise: Promise<AxiosResponse<T>>): Promise<T> =>
  promise.then((res) => res.data);

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    unwrap<T>(apiClient.get<T>(url, config)),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    unwrap<T>(apiClient.post<T>(url, data, config)),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    unwrap<T>(apiClient.put<T>(url, data, config)),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    unwrap<T>(apiClient.patch<T>(url, data, config)),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    unwrap<T>(apiClient.delete<T>(url, config)),
  postForm: <T>(url: string, data: FormData, config?: AxiosRequestConfig) =>
    unwrap<T>(
      apiClient.post<T>(url, data, {
        ...config,
        headers: {
          ...config?.headers,
          "Content-Type": "multipart/form-data",
        },
      })
    ),
};
