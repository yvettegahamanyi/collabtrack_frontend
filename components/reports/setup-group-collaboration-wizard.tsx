"use client";

import {
  BarChart3Icon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
  UsersIcon,
  VideoIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGroup } from "@/service/use-groups";
import {
  useGroupDocuments,
  useGroupRepos,
} from "@/service/use-participation";
import { useSetupReport } from "@/service/use-reports";
import type { ApiError } from "@/types";
import type { AssignmentReport } from "@/types/reports";
import type { GroupMember } from "@/types/groups";

interface SetupGroupCollaborationWizardProps {
  assignmentId: string;
  report: AssignmentReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (groupId: string) => void;
}

interface MeetingDraft {
  id: string;
  transcript_file: File | null;
  chat_file: File | null;
}

const STEPS = [
  { id: 1, label: "Members" },
  { id: 2, label: "Resources" },
  { id: 3, label: "Meetings" },
  { id: 4, label: "Review" },
] as const;

const fieldLabelClass =
  "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

const fieldInputClass = "h-11 bg-muted/50";

function createMeetingDraft(): MeetingDraft {
  return { id: crypto.randomUUID(), transcript_file: null, chat_file: null };
}

function validateExtension(file: File, ext: string) {
  return file.name.toLowerCase().endsWith(ext);
}

function groupLabel(report: AssignmentReport) {
  return report.group_name ?? `Group ${report.group_number ?? ""}`.trim();
}

