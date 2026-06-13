import { useMutation } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import {
  mapApiUser,
  type ApiResponse,
  type ApiUser,
  type RegisterData,
  type RegisterPayload,
  type UpdateProfilePayload,
} from "@/lib/auth";

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      api.post<ApiResponse<RegisterData>>("/auth/register", payload),
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      api.patch<ApiResponse<ApiUser>>("/users/me", payload),
  });
}
export { mapApiUser };
