"use client";

import {
  BarChart3,
  BookOpen,
  ClipboardList,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats } from "@/service/use-admin";

export function AdminOverviewPage() {
  const { data, isLoading, isError } = useAdminStats();
  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Admin overview"
          description="Manage users, courses, and monitor contribution activity across CollabTrack."
        />
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Failed to load statistics. Please try again.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Admin overview"
        description="Manage users, courses, and monitor contribution activity across CollabTrack."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total users"
          value={stats.user_count}
          icon={Users}
          hint={`${stats.active_user_count} active`}
        />
        <StatCard
          label="Reports"
          value={stats.report_count}
          icon={BarChart3}
          hint="Assignment group reports"
        />
        <StatCard
          label="Classes"
          value={stats.class_count}
          icon={BookOpen}
        />
        <StatCard
          label="Assignments"
          value={stats.assignment_count}
          icon={ClipboardList}
        />
      </div>
    </>
  );
}