export function SetupGroupCollaborationWizard({
  assignmentId,
  report,
  open,
  onOpenChange,
  onComplete,
}: SetupGroupCollaborationWizardProps) {
  const groupId = report?.group_id ?? "";
  const setupReport = useSetupReport(assignmentId, groupId);
  const { data: groupData, isLoading: groupLoading } = useGroup(groupId);
  const { data: reposData } = useGroupRepos(groupId);
  const { data: docsData } = useGroupDocuments(groupId);

  const members = groupData?.data.members ?? [];
  const studentMembers = members.filter(
    (member) => member.role.toUpperCase() !== "INSTRUCTOR"
  );
  const membersForReview =
    studentMembers.length > 0 ? studentMembers : members;

  const [step, setStep] = useState(1);
  const [githubUrls, setGithubUrls] = useState<string[]>([""]);
  const [docUrls, setDocUrls] = useState<string[]>([""]);
  const [meetings, setMeetings] = useState<MeetingDraft[]>([]);

  const pending = setupReport.isPending;

  const reset = () => {
    setStep(1);
    setGithubUrls([""]);
    setDocUrls([""]);
    setMeetings([]);
  };

  useEffect(() => {
    if (!open || !report) return;
    const repos = reposData?.data ?? [];
    const docs = docsData?.data ?? [];
    setGithubUrls(repos.length > 0 ? repos.map((repo) => repo.url) : [""]);
    setDocUrls(docs.length > 0 ? docs.map((doc) => doc.url) : [""]);
    setMeetings([]);
    setStep(1);
  }, [open, report, reposData?.data, docsData?.data]);

  const updateUrlList = (
    urls: string[],
    setUrls: (value: string[]) => void,
    index: number,
    value: string
  ) => {
    setUrls(urls.map((url, i) => (i === index ? value : url)));
  };

  const addUrlField = (urls: string[], setUrls: (value: string[]) => void) => {
    setUrls([...urls, ""]);
  };

  const removeUrlField = (
    urls: string[],
    setUrls: (value: string[]) => void,
    index: number
  ) => {
    setUrls(urls.length === 1 ? [""] : urls.filter((_, i) => i !== index));
  };

  const updateMeeting = (
    id: string,
    field: "transcript_file" | "chat_file",
    value: File | null
  ) => {
    setMeetings((current) =>
      current.map((meeting) =>
        meeting.id === id ? { ...meeting, [field]: value } : meeting
      )
    );
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (groupLoading) {
        return false;
      }
      if (membersForReview.length === 0) {
        toast.error("This group has no members to review");
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      const github = githubUrls.map((u) => u.trim()).filter(Boolean);
      const docs = docUrls.map((u) => u.trim()).filter(Boolean);
      if (github.length === 0 && docs.length === 0) {
        toast.error("Add at least one GitHub or Google Doc URL");
        return false;
      }
      return true;
    }

    if (currentStep === 3) {
      for (const [index, meeting] of meetings.entries()) {
        if (
          !meeting.transcript_file ||
          !validateExtension(meeting.transcript_file, ".txt")
        ) {
          toast.error(`Meeting ${index + 1}: transcript .txt is required`);
          return false;
        }
        if (meeting.chat_file && !validateExtension(meeting.chat_file, ".txt")) {
          toast.error(`Meeting ${index + 1}: chat file must be a .txt`);
          return false;
        }
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, STEPS.length));
  };

  const handleSubmit = async () => {
    if (!report || !validateStep(2) || !validateStep(3)) return;

    const github = githubUrls.map((u) => u.trim()).filter(Boolean);
    const docs = docUrls.map((u) => u.trim()).filter(Boolean);

    try {
      await setupReport.mutateAsync({
        github_urls: github,
        google_doc_urls: docs,
        meeting_files: meetings.map((meeting) => ({
          transcript: meeting.transcript_file!,
          chat: meeting.chat_file,
        })),
      });
      toast.success(
        meetings.length > 0
          ? "Collaboration data saved — processing started"
          : "Collaboration resources linked"
      );
      onComplete?.(report.group_id);
      reset();
      onOpenChange(false);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to save collaboration data");
    }
  };

  if (!report) {
    return null;
  }

  const githubCount = githubUrls.filter((u) => u.trim()).length;
  const docCount = docUrls.filter((u) => u.trim()).length;
  const memberSummary =
    membersForReview.length === 0
      ? "No members"
      : `${membersForReview.length} member${
          membersForReview.length === 1 ? "" : "s"
        }`;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !pending) reset();
        if (!pending) onOpenChange(next);
      }}
    >
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="gap-3 border-b bg-muted/20 px-6 py-5 pr-14">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BarChart3Icon className="size-5" />
          </div>
          <div className="space-y-1.5">
            <DialogTitle className="text-lg font-semibold text-primary">
              Setup {groupLabel(report)}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Confirm the group members, then link collaboration resources and
              optionally add meeting transcripts.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="border-b px-6 py-4">
          <ol className="flex flex-wrap gap-2">
            {STEPS.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  step === item.id
                    ? "bg-primary text-primary-foreground"
                    : step > item.id
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {item.id}. {item.label}
              </li>
            ))}
          </ol>
        </div>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto px-6 py-6">
          {step === 1 && (
            <MembersReviewSection
              groupName={groupLabel(report)}
              members={membersForReview}
              isLoading={groupLoading}
            />
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <UsersIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p>
                    Add at least one GitHub repository or Google Doc for{" "}
                    <span className="font-medium text-foreground">
                      {groupLabel(report)}
                    </span>
                    .
                  </p>
                </div>
              </div>

              <UrlListSection
                label="GitHub repository URLs"
                placeholder="https://github.com/org/project"
                urls={githubUrls}
                onChange={(index, value) =>
                  updateUrlList(githubUrls, setGithubUrls, index, value)
                }
                onAdd={() => addUrlField(githubUrls, setGithubUrls)}
                onRemove={(index) =>
                  removeUrlField(githubUrls, setGithubUrls, index)
                }
                disabled={pending}
              />
              <UrlListSection
                label="Google Doc URLs"
                placeholder="https://docs.google.com/document/d/..."
                urls={docUrls}
                onChange={(index, value) =>
                  updateUrlList(docUrls, setDocUrls, index, value)
                }
                onAdd={() => addUrlField(docUrls, setDocUrls)}
                onRemove={(index) => removeUrlField(docUrls, setDocUrls, index)}
                disabled={pending}
              />
              <p className="text-xs text-muted-foreground">
                Students should connect GitHub and Google in Settings before you
                sync participation data.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <VideoIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p>
                    Optionally add meetings by uploading each meeting&apos;s
                    transcript.txt and chat.txt. Skip this step if you have no
                    meeting data yet.
                  </p>
                </div>
              </div>

              {meetings.map((meeting, index) => (
                <div
                  key={meeting.id}
                  className="space-y-4 rounded-xl border bg-muted/20 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Meeting {index + 1}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setMeetings((current) =>
                          current.filter((item) => item.id !== meeting.id)
                        )
                      }
                      disabled={pending}
                    >
                      <TrashIcon className="size-4 text-destructive" />
                    </Button>
                  </div>
                  <MeetingFilePicker
                    id={`setup-meeting-${meeting.id}-transcript`}
                    label="Transcript (.txt)"
                    accept=".txt"
                    file={meeting.transcript_file}
                    onChange={(file) =>
                      updateMeeting(meeting.id, "transcript_file", file)
                    }
                    disabled={pending}
                  />
                  <MeetingFilePicker
                    id={`setup-meeting-${meeting.id}-chat`}
                    label="Chat (.txt) — optional if there was no chat"
                    accept=".txt"
                    file={meeting.chat_file}
                    onChange={(file) =>
                      updateMeeting(meeting.id, "chat_file", file)
                    }
                    disabled={pending}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setMeetings((current) => [...current, createMeetingDraft()])
                }
                disabled={pending}
              >
                <PlusIcon />
                Add meeting
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-sm">
              <ReviewRow label="Group" value={groupLabel(report)} />
              <ReviewRow label="Members" value={memberSummary} />
              {membersForReview.length > 0 && (
                <div className="rounded-lg border px-4 py-3 text-xs text-muted-foreground">
                  {membersForReview.map((member) => member.name).join(", ")}
                </div>
              )}
              <ReviewRow
                label="GitHub links"
                value={`${githubCount} linked`}
              />
              <ReviewRow label="Google Docs" value={`${docCount} linked`} />
              <ReviewRow
                label="Meetings"
                value={
                  meetings.length === 0
                    ? "None (optional)"
                    : `${meetings.length} meeting${
                        meetings.length === 1 ? "" : "s"
                      }`
                }
              />
              <p className="text-xs text-muted-foreground">
                Submitting will link resources, sync GitHub/Docs data
                {meetings.length > 0 ? ", process meetings," : ","} and update
                the group report status.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 gap-3 border-t bg-muted/30 px-6 py-4 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="h-10 min-w-24"
            onClick={
              step === 1 ? () => onOpenChange(false) : () => setStep(step - 1)
            }
            disabled={pending}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>

          {step < STEPS.length ? (
            <Button
              type="button"
              className="h-10 min-w-28"
              onClick={handleNext}
              disabled={step === 1 && groupLoading}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              className="h-10 min-w-40"
              onClick={handleSubmit}
              disabled={pending}
            >
              {pending ? "Saving…" : "Save & Process"}
              {!pending && <LinkIcon />}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MembersReviewSection({
  groupName,
  members,
  isLoading,
}: {
  groupName: string;
  members: GroupMember[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
        <div className="flex items-start gap-3">
          <UsersIcon className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              Review members for {groupName}
            </p>
            <p className="text-muted-foreground">
              Confirm these are the correct students before linking GitHub,
              Google Docs, or meeting files. Member details cannot be edited
              here.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className={fieldLabelClass}>
          Members{members.length > 0 ? ` (${members.length})` : ""}
        </Label>

        {members.length === 0 ? (
          <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
            No members found for this group.
          </div>
        ) : (
          members.map((member) => (
            <div key={member.user_id} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Full name"
                  className={fieldInputClass}
                  value={member.name}
                  disabled
                  readOnly
                />
                <Input
                  type="email"
                  placeholder="email@example.com"
                  className={fieldInputClass}
                  value={member.email}
                  disabled
                  readOnly
                />
              </div>
              <p className="text-xs text-muted-foreground capitalize">
                Role: {member.role.toLowerCase()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function UrlListSection({
  label,
  placeholder,
  urls,
  onChange,
  onAdd,
  onRemove,
  disabled,
}: {
  label: string;
  placeholder: string;
  urls: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className={fieldLabelClass}>{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={disabled}
        >
          <PlusIcon />
          Add
        </Button>
      </div>
      {urls.map((url, index) => (
        <div key={index} className="flex gap-2">
          <Input
            placeholder={placeholder}
            className={fieldInputClass}
            value={url}
            onChange={(e) => onChange(index, e.target.value)}
            disabled={disabled}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            disabled={disabled || urls.length === 1}
          >
            <TrashIcon className="size-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between rounded-lg border px-4 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function MeetingFilePicker({
  id,
  label,
  accept,
  file,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={fieldLabelClass}>
        {label}
      </Label>
      <Input
        id={id}
        type="file"
        accept={accept}
        className={fieldInputClass}
        disabled={disabled}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {file && (
        <p className="text-xs text-muted-foreground">Selected: {file.name}</p>
      )}
    </div>
  );
}
