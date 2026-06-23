"use client";

import { BarChart3Icon, ChevronLeftIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { GenerateContributionReportDialog } from "@/components/groups/generate-contribution-report-dialog";
import { GroupContributionTab } from "@/components/groups/group-contribution-tab";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { statusBadgeVariant, statusLabel } from "@/lib/groups";
import { useGroups } from "@/service/use-groups";
import type { Group } from "@/types/groups";

export function ContributionReportPage() {
  const { data, isLoading, isError } = useGroups();
  const groups = data?.data ?? [];
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);

  const handleGroupCreated = (group: Group) => {
    setSelectedGroup(group);
  };

  if (selectedGroup) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedGroup(null)}
          >
            <ChevronLeftIcon />
            Back to groups
          </Button>
        </div>

        <PageHeader
          title={selectedGroup.group_name}
          description="Contribution report for this group."
        />

        <GroupContributionTab group={selectedGroup} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contribution Report"
        description="View contribution reports for groups you joined, or generate a report for a new group."
        action={
          <Button onClick={() => setGenerateOpen(true)}>
            <PlusIcon />
            Generate Report for New Group
          </Button>
        }
      />

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Failed to load groups. Please try again.
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && groups.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BarChart3Icon className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">No groups yet</p>
              <p className="max-w-md text-sm text-muted-foreground">
                Accept a group invitation to view an existing report, or generate
                one for a new group by adding members and linking GitHub and
                Google Docs.
              </p>
            </div>
            <Button onClick={() => setGenerateOpen(true)}>
              <PlusIcon />
              Generate Report for New Group
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && groups.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Groups you belong to
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <Card
                key={group.id}
                className="transition-shadow hover:shadow-md"
              >
                <CardContent className="flex h-full flex-col gap-4 pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">{group.group_name}</h3>
                      {group.description && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {group.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={statusBadgeVariant(group.assignment_status)}>
                      {statusLabel(group.assignment_status)}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {(group.members ?? []).length} member
                    {(group.members ?? []).length === 1 ? "" : "s"}
                  </p>

                  <Button
                    className="mt-auto w-full"
                    onClick={() => setSelectedGroup(group)}
                  >
                    <BarChart3Icon />
                    View Contribution Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <GenerateContributionReportDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        onCreated={handleGroupCreated}
      />
    </div>
  );
}
