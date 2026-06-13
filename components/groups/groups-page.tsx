"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { GroupCard } from "@/components/groups/group-card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { groupPath } from "@/lib/constants";
import { splitGroups } from "@/lib/groups";
import {
  useDeleteGroup,
  useGroups,
  useUpdateGroup,
} from "@/service/use-groups";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiError, Role } from "@/types";
import type { Group } from "@/types/groups";

interface GroupsPageProps {
  role: Extract<Role, "student" | "instructor">;
  canCreate?: boolean;
}

export function GroupsPage({ role, canCreate = false }: GroupsPageProps) {
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { data, isLoading, isError } = useGroups();
  const deleteGroup = useDeleteGroup();
  const [createOpen, setCreateOpen] = useState(false);

  const groups = data?.data ?? [];
  const { active, previous } = splitGroups(groups);

  const handleDelete = async (group: Group) => {
    if (!confirm(`Delete "${group.group_name}"?`)) return;
    try {
      await deleteGroup.mutateAsync(group.id);
      toast.success("Group deleted");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to delete group");
    }
  };

  const handleCreated = (group: Group) => {
    router.push(groupPath(group.id, "members", role));
  };

  const emptyMessage =
    role === "instructor"
      ? "No groups yet. Accept an invitation link to join a project group."
      : "No active groups yet. Create one to get started.";

  return (
    <div className="space-y-6">
      <PageHeader
        title={role === "instructor" ? "My Groups" : "My Group"}
        description={
          role === "instructor"
            ? "View project groups you have joined as an instructor."
            : "Manage current research teams and review past academic collaborations."
        }
        action={
          canCreate ? (
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              Create New Group
            </Button>
          ) : undefined
        }
      />

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Failed to load groups. Please try again.
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && (
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Active Groups
            </h2>
            {active.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">{emptyMessage}</p>
                  {canCreate && (
                    <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                      <PlusIcon />
                      Create New Group
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {active.map((group) => (
                  <GroupCardWithActions
                    key={group.id}
                    group={group}
                    role={role}
                    isOwner={group.owner_id === currentUserId}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Previous Groups
            </h2>
            <Card>
              <CardContent className="space-y-3 pt-6">
                {previous.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Completed groups will appear here.
                  </p>
                ) : (
                  previous.map((group) => (
                    <Link
                      key={group.id}
                      href={groupPath(group.id, undefined, role)}
                      className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <p className="font-medium text-primary">
                        {group.group_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(group.created_at).toLocaleDateString(undefined, {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      {group.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {group.description}
                        </p>
                      )}
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-base">Collaboration Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-primary-foreground/90">
                  You belong to {groups.length} group
                  {groups.length === 1 ? "" : "s"} with{" "}
                  {groups.reduce(
                    (sum, g) => sum + (g.members?.length ?? 0),
                    0
                  )}{" "}
                  total collaborations tracked.
                </p>
                <Button
                  variant="link"
                  className="h-auto p-0 text-primary-foreground underline"
                  disabled
                >
                  View detailed analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {canCreate && (
        <CreateGroupDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

function GroupCardWithActions({
  group,
  role,
  isOwner,
  onDelete,
}: {
  group: Group;
  role: Extract<Role, "student" | "instructor">;
  isOwner: boolean;
  onDelete: (group: Group) => void;
}) {
  const updateGroup = useUpdateGroup(group.id);

  const handleMarkDone = async () => {
    try {
      await updateGroup.mutateAsync({
        group_name: group.group_name,
        description: group.description ?? undefined,
        assignment_status: "DONE",
      });
      toast.success("Group marked as done");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to update group");
    }
  };

  return (
    <GroupCard
      group={group}
      role={role}
      onMarkDone={isOwner ? handleMarkDone : undefined}
      onDelete={isOwner ? onDelete : undefined}
    />
  );
}
