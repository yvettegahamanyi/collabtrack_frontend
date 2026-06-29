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
import {
  contributorTierBadgeVariant,
  contributorTierLabel,
} from "@/lib/groups";
import {
  useMemberParticipation,
  useMemberParticipationScore,
} from "@/service/use-participation";
import type { GoogleDocSyncEvent, MemberParticipation } from "@/types/participation";

interface ParticipationScoreModalProps {
  groupId: string;
  userId: string | null;
  memberName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fallback when API not yet synced */
  fallback?: MemberParticipation | null;
}

const FEATURE_LABELS: Record<string, string> = {
  code_commits: "Code commits share",
  code_share: "Code lines share",
  review_participation: "Review participation",
  attendance_ratio: "Meeting attendance",
  speaking_participation_ratio: "Speaking participation",
  chat_participation_ratio: "Chat participation",
  docs_contribution_share: "Docs contribution share",
  comment_activity: "Comment activity",
};

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
  const {
    data: scoreData,
    isLoading: scoreLoading,
    isError: scoreError,
  } = useMemberParticipationScore(groupId, userId ?? "");

  const participation = data?.data ?? fallback;
  const score = scoreData?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="gap-2 border-b bg-muted/20 px-6 py-5 pr-14">
          <DialogTitle className="text-lg font-semibold text-primary">
            Participation — {participation?.name ?? memberName ?? "Member"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Activity metrics and ML participation score from synced integrations.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-6">
          {scoreLoading && (
            <Skeleton className="h-24 w-full" />
          )}

          {score && (
            <div className="rounded-xl border bg-primary/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    ML participation score
                  </p>
                  <p className="text-3xl font-bold tabular-nums text-primary">
                    {Math.round(score.predicted_score * 100)}%
                  </p>
                </div>
                <Badge variant={contributorTierBadgeVariant(score.contributor_tier)}>
                  {contributorTierLabel(score.contributor_tier)}
                </Badge>
              </div>
              {Object.keys(score.features).length > 0 && (
                <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                  {Object.entries(score.features).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm"
                    >
                      <dt className="text-muted-foreground">
                        {FEATURE_LABELS[key] ?? key}
                      </dt>
                      <dd className="font-semibold tabular-nums">
                        {Math.round(value * 100)}%
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}

          {!scoreLoading && scoreError && (
            <p className="text-sm text-muted-foreground">
              No ML participation score generated yet for this member.
            </p>
          )}

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

              {participation.meeting_engagement && (
                <MetricsSection
                  title="Meeting engagement"
                  empty={false}
                  items={[
                    {
                      label: "Attendance",
                      value: `${Math.round(participation.meeting_engagement.attendance_ratio * 100)}%`,
                    },
                    {
                      label: "Speaking",
                      value: `${Math.round(participation.meeting_engagement.speaking_ratio * 100)}%`,
                    },
                    {
                      label: "Chat",
                      value: `${Math.round(participation.meeting_engagement.chat_participation * 100)}%`,
                    },
                    {
                      label: "Meeting leads",
                      value: participation.meeting_engagement.meeting_lead_count,
                    },
                  ]}
                />
              )}

              {participation.google_docs_events &&
                participation.google_docs_events.length > 0 && (
                  <GoogleDocsEventsSection
                    events={participation.google_docs_events}
                  />
                )}
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

function GoogleDocsEventsSection({ events }: { events: GoogleDocSyncEvent[] }) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <h3 className="mb-3 text-sm font-semibold">Google Docs — sync breakdown</h3>
      <p className="mb-3 text-xs text-muted-foreground">
        Raw events from the Google Drive API that contributed to this member&apos;s
        score.
      </p>
      <ul className="max-h-56 space-y-2 overflow-y-auto text-xs">
        {events.map((event, index) => (
          <li
            key={`${event.type}-${event.source_id ?? index}`}
            className="rounded-lg bg-background px-3 py-2 font-mono"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[10px] uppercase">
                {event.type}
              </Badge>
              {event.timestamp && (
                <span className="text-muted-foreground">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              )}
            </div>
            <p className="mt-1 text-muted-foreground">
              author: {event.author_name ?? "Unknown"}
              {event.author_email ? ` (${event.author_email})` : ""}
              {event.match_method ? ` · matched via ${event.match_method}` : ""}
            </p>
            <p className="text-muted-foreground">
              source: {event.source_id ?? "—"} · file: {event.file_id}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MetricsSection({
  title,
  items,
  empty,
}: {
  title: string;
  items: { label: string; value: number | string }[];
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
