"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { MoreVerticalIcon, UserMinusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table";
import { DataTableStatusBadge } from "@/components/data-table-status-badge";
import { InviteDialog } from "@/components/groups/invite-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { memberInitials } from "@/lib/groups";
import { useRemoveMember } from "@/service/use-groups";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiError } from "@/types";
import type { Group, GroupMember } from "@/types/groups";

interface GroupMembersTabProps {
  group: Group;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

  const columns = useMemo<ColumnDef<GroupMember>[]>(() => {
    const baseColumns: ColumnDef<GroupMember>[] = [
      {
        id: "member",
        accessorFn: (row) => row.name,
        header: "Member",
        meta: {
          isPrimary: true,
          exportLabel: "Member",
          exportValue: (row) => row.name,
        },
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarFallback>
                {memberInitials(row.original.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">
                {row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        meta: { exportLabel: "Role" },
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <DataTableStatusBadge label={row.original.role} tone="neutral" />
            {row.original.is_owner && (
              <DataTableStatusBadge label="Owner" tone="info" />
            )}
          </div>
        ),
      },
      {
        id: "joined_at",
        accessorFn: (row) => formatDate(row.joined_at),
        header: "Joined",
        meta: {
          exportLabel: "Joined",
          exportValue: (row) => formatDate(row.joined_at),
        },
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.joined_at)}
          </span>
        ),
      },
    ];

    if (isOwner) {
      baseColumns.push({
        id: "actions",
        header: "Actions",
        meta: { align: "right", hideOnExport: true },
        cell: ({ row }) => (
          <div className="flex justify-end">
            {!row.original.is_owner ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Actions for ${row.original.name}`}
                      disabled={removeMember.isPending}
                    >
                      <MoreVerticalIcon className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() =>
                        setRemoveTarget({
                          userId: row.original.user_id,
                          name: row.original.name,
                        })
                      }
                    >
                      <UserMinusIcon />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        ),
      });
    }

    return baseColumns;
  }, [isOwner, removeMember.isPending]);

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

      <DataTable
        columns={columns}
        data={members}
        emptyMessage="No members in this group yet."
        exportable={isOwner}
        exportFilename={`${group.group_name?.replace(/\s+/g, "-").toLowerCase() ?? "group"}-members.csv`}
        searchColumns={[
          { id: "member", label: "Member" },
          { id: "role", label: "Role" },
        ]}
      />

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
