"use client";

import { ChevronLeftIcon, MailIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { GroupContributionTab } from "@/components/groups/group-contribution-tab";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifySupervisor, useReport } from "@/service/use-reports";
import type { ApiError } from "@/types";
import type { Group } from "@/types/groups";

interface AssignmentReportDetailPageProps {
  assignmentId: string;
  groupId: string;
}

export function AssignmentReportDetailPage({
  assignmentId,
  groupId,
}: AssignmentReportDetailPageProps) {
  const { data, isLoading, isError } = useReport(assignmentId, groupId);
  const notifySupervisor = useNotifySupervisor(assignmentId, groupId);

  const report = data?.data;

  const handleNotify = async () => {
    try {
      await notifySupervisor.mutateAsync();
      toast.success("Instructor notification sent");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to send notification");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Report not found.
        </CardContent>
      </Card>
    );
  }

  const groupForTab: Group = {
    id: report.group_id,
    group_name: report.group_name ?? `Group ${report.group_number}`,
    description: null,
    assignment_status: "ACTIVE",
    git_weight: null,
    doc_weight: null,
    transcript_weight: null,
    owner_id: "",
    created_at: report.created_at,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/instructor/assignments/${assignmentId}`}>
          <Button variant="ghost" size="sm">
            <ChevronLeftIcon />
            Back to assignment
          </Button>
        </Link>
      </div>

      <PageHeader
        title={report.group_name ?? `Group ${report.group_number}`}
        description="Contribution report for this assignment group."
        action={
          report.report_status === "READY" ? (
            <Button
              variant="outline"
              onClick={handleNotify}
              disabled={notifySupervisor.isPending}
            >
              <MailIcon />
              {report.notification_sent_at ? "Resend Email" : "Email Instructor"}
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={
            report.report_status === "READY"
              ? "default"
              : report.report_status === "FAILED"
                ? "destructive"
                : "secondary"
          }
        >
          {report.report_status ?? "PROCESSING"}
        </Badge>
        {report.notification_sent_at && (
          <Badge variant="outline">Email sent</Badge>
        )}
      </div>

      {report.report_status === "PROCESSING" && (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            Report is being processed. Meeting files and participation data are
            being analyzed — this page will update automatically.
          </CardContent>
        </Card>
      )}

      {report.report_status === "FAILED" && (
        <Card>
          <CardContent className="py-6 text-sm text-destructive">
            Report processing failed. Check meeting uploads and name mappings.
          </CardContent>
        </Card>
      )}

      {(report.report_status === "READY" || report.report_status === "PROCESSING") && (
        <GroupContributionTab
          group={groupForTab}
          reportStatus={report.report_status}
        />
      )}
    </div>
  );
}
