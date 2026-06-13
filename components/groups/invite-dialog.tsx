"use client";

import { CopyIcon, LinkIcon, UserPlusIcon } from "lucide-react";
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
import { useCreateInvite } from "@/service/use-groups";
import type { ApiError } from "@/types";
import type { InviteLink, InviteRole } from "@/types/groups";

interface InviteDialogProps {
  groupId: string;
  groupName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const fieldLabelClass =
  "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

const fieldInputClass = "h-11 bg-muted/50";

export function InviteDialog({
  groupId,
  groupName,
  open,
  onOpenChange,
}: InviteDialogProps) {
  const createInvite = useCreateInvite(groupId);
  const [role, setRole] = useState<InviteRole>("STUDENT");
  const [expiresInHours, setExpiresInHours] = useState("72");
  const [inviteLink, setInviteLink] = useState<InviteLink | null>(null);

  const reset = () => {
    setRole("STUDENT");
    setExpiresInHours("72");
    setInviteLink(null);
  };

  const handleGenerate = async () => {
    const hours = Number(expiresInHours);
    if (!hours || hours < 1) {
      toast.error("Expiration must be at least 1 hour");
      return;
    }

    try {
      const response = await createInvite.mutateAsync({
        role,
        expires_in_hours: hours,
      });
      setInviteLink(response.data);
      toast.success("Invite link created");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to create invite link");
    }
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink.invite_url);
    toast.success("Invite link copied");
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
            <UserPlusIcon className="size-5" />
          </div>
          <div className="space-y-1.5">
            <DialogTitle className="text-lg font-semibold text-primary">
              Invite to {groupName}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Generate a shareable invite link. Anyone with the link can join as
              the selected role before it expires.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <Label className={fieldLabelClass}>Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as InviteRole)}
              disabled={createInvite.isPending || Boolean(inviteLink)}
            >
              <SelectTrigger className={cn("w-full", fieldInputClass)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires" className={fieldLabelClass}>
              Expires in (hours)
            </Label>
            <Input
              id="expires"
              type="number"
              min={1}
              className={fieldInputClass}
              value={expiresInHours}
              onChange={(e) => setExpiresInHours(e.target.value)}
              disabled={createInvite.isPending || Boolean(inviteLink)}
            />
            <p className="text-xs text-muted-foreground">
              Default is 72 hours. The link stops working after it expires.
            </p>
          </div>

          {inviteLink && (
            <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Share this link
              </p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={inviteLink.invite_url}
                  className="h-10 bg-background text-xs"
                />
                <Button type="button" size="icon" className="shrink-0" onClick={handleCopy}>
                  <CopyIcon />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Expires {new Date(inviteLink.expires_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 gap-3 border-t bg-muted/30 px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-10 min-w-24"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          {!inviteLink && (
            <Button
              type="button"
              className="h-10 min-w-36"
              onClick={handleGenerate}
              disabled={createInvite.isPending}
            >
              {createInvite.isPending ? "Generating…" : "Generate Link"}
              {!createInvite.isPending && <LinkIcon />}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
