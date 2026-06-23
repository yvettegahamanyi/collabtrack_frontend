import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import * as integrationsService from "@/service/integrations.service";
import { useAuthStore } from "@/stores/auth-store";
import type { IntegrationProvider } from "@/types/integrations";

export function prefetchIntegrations(queryClient: QueryClient, userId: string) {
  return queryClient.fetchQuery({
    queryKey: queryKeys.integrations.status(userId),
    queryFn: () => integrationsService.getIntegrations(),
  });
}

export function clearIntegrationsCache(queryClient: QueryClient) {
  queryClient.removeQueries({ queryKey: queryKeys.integrations.all });
}

export function useIntegrations() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: queryKeys.integrations.status(userId ?? ""),
    queryFn: () => integrationsService.getIntegrations(),
    enabled: Boolean(userId),
  });
}

export function useConnectIntegration() {
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (provider: IntegrationProvider) => {
      const response = await integrationsService.getConnectUrl(provider);
      window.location.href = response.data.url;
    },
    onSuccess: () => {
      if (!userId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.status(userId),
      });
    },
  });
}

export function useDisconnectIntegration() {
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (provider: IntegrationProvider) =>
      integrationsService.disconnectIntegration(provider),
    onSuccess: () => {
      if (!userId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.status(userId),
      });
    },
  });
}
