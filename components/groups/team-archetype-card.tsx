"use client";

import { UsersIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  teamArchetypeBadgeVariant,
  teamArchetypeDescription,
} from "@/lib/groups";
import type { TeamArchetype } from "@/types/participation";

interface TeamArchetypeCardProps {
  teamArchetype: TeamArchetype;
  memberCount?: number;
}

export function TeamArchetypeCard({
  teamArchetype,
  memberCount,
}: TeamArchetypeCardProps) {
  return (
    <Card className="min-w-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <UsersIcon className="size-4 text-muted-foreground" />
          Team collaboration pattern
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={teamArchetypeBadgeVariant(teamArchetype.archetype)}>
            {teamArchetype.archetype_label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {memberCount !== undefined
              ? ` ${memberCount} members analyzed`
              : ""}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {teamArchetypeDescription(teamArchetype.archetype)}
        </p>
        {/* <p className="text-xs text-muted-foreground">
          Based on group-level mean and variance of participation features across
          all members — a program-level view distinct from individual benchmark
          scores.
        </p> */}
      </CardContent>
    </Card>
  );
}
