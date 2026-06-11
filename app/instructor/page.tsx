"use client";

import {
  ClockIcon,
  ListFilterIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
  UsersIcon,
  ArrowUpDownIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  instructorDashboard as data,
  type Cohort,
  type DetailedMetric,
} from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

export default function InstructorDashboardPage() {
  const { summary, cohorts, detailedMetrics } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-primary">
              <UsersIcon className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Active Groups
              </p>
              <p className="text-3xl font-bold">{summary.activeGroups}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-4">
            <span className="flex size-11 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
              <TriangleAlertIcon className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-wide text-destructive uppercase">
                Flagged Groups
              </p>
              <p className="text-2xl font-bold text-destructive">
                {summary.flaggedGroups} Issues Detected
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-primary">
              <TrendingUpIcon className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Average Engagement
              </p>
              <p className="text-3xl font-bold">{summary.averageEngagement}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Current Cohorts
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ListFilterIcon />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <ArrowUpDownIcon />
              Sort By
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cohorts.map((cohort) => (
            <CohortCard key={cohort.name} cohort={cohort} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detailed Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group name</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailedMetrics.map((metric) => (
                  <MetricRow key={metric.group} metric={metric} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="justify-between bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-primary-foreground">
              Automated Peer Reviews
            </CardTitle>
            <p className="text-sm text-primary-foreground/80">
              Generate comprehensive peer assessment forms for all active groups
              in one click.
            </p>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full">
              Initialize Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CohortCard({ cohort }: { cohort: Cohort }) {
  const critical = cohort.metricTone === "critical";

  return (
    <Card className={cn(critical && "border-destructive/30")}>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold">{cohort.name}</h3>
          <Badge
            variant={
              cohort.status === "Flagged" ? "destructive" : "secondary"
            }
          >
            {cohort.status}
          </Badge>
        </div>

        <div className="flex -space-x-2">
          {Array.from({ length: cohort.memberCount }).map((_, i) => (
            <span
              key={i}
              className="size-7 rounded-full border-2 border-card bg-muted"
            />
          ))}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{cohort.metricLabel}</span>
            <span
              className={cn(
                "font-semibold",
                critical ? "text-destructive" : "text-foreground"
              )}
            >
              {critical ? "Critical" : `${cohort.metricValue}%`}
            </span>
          </div>
          <Progress
            value={cohort.metricValue}
            className={cn(
              critical && "[&_[data-slot=progress-indicator]]:bg-destructive"
            )}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ClockIcon className="size-3.5" />
            {cohort.updatedAgo}
          </span>
          <Button size="sm">View Report</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricRow({ metric }: { metric: DetailedMetric }) {
  const statusVariant =
    metric.status === "Flagged"
      ? "destructive"
      : metric.status === "Idle"
        ? "outline"
        : "secondary";

  const trendClass = {
    up: "text-success",
    flat: "text-muted-foreground",
    down: "text-destructive",
  }[metric.trendDirection];

  return (
    <TableRow>
      <TableCell className="font-medium">{metric.group}</TableCell>
      <TableCell className="text-muted-foreground">
        {metric.members} Members
      </TableCell>
      <TableCell>
        <Badge variant={statusVariant}>{metric.status}</Badge>
      </TableCell>
      <TableCell className={cn("text-right font-semibold", trendClass)}>
        {metric.trend}
      </TableCell>
    </TableRow>
  );
}
