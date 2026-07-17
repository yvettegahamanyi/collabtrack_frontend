"use client";

import { DownloadIcon, PuzzleIcon, SaveIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { LinkResourcesSection } from "@/components/groups/link-resources-section";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
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
        <Card className="surface-card lg:col-span-2">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Group Details</CardTitle>
            <CardDescription>
              Update your group name, description, and assignment status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {isOwner ? (
              <>
                <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4 sm:p-5">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-name"
                      className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                    >
                      Group name
                    </Label>
                    <Input
                      id="edit-name"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      disabled={updateGroup.isPending}
                      className="h-11 bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="edit-description"
                      className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                    >
                      Description
                    </Label>
                    <textarea
                      id="edit-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={updateGroup.isPending}
                      rows={4}
                      className="flex min-h-[112px] w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Assignment status
                    </Label>
                    <Select
                      value={assignmentStatus}
                      onValueChange={(value) =>
                        setAssignmentStatus(value as AssignmentStatus)
                      }
                      disabled={updateGroup.isPending}
                    >
                      <SelectTrigger className="h-11 w-full bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    variant="outline"
                    className="border-destructive/25 text-destructive hover:bg-destructive/5 hover:text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={deleteGroup.isPending}
                  >
                    <Trash2Icon />
                    Delete group
                  </Button>
                  <Button
                    className="sm:min-w-36"
                    onClick={handleSave}
                    disabled={updateGroup.isPending}
                  >
                    <SaveIcon />
                    {updateGroup.isPending ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4 sm:p-5">
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

        <Card className="surface-card overflow-hidden bg-gradient-to-b from-secondary/15 via-card to-card">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PuzzleIcon className="size-4" />
              </span>
              Google Meet Extension
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <p className="leading-relaxed text-muted-foreground">
              Install the CollabTrack Chrome extension to capture meeting
              transcripts and chat from Google Meet, then upload the exported
              files when generating contribution reports.
            </p>

            <a
              href="/collabtrack-extension.zip"
              download
              className={cn(buttonVariants({ size: "lg" }), "w-full shadow-sm")}
            >
              <DownloadIcon className="size-4" />
              Download extension
            </a>

            <div className="p-4">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Installation steps
              </p>
              <ol className="mt-3 list-decimal space-y-2 pl-4 text-xs leading-relaxed text-muted-foreground">
                <li>Download and unzip the extension file above</li>
                <li>
                  Open Chrome and go to <code>chrome://extensions</code>
                </li>
                <li>Enable Developer Mode (toggle in the top right)</li>
                <li>
                  Click Load unpacked and select the unzipped folder that
                  contains <code>manifest.json</code>
                </li>
                <li>
                  Join your Google Meet, enable captions (Ctrl+Shift+C), and
                  open chat during the meeting
                </li>
                <li>
                  Click the CollabTrack extension icon after the meeting to
                  export <code>transcript.txt</code> and <code>chat.txt</code>
                </li>
              </ol>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              After exporting, upload both files in the meeting session for this
              group.
            </p>
          </CardContent>
        </Card>
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
