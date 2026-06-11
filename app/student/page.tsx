"use client";

import {
  CalendarIcon,
  ChevronDownIcon,
  DownloadIcon,
  FileTextIcon,
  GitBranchIcon,
  MessageSquareIcon,
  SparklesIcon,
  type LucideIcon,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { studentDashboard as data } from "@/lib/dummy-data";
import { useAuthStore } from "@/stores/auth-store";

const chartConfig = {
  github: { label: "GitHub", color: "#1f3864" },
  docs: { label: "Docs", color: "#7d98b3" },
  meeting: { label: "Meeting", color: "#d8b384" },
} satisfies ChartConfig;

export default function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const { stats } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Welcome, {firstName}!
          </h1>
          <button className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronDownIcon className="size-4" />
            Group: {data.group}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <CalendarIcon />
            Last 7 Days
          </Button>
          <Button size="sm">
            <DownloadIcon />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="justify-center">
          <CardContent className="text-center">
            <p className="text-4xl font-bold text-primary">
              {stats.contributionScore.value}%
            </p>
            <p className="mt-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              My Contribution Score
            </p>
            <p className="mt-2 text-sm font-medium text-success">
              {stats.contributionScore.deltaLabel}
            </p>
          </CardContent>
        </Card>

        <MetricCard
          icon={GitBranchIcon}
          label="GitHub Commits"
          value={stats.githubCommits.value}
          badge={stats.githubCommits.delta}
          badgeTone="success"
          progress={(stats.githubCommits.value / stats.githubCommits.target) * 100}
        />
        <MetricCard
          icon={FileTextIcon}
          label="Doc Revisions"
          value={stats.docRevisions.value}
          badge={`Target: ${stats.docRevisions.target}`}
          badgeTone="muted"
          progress={(stats.docRevisions.value / stats.docRevisions.target) * 100}
        />
        <MetricCard
          icon={MessageSquareIcon}
          label="Transcript Appearances"
          value={stats.transcriptAppearances.value}
          badge={stats.transcriptAppearances.status}
          badgeTone="tertiary"
          progress={
            (stats.transcriptAppearances.value /
              stats.transcriptAppearances.target) *
            100
          }
          progressClassName="[&_[data-slot=progress-indicator]]:bg-tertiary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Group Contribution Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={data.contributionComparison}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="member"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="github" fill="var(--color-github)" radius={4} />
                <Bar dataKey="docs" fill="var(--color-docs)" radius={4} />
                <Bar dataKey="meeting" fill="var(--color-meeting)" radius={4} />
              </BarChart>
            </ChartContainer>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Comparison of GitHub activity, document revisions, and meeting
              participation rates.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discussion Topics from Last Meeting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">Core Theme</Badge>
              <span className="text-xs text-muted-foreground">
                {data.discussion.timeAgo}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.discussion.topics.map((topic) => (
                <Badge key={topic} variant="outline">
                  {topic}
                </Badge>
              ))}
            </div>
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-primary">
                <SparklesIcon className="size-4 text-tertiary" />
                AI Insight
              </p>
              <p className="text-sm text-muted-foreground italic">
                &ldquo;{data.discussion.aiInsight}&rdquo;
              </p>
            </div>
            <Button variant="link" className="px-0">
              View Full Transcript
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
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
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <Progress value={Math.min(progress, 100)} className={progressClassName} />
      </CardContent>
    </Card>
  );
}
