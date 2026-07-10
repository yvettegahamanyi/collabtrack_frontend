"use client";

import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { LinkResourcesSection } from "@/components/groups/link-resources-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { canManageGroupResources, statusLabel } from "@/lib/groups";
import { useDeleteGroup, useUpdateGroup } from "@/service/use-groups";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiError } from "@/types";
import type { AssignmentStatus, Group } from "@/types/groups";

interface GroupOverviewTabProps {
  group: Group;
  onDeleted?: () => void;
}

export function GroupOverviewTab({ group, onDeleted }: GroupOverviewTabProps) {
  const currentUser = useAuthStore((s) => s.user);
  const updateGroup = useUpdateGroup(group.id);
  const deleteGroup = useDeleteGroup();
  const isOwner = currentUser?.id === group.owner_id;
  const canManageResources = canManageGroupResources(currentUser, group);

  const [groupName, setGroupName] = useState(group.group_name);
  const [description, setDescription] = useState(group.description ?? "");
  const [assignmentStatus, setAssignmentStatus] = useState<AssignmentStatus>(
    group.assignment_status
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSave = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    try {
      await updateGroup.mutateAsync({
        group_name: groupName.trim(),
        description: description.trim() || undefined,
        assignment_status: assignmentStatus,
      });
      toast.success("Group updated");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to update group");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteGroup.mutateAsync(group.id);
      toast.success("Group deleted");
      setDeleteDialogOpen(false);
      onDeleted?.();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to delete group");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Group Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isOwner ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-name">Group name</Label>
                  <Input
                    id="edit-name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    disabled={updateGroup.isPending}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-description">Description</Label>
                  <textarea
                    id="edit-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={updateGroup.isPending}
                    rows={4}
                    className="flex min-h-[96px] w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Assignment status</Label>
                  <Select
                    value={assignmentStatus}
                    onValueChange={(value) =>
                      setAssignmentStatus(value as AssignmentStatus)
                    }
                    disabled={updateGroup.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={updateGroup.isPending}>
                    {updateGroup.isPending ? "Saving…" : "Save Changes"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={deleteGroup.isPending}
                  >
                    Delete Group
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Status
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {statusLabel(group.assignment_status)}
                  </Badge>
                </div>
                {group.description && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Description
                    </p>
                    <p className="mt-1 text-sm">{group.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Created
                  </p>
                  <p className="mt-1 text-sm">
                    {new Date(group.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>Contribution Weights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <WeightRow label="GitHub" value={group.git_weight} />
            <WeightRow label="Documents" value={group.doc_weight} />
            <WeightRow label="Transcripts" value={group.transcript_weight} />
            <p className="text-xs text-muted-foreground">
              Weights are configured by your instructor and used when generating
              contribution reports.
            </p>
          </CardContent>
        </Card> */}
      </div>

      <LinkResourcesSection groupId={group.id} canManage={canManageResources} />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="gap-0 overflow-hidden p-0 sm:max-w-md"
        >
          <DialogHeader className="gap-3 border-b bg-muted/20 px-6 py-5">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Trash2Icon className="size-5" />
            </div>
            <div className="space-y-1.5">
              <DialogTitle className="text-lg font-semibold">
                Delete group
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                This action is permanent. All members, linked resources, and
                contribution data for this group will be removed.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="px-6 py-5">
            <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Group
                </p>
                <p className="mt-1 font-medium">{group.group_name}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {statusLabel(group.assignment_status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {(group.members ?? []).length} member
                  {(group.members ?? []).length === 1 ? "" : "s"}
                </span>
              </div>
              {group.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {group.description}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 gap-3 border-t bg-muted/30 px-6 py-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-10 min-w-24"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteGroup.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-10 min-w-32"
              onClick={handleDeleteConfirm}
              disabled={deleteGroup.isPending}
            >
              {deleteGroup.isPending ? "Deleting…" : "Delete group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WeightRow({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">
        {value != null ? `${value}%` : "Not set"}
      </span>
    </div>
  );
}
