"use client";

import { DownloadIcon, RefreshCwIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ParticipationScoreModal } from "@/components/groups/participation-score-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/lib/constants";
import {
  canGenerateParticipationScores,
  contributorTierBadgeVariant,
  contributorTierLabel,
  memberInitials,
  outlierBadgeVariant,
  outlierTypeLabel,
} from "@/lib/groups";
import {
  useGenerateParticipationScores,
  useGroupContributions,
  useGroupParticipationScores,
  useSyncGroup,
} from "@/service/use-participation";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiError } from "@/types";
import type { Group } from "@/types/groups";
import type { MemberParticipation } from "@/types/participation";

interface GroupContributionTabProps {
  group: Group;
  reportStatus?: "DRAFT" | "PROCESSING" | "READY" | "FAILED" | null;
}

export function GroupContributionTab({
  group,
  reportStatus,
}: GroupContributionTabProps) {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, refetch } = useGroupContributions(group.id);
  const {
    data: scoresData,
    isLoading: scoresLoading,
    refetch: refetchScores,
  } = useGroupParticipationScores(group.id);
  const syncGroup = useSyncGroup(group.id);
  const generateScores = useGenerateParticipationScores(group.id);
  const [selectedMember, setSelectedMember] =
    useState<MemberParticipation | null>(null);

  const contributions = data?.data;
  const members = contributions?.members ?? [];
  const scores = scoresData?.data.scores ?? [];
  const scoresByUserId = Object.fromEntries(
    scores.map((score) => [score.user_id, score])
  );
  const hasScores = scores.length > 0;
  const hasOutlierInsights = scores.some((score) => score.outlier != null);
  const hasMeetingFromScores = scores.some(
    (score) => (score.features.attendance_ratio ?? 0) > 0
  );
  const hasMeetingEngagement =
    members.some((m) => m.meeting_engagement) || hasMeetingFromScores;
  const canGenerate =
    group.assignment_status === "DONE" &&
    canGenerateParticipationScores(user, group) &&
    !hasScores;
  const hasSyncedData = Boolean(contributions?.last_synced_at);

  useEffect(() => {
    if (reportStatus === "READY" || contributions?.last_synced_at) {
      void refetchScores();
    }
  }, [reportStatus, contributions?.last_synced_at, refetchScores]);

  useEffect(() => {
    if (hasScores) {
      void refetch();
    }
  }, [hasScores, refetch]);

  const formatRatio = (value: number) => `${Math.round(value * 100)}%`;

  const handleSync = async () => {
    try {
      const response = await syncGroup.mutateAsync();
      await refetch();
      await refetchScores();
      const warnings = response.data.warnings ?? [];
      if (warnings.length > 0) {
        toast.warning(warnings.join(" "));
      } else {
        toast.success("Participation data synced");
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Sync failed");
    }
  };

  const handleGenerateScores = async () => {
    if (!hasSyncedData) {
      toast.error("Sync participation data before generating scores.");
      return;
    }

    try {
      const response = await generateScores.mutateAsync();
      await refetchScores();
      const warnings = response.data.warnings ?? [];
      if (warnings.length > 0) {
        toast.warning(warnings.join(" "));
      } else {
        toast.success("Participation scores generated");
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to generate scores");
    }
  };

  const handleDownload = () => {
    if (members.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Commits",
      "Lines Changed",
      "PRs Created",
      "PRs Reviewed",
      "GitHub Comments",
      "Doc Edits",
      "Doc Comments",
      ...(hasScores ? ["Participation Score", "Contributor Tier"] : []),
      ...(hasOutlierInsights
        ? ["Outlier Flag", "Outlier Type", "Anomaly Score"]
        : []),
      ...(hasMeetingEngagement
        ? ["Attendance", "Speaking", "Chat", "Meeting Leads"]
        : []),
    ];
    const rows = members.map((m) => {
      const score = scoresByUserId[m.user_id];
      return [
        m.name,
        m.email,
        m.github?.total_commits ?? "",
        m.github?.lines_changed ?? "",
        m.github?.prs_created ?? "",
        m.github?.prs_reviewed ?? "",
        m.github?.comments ?? "",
        m.google_docs?.edits ?? "",
        m.google_docs?.comments ?? "",
        ...(hasScores
          ? [
              score ? `${Math.round(score.predicted_score * 100)}%` : "",
              score ? contributorTierLabel(score.contributor_tier) : "",
            ]
          : []),
        ...(hasOutlierInsights
          ? [
              score?.outlier?.is_outlier ? "Yes" : score ? "No" : "",
              score?.outlier
                ? outlierTypeLabel(score.outlier.outlier_type)
                : "",
              score?.outlier
                ? score.outlier.anomaly_score.toFixed(3)
                : "",
            ]
          : []),
        ...(hasMeetingEngagement
          ? [
              m.meeting_engagement
                ? `${Math.round(m.meeting_engagement.attendance_ratio * 100)}%`
                : "",
              m.meeting_engagement
                ? `${Math.round(m.meeting_engagement.speaking_ratio * 100)}%`
                : "",
              m.meeting_engagement
                ? `${Math.round(m.meeting_engagement.chat_participation * 100)}%`
                : "",
              m.meeting_engagement?.meeting_lead_count ?? "",
            ]
          : []),
      ];
    });

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${group.group_name}-contributions.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-w-0 max-w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Contribution Breakdown</h2>
          <p className="text-sm text-muted-foreground">
            Raw participation metrics for {group.group_name}.
            {contributions?.last_synced_at && (
              <>
                {" "}
                Last synced{" "}
                {new Date(contributions.last_synced_at).toLocaleString()}.
              </>
            )}
            {hasScores && scoresData?.data.generated_at && (
              <>
                {" "}
                Scores generated{" "}
                {new Date(scoresData.data.generated_at).toLocaleString()}.
              </>
            )}
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          {canGenerate && (
            <Button
              className="flex-1 sm:flex-none"
              onClick={handleGenerateScores}
              disabled={generateScores.isPending || !hasSyncedData}
            >
              <SparklesIcon
                className={generateScores.isPending ? "animate-pulse" : undefined}
              />
              <span className="hidden sm:inline">Generate participation score</span>
              <span className="sm:hidden">Generate score</span>
            </Button>
          )}
          <Button
            className="flex-1 sm:flex-none"
            variant="outline"
            onClick={handleSync}
            disabled={syncGroup.isPending}
          >
            <RefreshCwIcon
              className={syncGroup.isPending ? "animate-spin" : undefined}
            />
            Sync
          </Button>
          <Button
            className="flex-1 sm:flex-none"
            variant="outline"
            onClick={handleDownload}
          >
            <DownloadIcon />
            <span className="hidden sm:inline">Download Report</span>
            <span className="sm:hidden">Download</span>
          </Button>
        </div>
      </div>

      {canGenerate && !hasSyncedData && (
        <p className="text-sm text-muted-foreground">
          Sync participation data first, then generate ML participation scores.
        </p>
      )}

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Member Activity</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0">
          {(isLoading || scoresLoading) && (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {isError && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <p>Failed to load contribution data.</p>
              <p className="mt-2">
                Link resources in Overview, connect integrations in{" "}
                <Link href={ROUTES.settings} className="text-primary underline">
                  Settings
                </Link>
                , then sync.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !isError && members.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No participation data yet. Link repos and Google Docs in Overview,
              then sync.
            </p>
          )}

          {!isLoading && members.length > 0 && (
            <>
              <p className="mb-3 text-xs text-muted-foreground lg:hidden">
                Swipe horizontally to see all metrics.
              </p>
              <div className="-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
                <Table className="min-w-4xl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 z-10 min-w-36 bg-card shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                        Member
                      </TableHead>
                      {hasScores && (
                        <TableHead className="text-right">Score</TableHead>
                      )}
                      {hasOutlierInsights && (
                        <TableHead>Outlier</TableHead>
                      )}
                      <TableHead className="text-right">Commits</TableHead>
                      <TableHead className="hidden text-right md:table-cell">
                        Lines
                      </TableHead>
                      <TableHead className="hidden text-right lg:table-cell">
                        PRs
                      </TableHead>
                      <TableHead className="hidden text-right lg:table-cell">
                        Doc Edits
                      </TableHead>
                      <TableHead className="hidden text-right xl:table-cell">
                        Comments
                      </TableHead>
                      {hasMeetingEngagement && (
                        <>
                          <TableHead className="text-right">Attendance</TableHead>
                          <TableHead className="hidden text-right md:table-cell">
                            Speaking
                          </TableHead>
                          <TableHead className="hidden text-right lg:table-cell">
                            Chat
                          </TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => {
                      const gh = member.github;
                      const docs = member.google_docs;
                      const score = scoresByUserId[member.user_id];
                      const meeting =
                        member.meeting_engagement ??
                        (score?.features
                          ? {
                              attendance_ratio:
                                score.features.attendance_ratio ?? 0,
                              speaking_ratio:
                                score.features.speaking_participation_ratio ??
                                0,
                              chat_participation:
                                score.features.chat_participation_ratio ?? 0,
                              meeting_lead_count: 0,
                            }
                          : null);
                      const totalComments =
                        (gh?.comments ?? 0) + (docs?.comments ?? 0);

                      return (
                        <TableRow
                          key={member.user_id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedMember(member)}
                        >
                          <TableCell className="sticky left-0 z-10 min-w-36 bg-card whitespace-normal shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)]">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Avatar size="sm" className="shrink-0">
                                <AvatarFallback>
                                  {memberInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="truncate font-medium">
                                  {member.name}
                                </p>
                                <p className="hidden truncate text-xs text-muted-foreground sm:block">
                                  {member.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          {hasScores && (
                            <TableCell className="text-right">
                              {score ? (
                                <div className="flex flex-col items-end gap-1">
                                  <span className="font-semibold tabular-nums">
                                    {formatRatio(score.predicted_score)}
                                  </span>
                                  <Badge
                                    variant={contributorTierBadgeVariant(
                                      score.contributor_tier
                                    )}
                                    className="text-[10px]"
                                  >
                                    {contributorTierLabel(score.contributor_tier)}
                                  </Badge>
                                </div>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                          )}
                          {hasOutlierInsights && (
                            <TableCell>
                              {score?.outlier ? (
                                <div className="flex flex-col gap-1">
                                  <Badge
                                    variant={outlierBadgeVariant(
                                      score.outlier.outlier_type,
                                      score.outlier.is_outlier
                                    )}
                                    className="w-fit text-[10px]"
                                  >
                                    {outlierTypeLabel(score.outlier.outlier_type)}
                                  </Badge>
                                  {score.outlier.is_outlier && (
                                    <span className="text-[11px] tabular-nums text-muted-foreground">
                                      {score.outlier.anomaly_score.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                          )}
                          <TableCell className="text-right tabular-nums">
                            {gh?.total_commits ?? "—"}
                          </TableCell>
                          <TableCell className="hidden text-right tabular-nums md:table-cell">
                            {gh?.lines_changed ?? "—"}
                          </TableCell>
                          <TableCell className="hidden text-right tabular-nums lg:table-cell">
                            {gh ? `${gh.prs_created}/${gh.prs_reviewed}` : "—"}
                          </TableCell>
                          <TableCell className="hidden text-right tabular-nums lg:table-cell">
                            {docs?.edits ?? "—"}
                          </TableCell>
                          <TableCell className="hidden text-right tabular-nums xl:table-cell">
                            {totalComments || "—"}
                          </TableCell>
                          {hasMeetingEngagement && (
                            <>
                              <TableCell className="text-right tabular-nums">
                                {meeting
                                  ? formatRatio(meeting.attendance_ratio)
                                  : "—"}
                              </TableCell>
                              <TableCell className="hidden text-right tabular-nums md:table-cell">
                                {meeting
                                  ? formatRatio(meeting.speaking_ratio)
                                  : "—"}
                              </TableCell>
                              <TableCell className="hidden text-right tabular-nums lg:table-cell">
                                {meeting
                                  ? formatRatio(meeting.chat_participation)
                                  : "—"}
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            Click a row to view the full participation breakdown.
          </p>
        </CardContent>
      </Card>

      <ParticipationScoreModal
        groupId={group.id}
        userId={selectedMember?.user_id ?? null}
        memberName={selectedMember?.name}
        open={Boolean(selectedMember)}
        onOpenChange={(open) => {
          if (!open) setSelectedMember(null);
        }}
        fallback={selectedMember}
      />
    </div>
  );
}
