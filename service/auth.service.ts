import { api } from "@/lib/api-client";
import type {
  ApiResponse,
  ApiUser,
  LoginData,
  LoginPayload,
  RegisterData,
  RegisterPayload,
  UpdateProfilePayload,
} from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";

export function register(payload: RegisterPayload) {
  return api.post<ApiResponse<RegisterData>>("/auth/register", payload);
}

export function login(payload: LoginPayload) {
  return api.post<ApiResponse<LoginData>>("/auth/login", payload);
}

export function getMe() {
  return api.get<ApiResponse<ApiUser>>("/users/me");
}

export function updateProfile(payload: UpdateProfilePayload) {
  return api.patch<ApiResponse<ApiUser>>("/users/me", payload);
}

/** Authenticates, fetches the current profile, and returns both. */
export async function loginWithProfile(payload: LoginPayload) {
  const loginResponse = await login(payload);
  const { access_token } = loginResponse.data;

  useAuthStore.getState().setToken(access_token);

  try {
    const profileResponse = await getMe();
    return { access_token, user: profileResponse.data };
  } catch (error) {
    useAuthStore.getState().logout();
    throw error;
  }
}
