"use client";

import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { GroupContributionTab } from "@/components/groups/group-contribution-tab";
import { GroupMembersTab } from "@/components/groups/group-members-tab";
import { GroupOverviewTab } from "@/components/groups/group-overview-tab";
import { GroupTranscriptsTab } from "@/components/groups/group-transcripts-tab";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { groupPath, groupsListPath } from "@/lib/constants";
import { mergeGroupWithMembers, statusLabel } from "@/lib/groups";
import { useGroup, useGroups } from "@/service/use-groups";
import type { Role } from "@/types";
import type { GroupTab } from "@/types/groups";

const TABS: { value: GroupTab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "members", label: "Members" },
  { value: "contribution", label: "Contribution Report" },
  { value: "transcripts", label: "Transcripts" },
];

interface GroupDetailPageProps {
  groupId: string;
  role: Extract<Role, "student" | "instructor">;
}

export function GroupDetailPage({ groupId, role }: GroupDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as GroupTab) || "overview";
  const listPath = groupsListPath(role);

  const { data: listData, isLoading: listLoading } = useGroups();
  const { data: detailData, isLoading: detailLoading } = useGroup(groupId);

  const listItem = listData?.data.find((g) => g.id === groupId);
  const detail = detailData?.data;
  const group = detail ? mergeGroupWithMembers(detail, listItem) : listItem;
  const isLoading = listLoading || detailLoading;

  const setTab = (next: GroupTab) => {
    router.replace(
      groupPath(groupId, next === "overview" ? undefined : next, role)
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Group not found.</p>
        <Link
          href={listPath}
          className="mt-2 inline-block text-sm text-primary hover:underline"
        >
          Back to My Groups
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href={listPath} className="hover:text-foreground">
          Groups
        </Link>
        <ChevronRightIcon className="size-4" />
        <span className="text-foreground">{group.group_name}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {group.group_name}
            </h1>
            <Badge variant="secondary">
              {statusLabel(group.assignment_status)}
            </Badge>
          </div>
          {group.description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {group.description}
            </p>
          )}
        </div>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as GroupTab)}>
        <TabsList variant="line" className="w-full justify-start">
          {TABS.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <GroupOverviewTab
            group={group}
            onDeleted={() => router.replace(listPath)}
          />
        </TabsContent>
        <TabsContent value="members" className="mt-6">
          <GroupMembersTab group={group} />
        </TabsContent>
        <TabsContent value="contribution" className="mt-6">
          <GroupContributionTab group={group} />
        </TabsContent>
        <TabsContent value="transcripts" className="mt-6">
          <GroupTranscriptsTab group={group} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
