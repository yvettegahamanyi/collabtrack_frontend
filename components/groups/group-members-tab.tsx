"use client";

import { UserMinusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { InviteDialog } from "@/components/groups/invite-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { memberInitials } from "@/lib/groups";
import { useRemoveMember } from "@/service/use-groups";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiError } from "@/types";
import type { Group } from "@/types/groups";

interface GroupMembersTabProps {
  group: Group;
}

export function GroupMembersTab({ group }: GroupMembersTabProps) {
  const currentUser = useAuthStore((s) => s.user);
  const removeMember = useRemoveMember(group.id);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{
    userId: string;
    name: string;
  } | null>(null);
  const isOwner = currentUser?.id === group.owner_id;
  const members = group.members ?? [];

  const handleRemoveConfirm = async () => {
    if (!removeTarget) return;

    try {
      await removeMember.mutateAsync(removeTarget.userId);
      toast.success(`${removeTarget.name} removed from the group`);
      setRemoveTarget(null);
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
                          setRemoveTarget({
                            userId: member.user_id,
                            name: member.name,
                          })
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

      <Dialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
      >
        <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="gap-3 border-b bg-muted/20 px-6 py-5">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <UserMinusIcon className="size-5" />
            </div>
            <div className="space-y-1.5">
              <DialogTitle className="text-lg font-semibold">
                Remove member
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                This action cannot be undone. The member will lose access to
                group resources and contribution data.
              </DialogDescription>
            </div>
          </DialogHeader>

          {removeTarget && (
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-4">
                <Avatar size="lg">
                  <AvatarFallback>
                    {memberInitials(removeTarget.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{removeTarget.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Will be removed from {group.group_name}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mx-0 mb-0 gap-3 border-t bg-muted/30 px-6 py-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-10 min-w-24"
              onClick={() => setRemoveTarget(null)}
              disabled={removeMember.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-10 min-w-32"
              onClick={handleRemoveConfirm}
              disabled={removeMember.isPending}
            >
              {removeMember.isPending ? "Removing…" : "Remove member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
