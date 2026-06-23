"use client";

import { LinkIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { useSubmitNameMapping } from "@/service/use-meetings";
import type { ApiError } from "@/types";
import type { GroupMember } from "@/types/groups";
import type { MeetingSession, NameMappingItem } from "@/types/meetings";

interface MeetingNameMappingDialogProps {
  groupId: string;
  session: MeetingSession | null;
  members: GroupMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: (session: MeetingSession) => void;
}

interface MappingRow {
  id: string;
  display_name: string;
  user_id: string;
}

const fieldLabelClass =
  "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

const fieldInputClass = "h-11 bg-muted/50";

function createMappingRow(displayName = "", userId = ""): MappingRow {
  return {
    id: crypto.randomUUID(),
    display_name: displayName,
    user_id: userId,
  };
}

export function MeetingNameMappingDialog({
  groupId,
  session,
  members,
  open,
  onOpenChange,
  onSubmitted,
}: MeetingNameMappingDialogProps) {
  const submitMapping = useSubmitNameMapping(groupId);
  const [rows, setRows] = useState<MappingRow[]>([createMappingRow()]);

  const studentMembers = useMemo(() => {
    const students = members.filter(
      (member) => member.role.toUpperCase() === "STUDENT"
    );
    return students.length > 0
      ? students
      : members.filter((member) => member.role.toUpperCase() !== "INSTRUCTOR");
  }, [members]);

  useEffect(() => {
    if (!open || !session) return;

    const fromApi =
      session.unmapped_names?.map((item) =>
        createMappingRow(item.display_name)
      ) ?? [];

    setRows(fromApi.length > 0 ? fromApi : [createMappingRow()]);
  }, [open, session?.id, session?.unmapped_names]);

  const updateRow = (
    id: string,
    field: keyof Omit<MappingRow, "id">,
    value: string
  ) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    setRows((current) => [...current, createMappingRow()]);
  };

  const removeRow = (id: string) => {
    setRows((current) =>
      current.length === 1 ? current : current.filter((row) => row.id !== id)
    );
  };

  const handleSubmit = async () => {
    if (!session) return;

    const validRows = rows.filter(
      (row) => row.display_name.trim() && row.user_id
    );

    if (validRows.length === 0) {
      toast.error("Add at least one name mapping");
      return;
    }

    const displayNames = validRows.map((row) => row.display_name.trim());
    const duplicates = displayNames.filter(
      (name, index) => displayNames.indexOf(name) !== index
    );
    if (duplicates.length > 0) {
      toast.error(`Duplicate display names: ${duplicates.join(", ")}`);
      return;
    }

    const payload: NameMappingItem[] = validRows.map((row) => ({
      display_name: row.display_name.trim(),
      user_id: row.user_id,
    }));

    try {
      const response = await submitMapping.mutateAsync({
        meetingId: session.id,
        payload: { mappings: payload },
      });
      toast.success("Name mappings saved — reprocessing session");
      onSubmitted(response.data);
      onOpenChange(false);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to submit name mappings");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="gap-3 border-b bg-muted/20 px-6 py-5 pr-14">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LinkIcon className="size-5" />
          </div>
          <div className="space-y-1.5">
            <DialogTitle className="text-lg font-semibold text-primary">
              Map Meeting Names
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Match names from the transcript and chat to group members.
              CollabTrack will remember these mappings for future uploads in
              this group.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="max-h-[min(60vh,420px)] space-y-4 overflow-y-auto px-6 py-6">
          {session && (
            <p className="text-sm text-muted-foreground">
              Session:{" "}
              <span className="font-medium text-foreground">
                {session.session_label}
              </span>
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Name mappings</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              disabled={submitMapping.isPending}
            >
              <PlusIcon />
              Add row
            </Button>
          </div>

          <div className="space-y-3">
            {rows.map((row, index) => (
              <div
                key={row.id}
                className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-[1fr_1fr_auto]"
              >
                <div className="space-y-2">
                  <Label className={fieldLabelClass}>
                    Name in transcript {index + 1}
                  </Label>
                  <Input
                    placeholder="e.g. John Doe"
                    className={fieldInputClass}
                    value={row.display_name}
                    onChange={(e) =>
                      updateRow(row.id, "display_name", e.target.value)
                    }
                    disabled={submitMapping.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={fieldLabelClass}>Group member</Label>
                  <Select
                    value={row.user_id || undefined}
                    onValueChange={(value) => {
                      if (value) updateRow(row.id, "user_id", value);
                    }}
                    disabled={submitMapping.isPending}
                  >
                    <SelectTrigger className={cn("w-full", fieldInputClass)}>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {studentMembers.map((member) => (
                        <SelectItem key={member.user_id} value={member.user_id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(row.id)}
                    disabled={submitMapping.isPending || rows.length === 1}
                    aria-label={`Remove mapping row ${index + 1}`}
                  >
                    <TrashIcon className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 gap-3 border-t bg-muted/30 px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitMapping.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitMapping.isPending || !session}
          >
            {submitMapping.isPending ? "Saving…" : "Save mappings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
