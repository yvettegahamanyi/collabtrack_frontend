import { api } from "@/lib/api-client";
import type {
  ConnectUrlResponse,
  IntegrationProvider,
  IntegrationsResponse,
} from "@/types/integrations";

export function getIntegrations() {
  return api.get<IntegrationsResponse>("/integrations");
}

export function getConnectUrl(provider: IntegrationProvider) {
  return api.get<ConnectUrlResponse>(`/integrations/${provider}/connect-url`);
}

export function disconnectIntegration(provider: IntegrationProvider) {
  return api.delete<{ data: null; message: string; code: number }>(
    `/integrations/${provider}`
  );
}
