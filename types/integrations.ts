import type { ApiResponse } from "@/lib/auth";

export type IntegrationProvider = "github" | "google";

export interface ProviderIntegrationStatus {
  connected: boolean;
  login?: string | null;
  email?: string | null;
  email_matched?: boolean | null;
  connected_at?: string | null;
}

export interface IntegrationsStatus {
  github: ProviderIntegrationStatus;
  google: ProviderIntegrationStatus;
}

export interface ConnectUrlData {
  url: string;
}

export type IntegrationsResponse = ApiResponse<IntegrationsStatus>;
export type ConnectUrlResponse = ApiResponse<ConnectUrlData>;
