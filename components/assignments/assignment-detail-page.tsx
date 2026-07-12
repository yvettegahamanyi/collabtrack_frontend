"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ChevronLeftIcon, MoreVerticalIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table";
import { DataTableStatusBadge } from "@/components/data-table-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { CreateAssignmentReportWizard } from "@/components/reports/create-assignment-report-wizard";
import { SetupGroupCollaborationWizard } from "@/components/reports/setup-group-collaboration-wizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import * as reportsService from "@/service/reports.service";
import { useAssignment } from "@/service/use-assignments";
import type { ApiError } from "@/types";
import type { AssignmentReport } from "@/types/reports";

interface AssignmentDetailPageProps {
  assignmentId: string;
}

function reportStatusTone(
  status: AssignmentReport["report_status"]
): "success" | "danger" | "warning" | "neutral" {
  switch (status) {
    case "READY":
      return "success";
    case "FAILED":
      return "danger";
    case "PROCESSING":
      return "warning";
    default:
      return "neutral";
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
  const [setupReport, setSetupReport] = useState<AssignmentReport | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);

  const assignment = data?.data;
  const reports = assignment?.reports ?? [];

  const handleReportCreated = (groupId: string) => {
    router.push(
      `/instructor/assignments/${assignmentId}/reports/${groupId}?tab=contribution`
    );
  };

  const handleOpenSetup = (report: AssignmentReport) => {
    setSetupReport(report);
    setSetupOpen(true);
  };

  const handleSetupComplete = (groupId: string) => {
    router.push(
      `/instructor/assignments/${assignmentId}/reports/${groupId}?tab=contribution`
    );
  };

  const handleSyncMoodleGrades = async (report: AssignmentReport) => {
    try {
      const response = await reportsService.syncMoodleGrades(
        assignmentId,
        report.group_id
      );
      const result = response.data;
      if (result.failed_count > 0 || result.skipped_count > 0) {
        toast.warning(
          `${report.group_name ?? "Group"}: synced ${result.synced_count} grade(s) (${result.failed_count} failed, ${result.skipped_count} skipped).`
        );
      } else {
        toast.success(
          `${report.group_name ?? "Group"}: synced ${result.synced_count} grade(s) to Moodle.`
        );
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to sync grades to Moodle");
    }
  };

  const columns = useMemo<ColumnDef<AssignmentReport>[]>(
    () => [
      {
        id: "group",
        accessorFn: (row) =>
          row.group_name ?? `Group ${row.group_number ?? ""}`.trim(),
        header: "Group",
        meta: {
          isPrimary: true,
          exportLabel: "Group",
          exportValue: (row) =>
            row.group_name ?? `Group ${row.group_number ?? ""}`.trim(),
        },
        cell: ({ row }) => (
          <Link
            href={`/instructor/assignments/${assignmentId}/reports/${row.original.group_id}?tab=contribution`}
            className="font-semibold text-primary hover:underline"
          >
            {row.original.group_name ?? `Group ${row.original.group_number}`}
          </Link>
        ),
      },
      {
        id: "report_status",
        accessorFn: (row) => row.report_status ?? "DRAFT",
        header: "Status",
        meta: {
          exportLabel: "Status",
          exportValue: (row) => row.report_status ?? "DRAFT",
        },
        cell: ({ row }) => (
          <DataTableStatusBadge
            label={row.original.report_status ?? "DRAFT"}
            tone={reportStatusTone(row.original.report_status)}
          />
        ),
      },
      {
        id: "created_at",
        accessorFn: (row) => formatDate(row.created_at),
        header: "Created",
        meta: {
          exportLabel: "Created",
          exportValue: (row) => formatDate(row.created_at),
          headerClassName: "hidden sm:table-cell",
          cellClassName: "hidden sm:table-cell",
        },
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.created_at)}
          </span>
        ),
      },
      {
        id: "notification",
        accessorFn: (row) =>
          row.notification_sent_at
            ? `Sent ${formatDate(row.notification_sent_at)}`
            : "Not sent",
        header: "Notification",
        meta: {
          exportLabel: "Notification",
          exportValue: (row) =>
            row.notification_sent_at
              ? formatDate(row.notification_sent_at)
              : "Not sent",
          headerClassName: "hidden md:table-cell",
          cellClassName: "hidden md:table-cell",
        },
        cell: ({ row }) =>
          row.original.notification_sent_at ? (
            <span className="text-muted-foreground">
              Sent {formatDate(row.original.notification_sent_at)}
            </span>
          ) : (
            <span className="text-muted-foreground">Not sent</span>
          ),
      },
      {
        id: "actions",
        header: "Actions",
        meta: { align: "right", hideOnExport: true },
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${row.original.group_name ?? "group"}`}
                  >
                    <MoreVerticalIcon className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => handleOpenSetup(row.original)}
                  >
                    {row.original.has_collaboration_resources
                      ? "Add collaboration data"
                      : "Setup collaboration"}
                  </DropdownMenuItem>
                  {row.original.moodle_grade_sync_available && (
                    <DropdownMenuItem
                      onClick={() => handleSyncMoodleGrades(row.original)}
                    >
                      Push grades to Moodle
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    render={
                      <Link
                        href={`/instructor/assignments/${assignmentId}/reports/${row.original.group_id}?tab=contribution`}
                      />
                    }
                  >
                    View report
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [assignmentId]
  );

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
            <DataTableStatusBadge
              label={assignment.status === "ACTIVE" ? "Active" : "Done"}
              tone={assignment.status === "ACTIVE" ? "success" : "neutral"}
            />
          </div>
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

        <DataTable
          columns={columns}
          data={reports}
          emptyMessage="No reports yet. Upload an attendance file to create Group 1."
          exportable
          exportFilename={`${assignment.title.replace(/\s+/g, "-").toLowerCase()}-reports.csv`}
          searchColumns={[
            { id: "group", label: "Group" },
            { id: "report_status", label: "Status" },
          ]}
        />
      </div>

      <CreateAssignmentReportWizard
        assignmentId={assignmentId}
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onCreated={handleReportCreated}
      />

      <SetupGroupCollaborationWizard
        assignmentId={assignmentId}
        report={setupReport}
        open={setupOpen}
        onOpenChange={setSetupOpen}
        onComplete={handleSetupComplete}
      />
    </div>
  );
}
