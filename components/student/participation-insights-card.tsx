"use client";

import Link from "next/link";
import { SparklesIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { groupPath } from "@/lib/constants";
import {
  contributorTierBadgeVariant,
  contributorTierLabel,
  participationFeatureLabel,
  sanitizeLlmReasoning,
} from "@/lib/groups";
import type { LLMRationale } from "@/types/participation";

interface ParticipationInsightsCardProps {
  contributorTier: string | null;
  contributionScore: number | null;
  llmRationale: LLMRationale | null | undefined;
  groupId: string;
  scoresGeneratedAt: string | null;
  hasSyncedData: boolean;
}

export function ParticipationInsightsCard({
  contributorTier,
  contributionScore,
  llmRationale,
  groupId,
  scoresGeneratedAt,
  hasSyncedData,
}: ParticipationInsightsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Participation Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Your classification
          </p>
          {contributorTier ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={contributorTierBadgeVariant(contributorTier)}>
                {contributorTierLabel(contributorTier)}
              </Badge>
              {contributionScore !== null && (
                <span className="text-sm text-muted-foreground">
                  {contributionScore}% overall score
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Scores not generated yet for this group.
            </p>
          )}
        </div>

        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
            <SparklesIcon className="size-4 text-tertiary" />
            Score analysis
          </p>

          {!hasSyncedData ? (
            <p className="text-sm text-muted-foreground">
              No participation data synced for this group yet.
            </p>
          ) : llmRationale?.reasoning ? (
            <div className="space-y-2">
              {llmRationale.top_area && (
                <p className="text-sm">
                  <span className="text-muted-foreground">
                    Strongest area:{" "}
                  </span>
                  <span className="font-medium">
                    {participationFeatureLabel(llmRationale.top_area)}
                  </span>
                </p>
              )}
              <p className="text-sm leading-relaxed text-muted-foreground">
                {sanitizeLlmReasoning(llmRationale.reasoning)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Score analysis will appear once participation scores are generated
              for this group.
            </p>
          )}
        </div>

        {scoresGeneratedAt && (
          <p className="text-xs text-muted-foreground">
            Scores generated {new Date(scoresGeneratedAt).toLocaleString()}.
          </p>
        )}

        <Link
          href={groupPath(groupId, "contribution", "student")}
          className="inline-flex px-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          View full report
        </Link>
      </CardContent>
    </Card>
  );
}
