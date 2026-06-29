"use client";

import { ChevronLeftIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { CreateAssignmentReportWizard } from "@/components/reports/create-assignment-report-wizard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAssignment } from "@/service/use-assignments";
import type { AssignmentReport } from "@/types/reports";

interface AssignmentDetailPageProps {
  assignmentId: string;
}

function reportStatusVariant(status: AssignmentReport["report_status"]) {
  switch (status) {
    case "READY":
      return "default" as const;
    case "FAILED":
      return "destructive" as const;
    case "PROCESSING":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AssignmentDetailPage({
  assignmentId,
}: AssignmentDetailPageProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useAssignment(assignmentId);
  const [wizardOpen, setWizardOpen] = useState(false);

  const assignment = data?.data;
  const reports = assignment?.reports ?? [];

  const handleReportCreated = (groupId: string) => {
    router.push(
      `/instructor/assignments/${assignmentId}/reports/${groupId}?tab=contribution`
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !assignment) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Assignment not found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/instructor/classes/${assignment.class_id}`}>
          <Button variant="ghost" size="sm">
            <ChevronLeftIcon />
            Back to {assignment.class_name ?? "class"}
          </Button>
        </Link>
      </div>

      <PageHeader
        title={assignment.title}
        description={
          assignment.description ??
          "Create reports by uploading attendance lists for each group."
        }
        action={
          <Button onClick={() => setWizardOpen(true)}>
            <PlusIcon />
            Create Report
          </Button>
        }
      />

      <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm">
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <span className="text-muted-foreground">Class: </span>
            <Link
              href={`/instructor/classes/${assignment.class_id}`}
              className="font-medium text-primary hover:underline"
            >
              {assignment.class_name ?? "View class"}
            </Link>
          </div>
          <div>
            <span className="text-muted-foreground">Status: </span>
            <Badge
              variant={assignment.status === "ACTIVE" ? "default" : "secondary"}
              className="ml-1"
            >
              {assignment.status === "ACTIVE" ? "Active" : "Done"}
            </Badge>
          </div>
          {/* <div>
            <span className="text-muted-foreground">Instructor: </span>
            <span>{assignment.supervisor_email ?? "Your account email"}</span>
          </div> */}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Reports</h2>
          <p className="text-sm text-muted-foreground">
            {reports.length} group report{reports.length === 1 ? "" : "s"} for
            this assignment
          </p>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No reports yet. Upload an attendance file to create Group 1.
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Created
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Notification
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.group_id}>
                    <TableCell>
                      <Link
                        href={`/instructor/assignments/${assignmentId}/reports/${report.group_id}?tab=contribution`}
                        className="font-medium text-primary hover:underline"
                      >
                        {report.group_name ?? `Group ${report.group_number}`}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={reportStatusVariant(report.report_status)}
                      >
                        {report.report_status ?? "DRAFT"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {formatDate(report.created_at)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {report.notification_sent_at ? (
                        <span className="text-muted-foreground">
                          Sent {formatDate(report.notification_sent_at)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Not sent</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/instructor/assignments/${assignmentId}/reports/${report.group_id}?tab=contribution`}
                      >
                        <Button size="sm" variant="outline">
                          View Report
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <CreateAssignmentReportWizard
        assignmentId={assignmentId}
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onCreated={handleReportCreated}
      />
    </div>
  );
}
