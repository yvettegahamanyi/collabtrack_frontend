"use client";

import {
  FileTextIcon,
  GitBranchIcon,
  MessageSquareIcon,
  type LucideIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { contributorTierLabel } from "@/lib/groups";
import {
  meetingActivityLabel,
  type PlatformPercentages,
} from "@/lib/student-dashboard";

interface PlatformMetricCardsProps {
  contributionScore: number | null;
  contributorTier: string | null;
  platforms: PlatformPercentages;
  githubCommits: number;
  docEdits: number;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  badge,
  badgeTone,
  progress,
  progressClassName,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  badge: string;
  badgeTone: "success" | "muted" | "tertiary";
  progress: number;
  progressClassName?: string;
}) {
  const badgeClass = {
    success: "text-success",
    muted: "text-muted-foreground",
    tertiary: "text-tertiary",
  }[badgeTone];

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between">
          <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
            <Icon className="size-4" />
          </span>
          <span className={`text-xs font-semibold ${badgeClass}`}>{badge}</span>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="text-3xl font-bold">{value}%</p>
        </div>
        <Progress
          value={Math.min(progress, 100)}
          className={progressClassName}
        />
      </CardContent>
    </Card>
  );
}

export function PlatformMetricCards({
  contributionScore,
  contributorTier,
  platforms,
  githubCommits,
  docEdits,
}: PlatformMetricCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="justify-center">
        <CardContent className="text-center">
          <p className="text-4xl font-bold text-primary">
            {contributionScore !== null ? `${contributionScore}%` : "—"}
          </p>
          <p className="mt-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            My Contribution Score
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Benchmark score for this group
          </p>
          {contributorTier && (
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {contributorTierLabel(contributorTier)}
            </p>
          )}
        </CardContent>
      </Card>

      <MetricCard
        icon={GitBranchIcon}
        label="GitHub Share"
        value={platforms.github}
        badge={`${githubCommits} commits`}
        badgeTone="success"
        progress={platforms.github}
      />
      <MetricCard
        icon={FileTextIcon}
        label="Docs Share"
        value={platforms.docs}
        badge={`${docEdits} edits`}
        badgeTone="muted"
        progress={platforms.docs}
      />
      <MetricCard
        icon={MessageSquareIcon}
        label="Meeting Participation"
        value={platforms.meeting}
        badge={meetingActivityLabel(platforms.meeting)}
        badgeTone="tertiary"
        progress={platforms.meeting}
        progressClassName="[&_[data-slot=progress-indicator]]:bg-tertiary"
      />
    </div>
  );
}
