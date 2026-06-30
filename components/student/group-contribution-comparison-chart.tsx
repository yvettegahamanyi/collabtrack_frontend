"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

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
import type { ContributionComparisonRow } from "@/lib/student-dashboard";

const chartConfig = {
  docs: { label: "Docs", color: "#7d98b3" },
  github: { label: "GitHub", color: "#1f3864" },
  meeting: { label: "Meeting", color: "#d8b384" },
} satisfies ChartConfig;

interface GroupContributionComparisonChartProps {
  data: ContributionComparisonRow[];
}

function CurrentUserTick({
  x,
  y,
  payload,
  currentUserLabel,
}: {
  x?: number | string;
  y?: number | string;
  payload?: { value?: string };
  currentUserLabel?: string;
}) {
  if (x === undefined || y === undefined || !payload?.value) return null;
  const xPos = typeof x === "number" ? x : Number(x);
  const yPos = typeof y === "number" ? y : Number(y);
  if (Number.isNaN(xPos) || Number.isNaN(yPos)) return null;
  const isCurrent = payload.value === currentUserLabel;

  return (
    <text
      x={xPos}
      y={yPos + 12}
      textAnchor="middle"
      fill={isCurrent ? "var(--color-primary)" : "var(--color-muted-foreground)"}
      fontSize={12}
      fontWeight={isCurrent ? 600 : 400}
    >
      {payload.value}
    </text>
  );
}

export function GroupContributionComparisonChart({
  data,
}: GroupContributionComparisonChartProps) {
  const currentUserLabel = data.find((row) => row.isCurrentUser)?.member;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Group Contribution Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="member"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={(props) => (
                <CurrentUserTick
                  {...props}
                  currentUserLabel={currentUserLabel}
                />
              )}
            />
            <YAxis tickLine={false} axisLine={false} width={28} domain={[0, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="docs" fill="var(--color-docs)" radius={4}>
              {data.map((row) => (
                <Cell
                  key={`docs-${row.userId}`}
                  fillOpacity={row.isCurrentUser ? 1 : 0.85}
                />
              ))}
            </Bar>
            <Bar dataKey="github" fill="var(--color-github)" radius={4}>
              {data.map((row) => (
                <Cell
                  key={`github-${row.userId}`}
                  fillOpacity={row.isCurrentUser ? 1 : 0.85}
                />
              ))}
            </Bar>
            <Bar dataKey="meeting" fill="var(--color-meeting)" radius={4}>
              {data.map((row) => (
                <Cell
                  key={`meeting-${row.userId}`}
                  fillOpacity={row.isCurrentUser ? 1 : 0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Comparison of GitHub activity, document revisions, and meeting
          participation rates.
        </p>
      </CardContent>
    </Card>
  );
}
