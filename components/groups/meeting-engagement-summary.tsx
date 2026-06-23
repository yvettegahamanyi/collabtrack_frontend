"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { memberInitials } from "@/lib/groups";
import { useGroupEngagement } from "@/service/use-meetings";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Engagement</CardTitle>
        {report && report.total_sessions > 0 && (
          <p className="text-sm text-muted-foreground">
            Aggregated across {report.total_sessions} session
            {report.total_sessions === 1 ? "" : "s"}
            {report.last_updated &&
              ` · Last updated ${new Date(report.last_updated).toLocaleString()}`}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead className="text-right">Attendance</TableHead>
                <TableHead className="text-right">Speaking</TableHead>
                <TableHead className="text-right">Chat</TableHead>
                <TableHead className="text-right">Lead count</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.map((score) => (
                <TableRow key={score.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarFallback>
                          {memberInitials(score.student_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{score.student_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRatio(score.attendance_ratio)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRatio(score.speaking_ratio)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRatio(score.chat_participation)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {score.meeting_lead_count}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {score.sessions_attended}/{score.total_sessions}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
