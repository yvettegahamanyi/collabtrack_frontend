"use client";

import { DownloadIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ParticipationScoreModal } from "@/components/groups/participation-score-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { memberInitials } from "@/lib/groups";
import {
  useGroupContributions,
  useSyncGroup,
} from "@/service/use-participation";
import type { ApiError } from "@/types";
import type { Group } from "@/types/groups";
import type { MemberParticipation } from "@/types/participation";

interface GroupContributionTabProps {
  group: Group;
}

export function GroupContributionTab({ group }: GroupContributionTabProps) {
  const { data, isLoading, isError, refetch } = useGroupContributions(group.id);
  const syncGroup = useSyncGroup(group.id);
  const [selectedMember, setSelectedMember] =
    useState<MemberParticipation | null>(null);

  const contributions = data?.data;
  const members = contributions?.members ?? [];

  const handleSync = async () => {
    try {
      await syncGroup.mutateAsync();
      await refetch();
      toast.success("Participation data synced");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Sync failed");
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
    ];
    const rows = members.map((m) => [
      m.name,
      m.email,
      m.github?.total_commits ?? "",
      m.github?.lines_changed ?? "",
      m.github?.prs_created ?? "",
      m.github?.prs_reviewed ?? "",
      m.github?.comments ?? "",
      m.google_docs?.edits ?? "",
      m.google_docs?.comments ?? "",
    ]);

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
    <div className="space-y-6">
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
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={syncGroup.isPending}
          >
            <RefreshCwIcon
              className={syncGroup.isPending ? "animate-spin" : undefined}
            />
            Sync
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <DownloadIcon />
            Download Report
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
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
                <Link
                  href={`${ROUTES.student}/settings`}
                  className="text-primary underline"
                >
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
              No participation data yet. Link a repo and Google Doc, then sync.
            </p>
          )}

          {!isLoading && members.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className="text-right">Commits</TableHead>
                  <TableHead className="text-right">Lines</TableHead>
                  <TableHead className="text-right">PRs</TableHead>
                  <TableHead className="text-right">Doc Edits</TableHead>
                  <TableHead className="text-right">Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const gh = member.github;
                  const docs = member.google_docs;
                  const totalComments =
                    (gh?.comments ?? 0) + (docs?.comments ?? 0);

                  return (
                    <TableRow
                      key={member.user_id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedMember(member)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            <AvatarFallback>
                              {memberInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {gh?.total_commits ?? "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {gh?.lines_changed ?? "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {gh
                          ? `${gh.prs_created}/${gh.prs_reviewed}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {docs?.edits ?? "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {totalComments || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
