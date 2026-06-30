"use client";

import { Cell, Label, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { TeamClassificationCount } from "@/types/instructor-dashboard";

const chartConfig = {
  balanced_team: {
    label: "Balanced team",
    color: "var(--chart-2)",
  },
  high_performing_cohesive: {
    label: "High-performing cohesive team",
    color: "var(--chart-1)",
  },
  one_dominant_contributor: {
    label: "One dominant contributor",
    color: "var(--chart-3)",
  },
  uniformly_disengaged: {
    label: "Uniformly disengaged team",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

interface TeamClassificationChartProps {
  data: TeamClassificationCount[];
  classifiedGroupCount: number;
  unclassifiedGroupCount: number;
}

export function TeamClassificationChart({
  data,
  classifiedGroupCount,
  unclassifiedGroupCount,
}: TeamClassificationChartProps) {
  const chartData = data.map((item) => ({
    archetype: item.archetype,
    label: item.label,
    count: item.count,
    fill: `var(--color-${item.archetype})`,
  }));

  const totalClassified = chartData.reduce((sum, item) => sum + item.count, 0);

  if (totalClassified === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center">
        <p className="text-sm font-medium">No team classifications yet</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Classifications appear after participation scores are generated for
          group reports.
          {unclassifiedGroupCount > 0
            ? ` ${unclassifiedGroupCount} group${unclassifiedGroupCount === 1 ? "" : "s"} awaiting scores.`
            : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[320px] w-full"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, _name, item) => (
                  <span className="font-medium">
                    {item?.payload?.label}: {value} group
                    {Number(value) === 1 ? "" : "s"}
                  </span>
                )}
              />
            }
          />
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="label"
            innerRadius={72}
            outerRadius={110}
            strokeWidth={2}
          >
            {chartData.map((entry) => (
              <Cell key={entry.archetype} fill={entry.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                  return null;
                }

                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {totalClassified}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 22}
                      className="fill-muted-foreground text-xs"
                    >
                      classified
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="archetype" />} />
        </PieChart>
      </ChartContainer>

      {unclassifiedGroupCount > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {unclassifiedGroupCount} group
          {unclassifiedGroupCount === 1 ? "" : "s"} not yet classified
          {classifiedGroupCount > 0 ? " (scores not generated)" : ""}.
        </p>
      )}
    </div>
  );
}
