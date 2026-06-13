"use client";

import { PlusIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { useCreateGroup } from "@/service/use-groups";
import type { ApiError } from "@/types";
import type { AssignmentStatus, Group } from "@/types/groups";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (group: Group) => void;
}

const fieldLabelClass =
  "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

const fieldInputClass = "h-11 bg-muted/50";

const fieldTextareaClass = cn(
  "flex min-h-[112px] w-full resize-none rounded-md border border-input bg-muted/50 px-3 py-3 text-sm outline-none",
  "placeholder:text-muted-foreground",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
);

export function CreateGroupDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateGroupDialogProps) {
  const createGroup = useCreateGroup();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [assignmentStatus, setAssignmentStatus] =
    useState<AssignmentStatus>("ACTIVE");

  const reset = () => {
    setGroupName("");
    setDescription("");
    setAssignmentStatus("ACTIVE");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    try {
      const response = await createGroup.mutateAsync({
        group_name: groupName.trim(),
        description: description.trim() || undefined,
        assignment_status: assignmentStatus,
      });
      toast.success("Group created successfully");
      onCreated?.(response.data);
      reset();
      onOpenChange(false);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to create group");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="gap-3 border-b bg-muted/20 px-6 py-5 pr-14">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UsersIcon className="size-5" />
          </div>
          <div className="space-y-1.5">
            <DialogTitle className="text-lg font-semibold text-primary">
              Create New Project Group
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Set up a group for your capstone or research project. You can
              invite members after creation.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="group-name" className={fieldLabelClass}>
                Group name
              </Label>
              <Input
                id="group-name"
                placeholder="e.g., Team Alpha - Capstone Project"
                className={fieldInputClass}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                disabled={createGroup.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className={fieldLabelClass}>
                Description (optional)
              </Label>
              <textarea
                id="description"
                placeholder="Briefly describe the objective or assignment details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={createGroup.isPending}
                rows={4}
                className={fieldTextareaClass}
              />
            </div>

            <div className="space-y-2">
              <Label className={fieldLabelClass}>Assignment status</Label>
              <Select
                value={assignmentStatus}
                onValueChange={(value) =>
                  setAssignmentStatus(value as AssignmentStatus)
                }
                disabled={createGroup.isPending}
              >
                <SelectTrigger className={cn("w-full", fieldInputClass)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Active groups appear in your current projects. Done groups move
                to previous groups.
              </p>
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 gap-3 border-t bg-muted/30 px-6 py-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-10 min-w-24"
              onClick={() => onOpenChange(false)}
              disabled={createGroup.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 min-w-36"
              disabled={createGroup.isPending}
            >
              {createGroup.isPending ? "Creating…" : "Create Group"}
              {!createGroup.isPending && <PlusIcon />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
