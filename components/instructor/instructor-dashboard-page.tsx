"use client";

import {
  BookOpenIcon,
  CheckCircle2Icon,
  ClockIcon,
  FileTextIcon,
  PlusIcon,
  TriangleAlertIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CreateClassDialog } from "@/components/classes/create-class-dialog";
import { FailedReportsDialog } from "@/components/instructor/failed-reports-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/groups";
import {
  reportDetailHref,
  reportGroupLabel,
  reportStatusLabel,
  reportStatusVariant,
} from "@/lib/reports";
import { cn } from "@/lib/utils";
import { useInstructorDashboard } from "@/service/use-instructor-dashboard";
import type { DashboardReportRow } from "@/types/instructor-dashboard";

export function InstructorDashboardPage() {
  const { data, isLoading, isError } = useInstructorDashboard();
  const [createClassOpen, setCreateClassOpen] = useState(false);
  const [failedReportsOpen, setFailedReportsOpen] = useState(false);

  const dashboard = data?.data;
  const summary = dashboard?.summary;
  const recentReports = dashboard?.recent_reports ?? [];
  const failedReports = dashboard?.failed_reports ?? [];
  const assignmentsWithoutReports =
    dashboard?.assignments_without_reports ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !dashboard || !summary) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Failed to load dashboard. Please try again.
        </CardContent>
      </Card>
    );
  }

  const hasNoClasses = summary.class_count === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your classes, assignments, and contribution reports."
        action={
          <Button onClick={() => setCreateClassOpen(true)}>
            <PlusIcon />
            New Class
          </Button>
        }
      />

      {hasNoClasses ? (
        <EmptyState
          icon={BookOpenIcon}
          title="No classes yet"
          description="Create a class, add assignments, and generate contribution reports to see insights here."
          action={
            <Button onClick={() => setCreateClassOpen(true)}>
              <PlusIcon />
              Create Class
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon={BookOpenIcon}
              label="Classes"
              value={String(summary.class_count)}
            />
            <SummaryCard
              icon={FileTextIcon}
              label="Active Assignments"
              value={String(summary.active_assignment_count)}
            />
            <SummaryCard
              icon={CheckCircle2Icon}
              label="Reports Ready"
              value={String(summary.reports_ready_count)}
            />
            <SummaryCard
              icon={TriangleAlertIcon}
              label="Failed Reports"
              value={
                summary.failed_report_count > 0
                  ? `${summary.failed_report_count} issue${
                      summary.failed_report_count === 1 ? "" : "s"
                    }`
                  : "0"
              }
              variant="attention"
              onClick={
                summary.failed_report_count > 0
                  ? () => setFailedReportsOpen(true)
                  : undefined
              }
            />
          </div>

          <Card className="surface-card">
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-3">
              <div>
                <CardTitle className="text-lg">Recent Reports</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Latest contribution reports across all assignments.
                </p>
              </div>
              {/* <Link href="/instructor/classes">
                <Button variant="outline" size="sm">
                  View classes
                </Button>
              </Link> */}
            </CardHeader>
            <CardContent>
              {recentReports.length === 0 ? (
                <EmptyState
                  icon={FileTextIcon}
                  title="No reports yet"
                  description="Open an assignment and upload attendance to create your first group report."
                  className="py-10"
                />
              ) : (
                <div className="divide-y rounded-lg border">
                  {recentReports.map((report) => (
                    <RecentReportRow key={report.group_id} report={report} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="surface-card flex flex-col justify-between bg-primary text-primary-foreground shadow-md">
            <CardHeader>
              <CardTitle className="text-primary-foreground">
                Quick Actions
              </CardTitle>
              <p className="text-sm text-primary-foreground/80">
                Jump to common tasks for managing classes and contribution
                reports.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/instructor/classes" className="block">
                <Button variant="secondary" className="w-full">
                  Manage classes
                </Button>
              </Link>

              {assignmentsWithoutReports.length > 0 && (
                <div className="space-y-2 border-t border-primary-foreground/20 pt-4">
                  <p className="text-xs font-semibold tracking-wide text-primary-foreground/80 uppercase">
                    Assignments without reports
                  </p>
                  <ul className="space-y-2">
                    {assignmentsWithoutReports
                      .slice(0, 4)
                      .map((assignment) => (
                        <li key={assignment.id}>
                          <Link
                            href={`/instructor/assignments/${assignment.id}`}
                            className="block rounded-md bg-primary-foreground/10 px-3 py-2 text-sm transition-colors hover:bg-primary-foreground/15"
                          >
                            <span className="font-medium">
                              {assignment.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-primary-foreground/70">
                              {assignment.class_name}
                            </span>
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <CreateClassDialog
        open={createClassOpen}
        onOpenChange={setCreateClassOpen}
      />

      <FailedReportsDialog
        open={failedReportsOpen}
        onOpenChange={setFailedReportsOpen}
        reports={failedReports}
      />
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  variant = "default",
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  variant?: "default" | "attention";
  onClick?: () => void;
}) {
  const isAttention = variant === "attention";
  const isClickable = Boolean(onClick);

  const content = (
    <CardContent className="flex items-center gap-4 pt-6">
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-lg",
          isAttention
            ? "bg-destructive/15 text-destructive"
            : "bg-secondary text-primary"
        )}
      >
        <Icon className="size-5" />
      </span>
      <div>
        <p
          className={cn(
            "text-xs font-semibold tracking-wide uppercase",
            isAttention ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "text-2xl font-bold",
            isAttention && "text-destructive"
          )}
        >
          {value}
        </p>
        {isClickable && (
          <p className="mt-1 text-xs text-destructive/80">Click to view all</p>
        )}
      </div>
    </CardContent>
  );

  return (
    <Card
      className={cn(
        "surface-card overflow-hidden",
        !isAttention &&
          "bg-gradient-to-br from-primary/5 via-card to-secondary/10",
        isAttention &&
          "border-destructive/30 bg-gradient-to-br from-destructive/10 via-card to-card",
        isClickable &&
          "surface-card-interactive cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {content}
    </Card>
  );
}

function RecentReportRow({ report }: { report: DashboardReportRow }) {
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
      >
        <Button size="sm">View Report</Button>
      </Link>
    </div>
  );
}
