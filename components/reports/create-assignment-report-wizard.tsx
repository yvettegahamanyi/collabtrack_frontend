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
import { useCreateReport, usePreviewMembers } from "@/service/use-reports";
import type { ApiError } from "@/types";
import type { MemberInput } from "@/types/reports";

interface CreateAssignmentReportWizardProps {
  assignmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (groupId: string) => void;
}

interface MemberDraft {
  id: string;
  name: string;
  email: string;
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const fieldLabelClass =
  "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

const fieldInputClass = "h-11 bg-muted/50";

function createMemberDraft(name = "", email = ""): MemberDraft {
  return { id: crypto.randomUUID(), name, email };
}

function createMeetingDraft(): MeetingDraft {
  return { id: crypto.randomUUID(), transcript_file: null, chat_file: null };
}

function validateExtension(file: File, ext: string) {
  return file.name.toLowerCase().endsWith(ext);
}

export function CreateAssignmentReportWizard({
  assignmentId,
  open,
  onOpenChange,
  onCreated,
}: CreateAssignmentReportWizardProps) {
  const previewMembers = usePreviewMembers(assignmentId);
  const createReport = useCreateReport(assignmentId);

  const [step, setStep] = useState(1);
  const [members, setMembers] = useState<MemberDraft[]>([createMemberDraft()]);
  const [githubUrls, setGithubUrls] = useState<string[]>([""]);
  const [docUrls, setDocUrls] = useState<string[]>([""]);
  const [meetings, setMeetings] = useState<MeetingDraft[]>([]);

  const pending = previewMembers.isPending || createReport.isPending;

  const reset = () => {
    setStep(1);
    setMembers([createMemberDraft()]);
    setGithubUrls([""]);
    setDocUrls([""]);
    setMeetings([]);
  };

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

  const updateMember = (
    id: string,
    field: "name" | "email",
    value: string
  ) => {
    setMembers((current) =>
      current.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const removeMember = (id: string) => {
    setMembers((current) =>
      current.length === 1
        ? [createMemberDraft()]
        : current.filter((member) => member.id !== id)
    );
  };

  const importMembersFile = async (file: File) => {
    try {
      const response = await previewMembers.mutateAsync(file);
      const imported = response.data.members;
      setMembers((current) => {
        const existingEmails = new Set(
          current
            .map((member) => member.email.trim().toLowerCase())
            .filter(Boolean)
        );
        const newRows = imported
          .filter(
            (member) => !existingEmails.has(member.email.trim().toLowerCase())
          )
          .map((member) => createMemberDraft(member.name, member.email));
        const kept = current.filter(
          (member) => member.name.trim() || member.email.trim()
        );
        return [...kept, ...newRows];
      });
      toast.success(
        `Imported ${imported.length} member${imported.length === 1 ? "" : "s"}`
      );
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Could not parse the member list file");
    }
  };

  const collectMembers = (): MemberInput[] | null => {
    const filled = members.filter(
      (member) => member.name.trim() || member.email.trim()
    );
    if (filled.length === 0) {
      toast.error("Add at least one group member");
      return null;
    }
    const result: MemberInput[] = [];
    const seen = new Set<string>();
    for (const [index, member] of filled.entries()) {
      const name = member.name.trim();
      const email = member.email.trim().toLowerCase();
      if (!name) {
        toast.error(`Member ${index + 1}: name is required`);
        return null;
      }
      if (!EMAIL_PATTERN.test(email)) {
        toast.error(`Member ${index + 1}: enter a valid email`);
        return null;
      }
      if (seen.has(email)) continue;
      seen.add(email);
      result.push({ name, email });
    }
    return result;
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
      return collectMembers() !== null;
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
    const memberInputs = collectMembers();
    if (!memberInputs || !validateStep(2) || !validateStep(3)) return;

    const github = githubUrls.map((u) => u.trim()).filter(Boolean);
    const docs = docUrls.map((u) => u.trim()).filter(Boolean);

    try {
      const response = await createReport.mutateAsync({
        members: memberInputs,
        github_urls: github,
        google_doc_urls: docs,
        meeting_files: meetings.map((meeting) => ({
          transcript: meeting.transcript_file!,
          chat: meeting.chat_file,
        })),
      });
      toast.success(
        `Report created as ${response.data.group_name} — processing started`
      );
      onCreated(response.data.group_id);
      reset();
      onOpenChange(false);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to create report");
    }
  };

  const memberCount = members.filter(
    (member) => member.name.trim() && member.email.trim()
  ).length;

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
              Create Group Report
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Add the group members, link resources, and optionally add meeting
              transcripts for engagement analysis.
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
            <div className="space-y-5">
              <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <UsersIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p>
                    Add group members manually, or import them from a file with
                    names and emails (.csv with Name/Email columns, or a .txt
                    with one member per line).
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-members-file" className={fieldLabelClass}>
                  Import from file (optional)
                </Label>
                <Input
                  id="report-members-file"
                  type="file"
                  accept=".csv,.txt"
                  className={fieldInputClass}
                  disabled={pending}
                  onChange={async (e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (file) await importMembersFile(file);
                    e.target.value = "";
                  }}
                />
                {previewMembers.isPending && (
                  <p className="text-xs text-muted-foreground">
                    Parsing member list…
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className={fieldLabelClass}>
                    Members{memberCount > 0 ? ` (${memberCount})` : ""}
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setMembers((current) => [...current, createMemberDraft()])
                    }
                    disabled={pending}
                  >
                    <PlusIcon />
                    Add member
                  </Button>
                </div>
                {members.map((member) => (
                  <div key={member.id} className="flex gap-2">
                    <Input
                      placeholder="Full name"
                      className={fieldInputClass}
                      value={member.name}
                      onChange={(e) =>
                        updateMember(member.id, "name", e.target.value)
                      }
                      disabled={pending}
                    />
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      className={fieldInputClass}
                      value={member.email}
                      onChange={(e) =>
                        updateMember(member.id, "email", e.target.value)
                      }
                      disabled={pending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMember(member.id)}
                      disabled={pending}
                    >
                      <TrashIcon className="size-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
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
                Connect GitHub and Google in Settings before generating reports.
                At least one resource link is required.
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
                    transcript.txt and chat.txt. Attendance and duration are
                    detected automatically from who spoke or chatted. Skip this
                    step if you have no meeting data.
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
                    id={`meeting-${meeting.id}-transcript`}
                    label="Transcript (.txt)"
                    accept=".txt"
                    file={meeting.transcript_file}
                    onChange={(file) =>
                      updateMeeting(meeting.id, "transcript_file", file)
                    }
                    disabled={pending}
                  />
                  <MeetingFilePicker
                    id={`meeting-${meeting.id}-chat`}
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
              <ReviewRow
                label="Members"
                value={`${memberCount} member${memberCount === 1 ? "" : "s"}`}
              />
              <ReviewRow
                label="GitHub links"
                value={`${githubUrls.filter((u) => u.trim()).length} linked`}
              />
              <ReviewRow
                label="Google Docs"
                value={`${docUrls.filter((u) => u.trim()).length} linked`}
              />
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
                Submitting will create the next auto-named group, provision
                members, sync GitHub/Docs data
                {meetings.length > 0 ? ", process meetings," : ","} and email
                the supervisor when ready.
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
              {pending ? "Creating…" : "Generate Report"}
              {!pending && <LinkIcon />}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
