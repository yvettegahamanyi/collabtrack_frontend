"use client";

import { ClockIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatRelativeTime } from "@/lib/groups";
import {
  reportDetailHref,
  reportGroupLabel,
  reportStatusLabel,
  reportStatusVariant,
} from "@/lib/reports";
import type { DashboardReportRow } from "@/types/instructor-dashboard";

interface FailedReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reports: DashboardReportRow[];
}

export function FailedReportsDialog({
  open,
  onOpenChange,
  reports,
}: FailedReportsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Failed Reports</DialogTitle>
          <DialogDescription>
            {reports.length === 0
              ? "No failed reports right now."
              : `${reports.length} report${
                  reports.length === 1 ? "" : "s"
                } failed processing. Open a report to review uploads and retry.`}
          </DialogDescription>
        </DialogHeader>

        {reports.length === 0 ? (
          <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
            All reports are processing or ready.
          </div>
        ) : (
          <div className="max-h-[min(60vh,28rem)] divide-y overflow-y-auto rounded-lg border">
            {reports.map((report) => (
              <FailedReportRow
                key={report.group_id}
                report={report}
                onNavigate={() => onOpenChange(false)}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FailedReportRow({
  report,
  onNavigate,
}: {
  report: DashboardReportRow;
  onNavigate: () => void;
}) {
  const label = reportGroupLabel(report.group_name, report.group_number);

  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{label}</p>
          <Badge variant={reportStatusVariant(report.report_status)}>
            {reportStatusLabel(report.report_status)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {report.assignment_title} · {report.class_name}
        </p>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <ClockIcon className="size-3.5" />
          {formatRelativeTime(report.created_at)}
        </span>
      </div>
      <Link
        href={reportDetailHref(report.assignment_id, report.group_id)}
        className="shrink-0"
        onClick={onNavigate}
      >
        <Button size="sm" variant="outline">
          View Report
        </Button>
      </Link>
    </div>
  );
}
