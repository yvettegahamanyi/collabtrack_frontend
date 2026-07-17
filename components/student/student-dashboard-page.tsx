"use client";

import Link from "next/link";
import { BarChart3Icon, UsersIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { GroupContributionComparisonChart } from "@/components/student/group-contribution-comparison-chart";
import { GroupSelector } from "@/components/student/group-selector";
import { ParticipationInsightsCard } from "@/components/student/participation-insights-card";
import { PlatformMetricCards } from "@/components/student/platform-metric-cards";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";
import {
  buildContributionComparison,
  getMemberRawCounts,
  mlParticipationScorePercent,
  platformPercentagesFromScoreFeatures,
} from "@/lib/student-dashboard";
import {
  useGroupContributions,
  useGroupParticipationScores,
} from "@/service/use-participation";
import { useGroups } from "@/service/use-groups";
import { useAuthStore } from "@/stores/auth-store";

const GROUP_STORAGE_KEY = "collabtrack-student-dashboard-group";

export function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const { data: groupsData, isLoading: groupsLoading } = useGroups();
  const groups = groupsData?.data ?? [];

  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  useEffect(() => {
    if (groups.length === 0) return;

    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(GROUP_STORAGE_KEY)
        : null;
    const storedValid = stored && groups.some((group) => group.id === stored);

    setSelectedGroupId((current) => {
      if (current && groups.some((group) => group.id === current)) {
        return current;
      }
      if (storedValid) return stored!;
      return groups[0]?.id ?? "";
    });
  }, [groups]);

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(GROUP_STORAGE_KEY, groupId);
    }
  };

  const { data: contributionsData, isLoading: contributionsLoading } =
    useGroupContributions(selectedGroupId);
  const { data: scoresData } = useGroupParticipationScores(selectedGroupId);

  const contributions = contributionsData?.data;
  const members = contributions?.members ?? [];
  const currentUserId = user?.id ?? "";

  const comparisonRows = useMemo(
    () => buildContributionComparison(members, currentUserId),
    [members, currentUserId]
  );

  const currentMember = members.find((member) => member.user_id === currentUserId);
  const currentRow = comparisonRows.find((row) => row.isCurrentUser);
  const ownScore = scoresData?.data.scores.find(
    (score) => score.user_id === currentUserId
  );

  const currentPlatforms = ownScore?.features
    ? platformPercentagesFromScoreFeatures(ownScore.features)
    : currentRow
      ? {
          github: currentRow.github,
          docs: currentRow.docs,
          meeting: currentRow.meeting,
        }
      : { github: 0, docs: 0, meeting: 0 };

  const rawCounts = currentMember
    ? getMemberRawCounts(currentMember)
    : { githubCommits: 0, docEdits: 0 };

  const contributionScore = ownScore
    ? mlParticipationScorePercent(ownScore.predicted_score)
    : null;

  const contributorTier = ownScore?.contributor_tier ?? null;
  const scoreConfidence = ownScore?.llm_rationale?.confidence ?? null;
  const topContributionArea = ownScore?.llm_rationale?.top_area ?? null;

  const isLoading =
    groupsLoading || (selectedGroupId && contributionsLoading);

  if (groupsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 w-full rounded-xl lg:col-span-2" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={UsersIcon}
        title="No groups yet"
        description="Join or create a group to start tracking your contribution across GitHub, docs, and meetings."
        action={
          <Button nativeButton={false} render={<Link href={ROUTES.studentGroups} />}>
            Go to My Groups
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${firstName}!`}
        subContent={
          <GroupSelector
            groups={groups}
            value={selectedGroupId}
            onChange={handleGroupChange}
          />
        }
      />

      {isLoading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full rounded-xl" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-80 w-full rounded-xl lg:col-span-2" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </>
      ) : (
        <>
          <PlatformMetricCards
            contributionScore={contributionScore}
            contributorTier={contributorTier}
            scoreConfidence={scoreConfidence}
            topContributionArea={topContributionArea}
            platforms={currentPlatforms}
            githubCommits={rawCounts.githubCommits}
            docEdits={rawCounts.docEdits}
            scoresGenerated={Boolean(ownScore)}
          />

          <div className="grid gap-6 lg:grid-cols-3">
            {comparisonRows.length > 0 ? (
              <GroupContributionComparisonChart data={comparisonRows} />
            ) : (
              <Card className="lg:col-span-2">
                <CardContent>
                  <EmptyState
                    icon={BarChart3Icon}
                    title="No contribution data yet"
                    description="Member comparison will appear once your group syncs GitHub, docs, or meeting activity."
                    className="py-10"
                  />
                </CardContent>
              </Card>
            )}

            <ParticipationInsightsCard
              contributorTier={contributorTier}
              contributionScore={contributionScore}
              llmRationale={ownScore?.llm_rationale}
              groupId={selectedGroupId}
              scoresGeneratedAt={scoresData?.data.generated_at ?? null}
              hasSyncedData={Boolean(contributions?.last_synced_at)}
            />
          </div>
        </>
      )}
    </div>
  );
}
