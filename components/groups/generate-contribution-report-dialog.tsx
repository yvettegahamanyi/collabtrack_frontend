"use client";

import {
  BarChart3Icon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
  UsersIcon,
  VideoIcon,
} from "lucide-react";
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
import * as groupsService from "@/service/groups.service";
import * as meetingsService from "@/service/meetings.service";
import * as participationService from "@/service/participation.service";
import { useCreateGroup } from "@/service/use-groups";
import type { ApiError } from "@/types";
import type { Group } from "@/types/groups";

interface GenerateContributionReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (group: Group) => void;
}

interface MemberDraft {
  id: string;
  name: string;
  email: string;
}

const STEPS = [
  { id: 1, label: "Group details" },
  { id: 2, label: "Members" },
  { id: 3, label: "Resources" },
  { id: 4, label: "Meeting session" },
] as const;

function validateExtension(file: File, ext: string) {
  return file.name.toLowerCase().endsWith(ext);
}

const fieldLabelClass =
  "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

const fieldInputClass = "h-11 bg-muted/50";

const fieldTextareaClass = cn(
  "flex min-h-[96px] w-full resize-none rounded-md border border-input bg-muted/50 px-3 py-3 text-sm outline-none",
  "placeholder:text-muted-foreground",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
);

function createMemberDraft(): MemberDraft {
  return {
    id: crypto.randomUUID(),
    name: "",
    email: "",
  };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function GenerateContributionReportDialog({
  open,
  onOpenChange,
  onCreated,
}: GenerateContributionReportDialogProps) {
  const createGroup = useCreateGroup();
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<MemberDraft[]>([
    createMemberDraft(),
    createMemberDraft(),
  ]);
  const [githubUrl, setGithubUrl] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [sessionLabel, setSessionLabel] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasMeetingInput =
    Boolean(sessionLabel.trim()) ||
    Boolean(sessionDate) ||
    Boolean(durationMinutes) ||
    Boolean(attendanceFile) ||
    Boolean(transcriptFile) ||
    Boolean(chatFile);

  const reset = () => {
    setStep(1);
    setGroupName("");
    setDescription("");
    setMembers([createMemberDraft(), createMemberDraft()]);
    setGithubUrl("");
    setDocUrl("");
    setSessionLabel("");
    setSessionDate("");
    setDurationMinutes("");
    setAttendanceFile(null);
    setTranscriptFile(null);
    setChatFile(null);
    setIsSubmitting(false);
  };

  const updateMember = (
    id: string,
    field: keyof Omit<MemberDraft, "id">,
    value: string
  ) => {
    setMembers((current) =>
      current.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const addMember = () => {
    setMembers((current) => [...current, createMemberDraft()]);
  };

  const removeMember = (id: string) => {
    setMembers((current) =>
      current.length === 1 ? current : current.filter((member) => member.id !== id)
    );
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!groupName.trim()) {
        toast.error("Group name is required");
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      const validMembers = members.filter(
        (member) => member.name.trim() && member.email.trim()
      );

      if (validMembers.length === 0) {
        toast.error("Add at least one member with a name and email");
        return false;
      }

      const invalidEmail = validMembers.find(
        (member) => !isValidEmail(member.email.trim())
      );
      if (invalidEmail) {
        toast.error(`Enter a valid email for ${invalidEmail.name || "a member"}`);
        return false;
      }

      return true;
    }

    if (currentStep === 3) {
      if (!githubUrl.trim() && !docUrl.trim()) {
        toast.error("Add at least a GitHub repository URL or Google Doc URL");
        return false;
      }
      return true;
    }

    if (currentStep === 4) {
      if (!hasMeetingInput) return true;

      if (!sessionLabel.trim()) {
        toast.error("Session label is required when uploading meeting files");
        return false;
      }
      if (!sessionDate) {
        toast.error("Session date is required when uploading meeting files");
        return false;
      }
      const duration = Number(durationMinutes);
      if (!duration || duration <= 0) {
        toast.error("Meeting duration must be greater than 0 minutes");
        return false;
      }
      if (!attendanceFile || !validateExtension(attendanceFile, ".csv")) {
        toast.error("Attendance file must be a .csv file");
        return false;
      }
      if (!transcriptFile || !validateExtension(transcriptFile, ".txt")) {
        toast.error("Transcript file must be a .txt file");
        return false;
      }
      if (!chatFile || !validateExtension(chatFile, ".txt")) {
        toast.error("Chat file must be a .txt file");
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, STEPS.length));
  };

  const handleBack = () => {
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    const validMembers = members
      .filter((member) => member.name.trim() && member.email.trim())
      .map((member) => ({
        name: member.name.trim(),
        email: member.email.trim().toLowerCase(),
      }));

    setIsSubmitting(true);

    try {
      const groupResponse = await createGroup.mutateAsync({
        group_name: groupName.trim(),
        description: description.trim() || undefined,
        assignment_status: "ACTIVE",
      });
      const group = groupResponse.data;

      let membersAdded = 0;
      for (const member of validMembers) {
        try {
          await groupsService.addGroupMember(group.id, member);
          membersAdded += 1;
        } catch (error) {
          const apiError = error as ApiError;
          toast.error(
            apiError.message ?? `Could not add ${member.name} to the group`
          );
        }
      }

      if (githubUrl.trim()) {
        await participationService.linkGroupRepo(group.id, {
          url: githubUrl.trim(),
        });
      }

      if (docUrl.trim()) {
        await participationService.linkGroupDocument(group.id, {
          url: docUrl.trim(),
        });
      }

      if (githubUrl.trim() || docUrl.trim()) {
        await participationService.syncGroup(group.id);
      }

      if (hasMeetingInput) {
        const sessionResponse = await meetingsService.createMeetingSession(
          group.id,
          {
            session_label: sessionLabel.trim(),
            session_date: sessionDate,
            duration_minutes: Number(durationMinutes),
          }
        );
        await meetingsService.uploadMeetingFiles(
          group.id,
          sessionResponse.data.id,
          {
            attendance_file: attendanceFile!,
            transcript_file: transcriptFile!,
            chat_file: chatFile!,
          }
        );
      }

      toast.success(
        hasMeetingInput
          ? "Report group created — GitHub/Docs synced and meeting session processing started"
          : membersAdded > 0
            ? "Contribution report group created and synced"
            : "Contribution report group created"
      );
      onCreated(group);
      reset();
      onOpenChange(false);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to generate contribution report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pending = isSubmitting || createGroup.isPending;

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
              Generate Contribution Report
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Create a new group, add members, link GitHub and Google Docs, and
              optionally upload meeting files for engagement analysis.
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

        <div className="space-y-5 px-6 py-6">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="report-group-name" className={fieldLabelClass}>
                  Group name
                </Label>
                <Input
                  id="report-group-name"
                  placeholder="e.g., CS Capstone Team B"
                  className={fieldInputClass}
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  disabled={pending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-description" className={fieldLabelClass}>
                  Description (optional)
                </Label>
                <textarea
                  id="report-description"
                  placeholder="Briefly describe the project or assignment..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={pending}
                  rows={4}
                  className={fieldTextareaClass}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Group members</p>
                  <p className="text-xs text-muted-foreground">
                    Add student names and emails for this contribution report.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMember}
                  disabled={pending}
                >
                  <PlusIcon />
                  Add member
                </Button>
              </div>

              <div className="space-y-3">
                {members.map((member, index) => (
                  <div
                    key={member.id}
                    className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-[1fr_1fr_auto]"
                  >
                    <div className="space-y-2">
                      <Label className={fieldLabelClass}>
                        Member {index + 1} name
                      </Label>
                      <Input
                        placeholder="Jane Doe"
                        className={fieldInputClass}
                        value={member.name}
                        onChange={(e) =>
                          updateMember(member.id, "name", e.target.value)
                        }
                        disabled={pending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className={fieldLabelClass}>Email</Label>
                      <Input
                        type="email"
                        placeholder="jane@university.edu"
                        className={fieldInputClass}
                        value={member.email}
                        onChange={(e) =>
                          updateMember(member.id, "email", e.target.value)
                        }
                        disabled={pending}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMember(member.id)}
                        disabled={pending || members.length === 1}
                        aria-label={`Remove member ${index + 1}`}
                      >
                        <TrashIcon className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <UsersIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p>
                    {members.filter((m) => m.name.trim() && m.email.trim()).length}{" "}
                    member
                    {members.filter((m) => m.name.trim() && m.email.trim())
                      .length === 1
                      ? ""
                      : "s"}{" "}
                    will be added to{" "}
                    <span className="font-medium text-foreground">
                      {groupName.trim()}
                    </span>
                    .
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-github-url" className={fieldLabelClass}>
                  GitHub repository URL
                </Label>
                <Input
                  id="report-github-url"
                  placeholder="https://github.com/org/project"
                  className={fieldInputClass}
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-doc-url" className={fieldLabelClass}>
                  Google Doc URL
                </Label>
                <Input
                  id="report-doc-url"
                  placeholder="https://docs.google.com/document/d/..."
                  className={fieldInputClass}
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  disabled={pending}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Connect GitHub and Google in Settings before generating the
                report. At least one resource link is required.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <VideoIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p>
                    Optional: upload one meeting session to include attendance,
                    speaking, and chat engagement in the report. Leave blank to
                    skip — you can add sessions later from the group&apos;s
                    Meeting Sessions tab.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-session-label" className={fieldLabelClass}>
                  Session label
                </Label>
                <Input
                  id="report-session-label"
                  placeholder="e.g. Sprint 1 Review — June 10"
                  className={fieldInputClass}
                  value={sessionLabel}
                  onChange={(e) => setSessionLabel(e.target.value)}
                  disabled={pending}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="report-session-date" className={fieldLabelClass}>
                    Session date
                  </Label>
                  <Input
                    id="report-session-date"
                    type="date"
                    className={fieldInputClass}
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    disabled={pending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-duration" className={fieldLabelClass}>
                    Duration (minutes)
                  </Label>
                  <Input
                    id="report-duration"
                    type="number"
                    min={1}
                    placeholder="60"
                    className={fieldInputClass}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    disabled={pending}
                  />
                </div>
              </div>

              <MeetingFilePicker
                id="report-attendance"
                label="Attendance list (.csv)"
                accept=".csv"
                file={attendanceFile}
                onChange={setAttendanceFile}
                disabled={pending}
              />
              <MeetingFilePicker
                id="report-transcript"
                label="Meeting transcript (.txt)"
                accept=".txt"
                file={transcriptFile}
                onChange={setTranscriptFile}
                disabled={pending}
              />
              <MeetingFilePicker
                id="report-chat"
                label="Chat export (.txt)"
                accept=".txt"
                file={chatFile}
                onChange={setChatFile}
                disabled={pending}
              />
            </div>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 gap-3 border-t bg-muted/30 px-6 py-4 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="h-10 min-w-24"
            onClick={step === 1 ? () => onOpenChange(false) : handleBack}
            disabled={pending}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>

          {step < STEPS.length ? (
            <Button type="button" className="h-10 min-w-28" onClick={handleNext}>
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              className="h-10 min-w-40"
              onClick={handleSubmit}
              disabled={pending}
            >
              {pending ? "Generating…" : "Generate Report"}
              {!pending && <LinkIcon />}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
