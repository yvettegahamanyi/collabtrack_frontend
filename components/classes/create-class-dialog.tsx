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
import { useCreateClass } from "@/service/use-classes";
import type { ApiError } from "@/types";

interface CreateClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const fieldLabelClass =
  "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

const fieldInputClass = "h-11 bg-muted/50";

export function CreateClassDialog({
  open,
  onOpenChange,
}: CreateClassDialogProps) {
  const createClass = useCreateClass();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const reset = () => {
    setName("");
    setDescription("");
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Class name is required");
      return;
    }
    try {
      await createClass.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Class created");
      reset();
      onOpenChange(false);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to create class");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !createClass.isPending) reset();
        if (!createClass.isPending) onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Class</DialogTitle>
          <DialogDescription>
            Add a new class to organize assignments and contribution reports.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="class-name" className={fieldLabelClass}>
              Class name
            </Label>
            <Input
              id="class-name"
              placeholder="e.g. CS Capstone 2026"
              className={fieldInputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={createClass.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class-description" className={fieldLabelClass}>
              Description (optional)
            </Label>
            <textarea
              id="class-description"
              placeholder="Brief description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={createClass.isPending}
              rows={3}
              className={cn(
                "flex w-full resize-none rounded-md border border-input bg-muted/50 px-3 py-3 text-sm outline-none",
                "placeholder:text-muted-foreground",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              )}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createClass.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createClass.isPending}>
            {createClass.isPending ? "Creating…" : "Create Class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
