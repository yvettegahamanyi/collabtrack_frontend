"use client";

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
import { cn } from "@/lib/utils";
import { useCreateAssignment } from "@/service/use-assignments";
import type { ApiError } from "@/types";

interface CreateAssignmentDialogProps {
  classId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const fieldLabelClass =
  "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

const fieldInputClass = "h-11 bg-muted/50";

export function CreateAssignmentDialog({
  classId,
  open,
  onOpenChange,
}: CreateAssignmentDialogProps) {
  const createAssignment = useCreateAssignment(classId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");

  const reset = () => {
    setTitle("");
    setDescription("");
    setSupervisorEmail("");
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Assignment title is required");
      return;
    }
    try {
      await createAssignment.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        supervisor_email: supervisorEmail.trim() || undefined,
      });
      toast.success("Assignment created");
      reset();
      onOpenChange(false);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to create assignment");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !createAssignment.isPending) reset();
        if (!createAssignment.isPending) onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Assignment</DialogTitle>
          <DialogDescription>
            Add an assignment where you will upload attendance and generate
            contribution reports.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assignment-title" className={fieldLabelClass}>
              Title
            </Label>
            <Input
              id="assignment-title"
              placeholder="e.g. Sprint 1 Team Reports"
              className={fieldInputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={createAssignment.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignment-description" className={fieldLabelClass}>
              Description (optional)
            </Label>
            <textarea
              id="assignment-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={createAssignment.isPending}
              rows={3}
              className={cn(
                "flex w-full resize-none rounded-md border border-input bg-muted/50 px-3 py-3 text-sm outline-none",
                "placeholder:text-muted-foreground",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supervisor-email" className={fieldLabelClass}>
              Supervisor email (optional)
            </Label>
            <Input
              id="supervisor-email"
              type="email"
              placeholder="Defaults to your account email"
              className={fieldInputClass}
              value={supervisorEmail}
              onChange={(e) => setSupervisorEmail(e.target.value)}
              disabled={createAssignment.isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createAssignment.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createAssignment.isPending}>
            {createAssignment.isPending ? "Creating…" : "Create Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
