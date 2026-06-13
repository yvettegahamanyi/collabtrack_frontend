"use client";

import { useState } from "react";
import { toast } from "sonner";

import { InviteDialog } from "@/components/groups/invite-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { memberInitials } from "@/lib/groups";
import { useAuthStore } from "@/stores/auth-store";
import { useRemoveMember } from "@/service/use-groups";
import type { ApiError } from "@/types";
import type { Group } from "@/types/groups";

interface GroupMembersTabProps {
  group: Group;
}

export function GroupMembersTab({ group }: GroupMembersTabProps) {
  const currentUser = useAuthStore((s) => s.user);
  const removeMember = useRemoveMember(group.id);
  const [inviteOpen, setInviteOpen] = useState(false);
  const isOwner = currentUser?.id === group.owner_id;
  const members = group.members ?? [];

  const handleRemove = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from this group?`)) return;

    try {
      await removeMember.mutateAsync(userId);
      toast.success(`${name} removed from the group`);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to remove member");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Team Members</h2>
          <p className="text-sm text-muted-foreground">
            {members.length} member{members.length === 1 ? "" : "s"} in this
            group.
          </p>
        </div>
        {isOwner && (
          <Button onClick={() => setInviteOpen(true)}>Invite Members</Button>
        )}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              {isOwner && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.user_id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback>
                        {memberInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{member.role}</Badge>
                    {member.is_owner && (
                      <Badge variant="secondary">Owner</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(member.joined_at).toLocaleDateString()}
                </TableCell>
                {isOwner && (
                  <TableCell className="text-right">
                    {!member.is_owner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        disabled={removeMember.isPending}
                        onClick={() =>
                          handleRemove(member.user_id, member.name)
                        }
                      >
                        Remove
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <InviteDialog
        groupId={group.id}
        groupName={group.group_name}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </div>
  );
}
