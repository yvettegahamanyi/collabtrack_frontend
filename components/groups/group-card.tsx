"use client";

import Link from "next/link";
import { MoreVerticalIcon } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { groupPath } from "@/lib/constants";
import {
  formatRelativeTime,
  memberInitials,
  statusBadgeVariant,
  statusLabel,
} from "@/lib/groups";
import type { Role } from "@/types";
import type { Group } from "@/types/groups";

interface GroupCardProps {
  group: Group;
  role?: Extract<Role, "student" | "instructor">;
  onMarkDone?: (group: Group) => void;
  onDelete?: (group: Group) => void;
}

export function GroupCard({
  group,
  role = "student",
  onMarkDone,
  onDelete,
}: GroupCardProps) {
  const members = group.members ?? [];
  const visibleMembers = members.slice(0, 3);
  const overflow = members.length - visibleMembers.length;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <Badge variant={statusBadgeVariant(group.assignment_status)}>
            {statusLabel(group.assignment_status)}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Group options">
                  <MoreVerticalIcon />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                {group.assignment_status === "ACTIVE" && onMarkDone && (
                  <DropdownMenuItem onClick={() => onMarkDone(group)}>
                    Mark as done
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(group)}
                  >
                    Delete group
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Link href={groupPath(group.id, undefined, role)} className="block space-y-2">
          <h3 className="text-lg font-semibold text-primary hover:underline">
            {group.group_name}
          </h3>
          {group.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {group.description}
            </p>
          )}
        </Link>

        <div className="flex items-center justify-between">
          <AvatarGroup>
            {visibleMembers.map((member) => (
              <Avatar key={member.user_id} size="sm">
                <AvatarFallback>{memberInitials(member.name)}</AvatarFallback>
              </Avatar>
            ))}
            {overflow > 0 && <AvatarGroupCount>+{overflow}</AvatarGroupCount>}
          </AvatarGroup>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(group.created_at)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
