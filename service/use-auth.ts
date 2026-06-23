import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { mapApiUser } from "@/lib/auth";
import { queryKeys } from "@/lib/query-keys";
import * as authService from "@/service/auth.service";
import { prefetchIntegrations } from "@/service/use-integrations";

export function useRegister() {
  return useMutation({
    mutationFn: authService.register,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.loginWithProfile,
    onSuccess: ({ user }) => {
      void prefetchIntegrations(queryClient, mapApiUser(user).id);
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authService.getMe,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export { mapApiUser };
