"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemberParticipation } from "@/service/use-participation";
import type { MemberParticipation } from "@/types/participation";

interface ParticipationScoreModalProps {
  groupId: string;
  userId: string | null;
  memberName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fallback when API not yet synced */
  fallback?: MemberParticipation | null;
}

export function ParticipationScoreModal({
  groupId,
  userId,
  memberName,
  open,
  onOpenChange,
  fallback,
}: ParticipationScoreModalProps) {
  const { data, isLoading, isError } = useMemberParticipation(
    groupId,
    userId ?? ""
  );

  const participation = data?.data ?? fallback;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="gap-2 border-b bg-muted/20 px-6 py-5 pr-14">
          <DialogTitle className="text-lg font-semibold text-primary">
            Participation — {participation?.name ?? memberName ?? "Member"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Raw activity metrics from connected GitHub and Google Docs
            integrations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-6">
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {isError && !fallback && (
            <p className="text-sm text-destructive">
              Failed to load participation data. Try syncing the group first.
            </p>
          )}

          {participation && (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge variant={participation.github_connected ? "secondary" : "outline"}>
                  GitHub {participation.github_connected ? "connected" : "not connected"}
                </Badge>
                <Badge variant={participation.google_connected ? "secondary" : "outline"}>
                  Google {participation.google_connected ? "connected" : "not connected"}
                </Badge>
                {participation.github_login && (
                  <Badge variant="outline">@{participation.github_login}</Badge>
                )}
                {participation.google_email_matched === false && (
                  <Badge variant="outline" className="text-destructive">
                    Google email mismatch
                  </Badge>
                )}
              </div>

              <MetricsSection
                title="GitHub"
                empty={!participation.github_connected || !participation.github}
                items={
                  participation.github
                    ? [
                        { label: "Total commits", value: participation.github.total_commits },
                        { label: "Lines changed", value: participation.github.lines_changed },
                        { label: "PRs created", value: participation.github.prs_created },
                        { label: "PRs reviewed", value: participation.github.prs_reviewed },
                        { label: "Comments", value: participation.github.comments },
                      ]
                    : []
                }
              />

              <MetricsSection
                title="Google Docs"
                empty={
                  !participation.google_connected || !participation.google_docs
                }
                items={
                  participation.google_docs
                    ? [
                        { label: "Edits", value: participation.google_docs.edits },
                        {
                          label: "Comments",
                          value: participation.google_docs.comments,
                        },
                      ]
                    : []
                }
              />
            </>
          )}

          {!isLoading && !participation && (
            <p className="text-sm text-muted-foreground">
              No participation data available yet.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetricsSection({
  title,
  items,
  empty,
}: {
  title: string;
  items: { label: string; value: number }[];
  empty: boolean;
}) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {empty ? (
        <p className="text-sm text-muted-foreground">No data — not connected or not synced.</p>
      ) : (
        <dl className="grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm"
            >
              <dt className="text-muted-foreground">{item.label}</dt>
              <dd className="font-semibold tabular-nums">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
