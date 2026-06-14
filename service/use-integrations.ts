import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import type { IntegrationProvider } from "@/types/integrations";
import * as integrationsService from "@/service/integrations.service";

export function useIntegrations() {
  return useQuery({
    queryKey: queryKeys.integrations.status,
    queryFn: () => integrationsService.getIntegrations(),
  });
}

export function useConnectIntegration() {
  return useMutation({
    mutationFn: async (provider: IntegrationProvider) => {
      const response =
        await integrationsService.getConnectUrl(provider);
      window.location.href = response.data.url;
    },
  });
}

export function useDisconnectIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: IntegrationProvider) =>
      integrationsService.disconnectIntegration(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.status,
      });
    },
  });
}
