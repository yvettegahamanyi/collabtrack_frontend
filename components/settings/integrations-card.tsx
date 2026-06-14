"use client";

import {
  ChevronRightIcon,
  FileTextIcon,
  GitBranchIcon,
  LoaderIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useConnectIntegration,
  useDisconnectIntegration,
  useIntegrations,
} from "@/service/use-integrations";
import type { ApiError } from "@/types";
import type { IntegrationProvider } from "@/types/integrations";

const PROVIDERS: {
  id: IntegrationProvider;
  name: string;
  icon: typeof GitBranchIcon;
}[] = [
  { id: "github", name: "GitHub", icon: GitBranchIcon },
  { id: "google", name: "Google Docs", icon: FileTextIcon },
];

export function IntegrationsCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading, isError, refetch } = useIntegrations();
  const connect = useConnectIntegration();
  const disconnect = useDisconnectIntegration();

  const status = data?.data;

  useEffect(() => {
    const integration = searchParams.get("integration");
    const integrationStatus = searchParams.get("status");
    const message = searchParams.get("message");

    if (!integration || !integrationStatus) return;

    if (integrationStatus === "success") {
      toast.success(
        `${integration === "github" ? "GitHub" : "Google Docs"} connected successfully`
      );
      refetch();
    } else {
      toast.error(message ?? "Failed to connect integration");
    }

    router.replace("/student/settings");
  }, [searchParams, router, refetch]);

  const handleAction = async (provider: IntegrationProvider, connected: boolean) => {
    try {
      if (connected) {
        await disconnect.mutateAsync(provider);
        toast.success("Integration disconnected");
      } else {
        await connect.mutateAsync(provider);
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Integration action failed");
    }
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-base">Apps & Integrations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-6">
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            Failed to load integrations.{" "}
            <button
              type="button"
              className="underline"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </p>
        )}

        {status &&
          PROVIDERS.map((item) => {
            const providerStatus =
              item.id === "github" ? status.github : status.google;
            const connected = providerStatus.connected;
            const isBusy =
              connect.isPending ||
              (disconnect.isPending &&
                disconnect.variables === item.id);

            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-background text-primary">
                    <item.icon className="size-4" />
                  </span>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {connected && item.id === "github" && providerStatus.login && (
                      <p className="text-xs text-muted-foreground">
                        @{providerStatus.login}
                      </p>
                    )}
                    {connected &&
                      providerStatus.email_matched === false && (
                        <p className="text-xs text-destructive">
                          Email does not match your account
                        </p>
                      )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      connected
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-destructive/30 bg-destructive/10 text-destructive"
                    )}
                  >
                    {connected ? "Connected" : "Disconnected"}
                  </Badge>
                  <Button
                    type="button"
                    variant={connected ? "outline" : "default"}
                    size="sm"
                    disabled={isBusy}
                    onClick={() => handleAction(item.id, connected)}
                  >
                    {isBusy ? (
                      <LoaderIcon className="size-4 animate-spin" />
                    ) : connected ? (
                      "Disconnect"
                    ) : (
                      <>
                        Connect
                        <ChevronRightIcon className="size-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}

        <p className="text-xs leading-relaxed text-muted-foreground">
          Connecting these services allows CollabTrack to analyze commit
          histories and document collaboration metrics.
        </p>
      </CardContent>
    </Card>
  );
}
