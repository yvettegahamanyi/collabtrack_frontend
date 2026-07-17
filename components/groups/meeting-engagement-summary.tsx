"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import { DataTable } from "@/components/data-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { memberInitials } from "@/lib/groups";
import { useGroupEngagement } from "@/service/use-meetings";
import type { StudentEngagement } from "@/types/meetings";

interface MeetingEngagementSummaryProps {
  groupId: string;
}

function formatRatio(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function MeetingEngagementSummary({
  groupId,
}: MeetingEngagementSummaryProps) {
  const { data, isLoading, isError } = useGroupEngagement(groupId);
  const report = data?.data;
  const scores = report?.engagement_scores ?? [];

  const columns = useMemo<ColumnDef<StudentEngagement>[]>(
    () => [
      {
        id: "member",
        accessorFn: (row) => row.student_name,
        header: "Member",
        meta: {
          isPrimary: true,
          exportLabel: "Member",
        },
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarFallback>
                {memberInitials(row.original.student_name)}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold">{row.original.student_name}</span>
          </div>
        ),
      },
      {
        id: "attendance_ratio",
        accessorFn: (row) => formatRatio(row.attendance_ratio),
        header: "Attendance",
        meta: {
          align: "right",
          exportLabel: "Attendance",
          exportValue: (row) => formatRatio(row.attendance_ratio),
        },
      },
      {
        id: "speaking_ratio",
        accessorFn: (row) => formatRatio(row.speaking_ratio),
        header: "Speaking",
        meta: {
          align: "right",
          exportLabel: "Speaking",
          exportValue: (row) => formatRatio(row.speaking_ratio),
        },
      },
      {
        id: "chat_participation",
        accessorFn: (row) => formatRatio(row.chat_participation),
        header: "Chat",
        meta: {
          align: "right",
          exportLabel: "Chat",
          exportValue: (row) => formatRatio(row.chat_participation),
        },
      },
      {
        id: "sessions",
        accessorFn: (row) => `${row.sessions_attended}/${row.total_sessions}`,
        header: "Sessions",
        meta: {
          align: "right",
          exportLabel: "Sessions",
          exportValue: (row) =>
            `${row.sessions_attended}/${row.total_sessions}`,
        },
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.sessions_attended}/{row.original.total_sessions}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Engagement</CardTitle>
        {report && report.total_sessions > 0 && (
          <p className="text-sm text-muted-foreground">
            Aggregated across {report.total_sessions} session
            {report.total_sessions === 1 ? "" : "s"}
            {report.last_updated &&
              ` · Last updated ${new Date(
                report.last_updated
              ).toLocaleString()}`}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {isError && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Failed to load engagement scores.
          </p>
        )}

        {!isLoading && !isError && (report?.total_sessions ?? 0) === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No meeting sessions processed yet. Upload a session to see
            engagement scores.
          </p>
        )}

        {!isLoading && scores.length > 0 && (
          <DataTable
            columns={columns}
            data={scores}
            embedded
            exportable
            exportFilename="meeting-engagement.csv"
            searchColumns={[{ id: "member", label: "Member" }]}
          />
        )}
      </CardContent>
    </Card>
  );
}
