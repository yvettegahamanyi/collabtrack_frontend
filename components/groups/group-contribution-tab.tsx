"use client";

import { DownloadIcon, InfoIcon, MessageSquareIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { memberInitials } from "@/lib/groups";
import type { Group } from "@/types/groups";

/** Placeholder until contribution report API is available. */
const MOCK_CONTRIBUTIONS = [
  {
    name: "Alex Smith",
    github: 92,
    docs: 85,
    transcript: 90,
    total: 89.4,
  },
  {
    name: "Ben Kingsley",
    github: 45,
    docs: 40,
    transcript: 38,
    total: 41.2,
  },
  {
    name: "Catherine Li",
    github: 88,
    docs: 95,
    transcript: 92,
    total: 91.5,
  },
];

const MOCK_TOPICS = [
  "Architecture Design",
  "API Integration",
  "User Authentication",
  "Database Schema",
  "Frontend UI/UX",
  "Performance Testing",
];

interface GroupContributionTabProps {
  group: Group;
}

export function GroupContributionTab({ group }: GroupContributionTabProps) {
  const members = group.members ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Contribution Breakdown</h2>
          <p className="text-sm text-muted-foreground">
            Analysis for {group.group_name}. Generate a report from your group
            activity data.
          </p>
        </div>
        <Button variant="outline">
          <DownloadIcon />
          Download Report
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contribution Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>GitHub Score</TableHead>
                  <TableHead>Docs Score</TableHead>
                  <TableHead>Transcript</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(members.length > 0
                  ? members.map((m, i) => {
                      const mock =
                        MOCK_CONTRIBUTIONS[i % MOCK_CONTRIBUTIONS.length];
                      return {
                        name: m.name,
                        github: mock?.github ?? 0,
                        docs: mock?.docs ?? 0,
                        transcript: mock?.transcript ?? 0,
                        total: mock?.total ?? 0,
                      };
                    })
                  : MOCK_CONTRIBUTIONS
                ).map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarFallback>
                            {memberInitials(row.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{row.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ScoreCell value={row.github} />
                    </TableCell>
                    <TableCell>
                      <ScoreCell value={row.docs} />
                    </TableCell>
                    <TableCell>
                      <ScoreCell value={row.transcript} />
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {row.total.toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="mt-4 text-xs text-muted-foreground">
              Sample data shown until the contribution report API is connected.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground">
          <CardContent className="space-y-3 pt-6">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary-foreground/15">
              <InfoIcon className="size-4" />
            </span>
            <h3 className="font-semibold">Metric Accuracy</h3>
            <p className="text-sm text-primary-foreground/85">
              AI-driven analysis has high confidence (94%) for this group&apos;s
              collaboration patterns.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareIcon className="size-5" />
            Meeting Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {MOCK_TOPICS.map((topic) => (
              <Badge key={topic} variant="secondary">
                {topic}
              </Badge>
            ))}
            <Badge variant="outline">+ 4 more</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ScoreCell({ value }: { value: number }) {
  const tone =
    value < 50
      ? "[&_[data-slot=progress-indicator]]:bg-destructive"
      : "[&_[data-slot=progress-indicator]]:bg-primary";

  return (
    <div className="min-w-[120px] space-y-1">
      <span
        className={`text-sm font-medium ${value < 50 ? "text-destructive" : ""}`}
      >
        {value}%
      </span>
      <Progress value={value} className={tone} />
    </div>
  );
}
