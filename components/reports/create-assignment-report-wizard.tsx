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
import { useCreateReport, usePreviewAttendance } from "@/service/use-reports";
import type { ApiError } from "@/types";
import type { AttendanceMemberPreview, MeetingInputMeta } from "@/types/reports";

interface CreateAssignmentReportWizardProps {
  assignmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (groupId: string) => void;
}

interface MeetingDraft {
  id: string;
  session_label: string;
  session_date: string;
  duration_minutes: string;
  attendance_file: File | null;
  transcript_file: File | null;
  chat_file: File | null;
}

const STEPS = [
  { id: 1, label: "Attendance" },
  { id: 2, label: "Resources" },
  { id: 3, label: "Meetings" },
  { id: 4, label: "Review" },
] as const;

const fieldLabelClass =
  "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

const fieldInputClass = "h-11 bg-muted/50";

function createMeetingDraft(): MeetingDraft {
  return {
    id: crypto.randomUUID(),
    session_label: "",
    session_date: "",
    duration_minutes: "",
    attendance_file: null,
    transcript_file: null,
    chat_file: null,
  };
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
  const previewAttendance = usePreviewAttendance(assignmentId);
  const createReport = useCreateReport(assignmentId);

  const [step, setStep] = useState(1);
  const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
  const [members, setMembers] = useState<AttendanceMemberPreview[]>([]);
  const [githubUrls, setGithubUrls] = useState<string[]>([""]);
  const [docUrls, setDocUrls] = useState<string[]>([""]);
  const [meetings, setMeetings] = useState<MeetingDraft[]>([createMeetingDraft()]);
  const [nextGroupLabel, setNextGroupLabel] = useState("Group N");

  const pending = previewAttendance.isPending || createReport.isPending;

  const reset = () => {
    setStep(1);
    setAttendanceFile(null);
    setMembers([]);
    setGithubUrls([""]);
    setDocUrls([""]);
    setMeetings([createMeetingDraft()]);
    setNextGroupLabel("Group N");
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

  const updateMeeting = (
    id: string,
    field: keyof Omit<MeetingDraft, "id">,
    value: string | File | null
  ) => {
    setMeetings((current) =>
      current.map((meeting) =>
        meeting.id === id ? { ...meeting, [field]: value } : meeting
      )
    );
  };

  const parseAttendance = async (file: File) => {
    try {
      const response = await previewAttendance.mutateAsync(file);
      setMembers(response.data.members);
      setNextGroupLabel(`Group ${response.data.members.length > 0 ? "N" : "?"}`);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Could not parse attendance file");
      setMembers([]);
    }
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!attendanceFile) {
        toast.error("Attendance file is required");
        return false;
      }
      if (members.length === 0) {
        toast.error("Upload a valid attendance CSV with Name, Email, Duration_Minutes, Facilitator");
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
      if (meetings.length === 0) {
        toast.error("At least one meeting is required");
        return false;
      }
      for (const [index, meeting] of meetings.entries()) {
        if (!meeting.session_label.trim()) {
          toast.error(`Meeting ${index + 1}: session label is required`);
          return false;
        }
        if (!meeting.session_date) {
          toast.error(`Meeting ${index + 1}: session date is required`);
          return false;
        }
        const duration = Number(meeting.duration_minutes);
        if (!duration || duration <= 0) {
          toast.error(`Meeting ${index + 1}: duration must be greater than 0`);
          return false;
        }
        if (!meeting.attendance_file || !validateExtension(meeting.attendance_file, ".csv")) {
          toast.error(`Meeting ${index + 1}: attendance .csv is required`);
          return false;
        }
        if (!meeting.transcript_file || !validateExtension(meeting.transcript_file, ".txt")) {
          toast.error(`Meeting ${index + 1}: transcript .txt is required`);
          return false;
        }
        if (!meeting.chat_file || !validateExtension(meeting.chat_file, ".txt")) {
          toast.error(`Meeting ${index + 1}: chat .txt is required`);
          return false;
        }
      }
      return true;
    }

    return true;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!attendanceFile) {
        toast.error("Attendance file is required");
        return;
      }
      let parsedMembers = members;
      if (parsedMembers.length === 0) {
        try {
          const response = await previewAttendance.mutateAsync(attendanceFile);
          parsedMembers = response.data.members;
          setMembers(parsedMembers);
        } catch (error) {
          const apiError = error as ApiError;
          toast.error(apiError.message ?? "Could not parse attendance file");
          return;
        }
      }
      if (parsedMembers.length === 0) {
        toast.error(
          "Upload a valid attendance CSV with Name, Email, Duration_Minutes, Facilitator"
        );
        return;
      }
      setStep(2);
      return;
    }

    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, STEPS.length));
  };

  const handleSubmit = async () => {
    if (!validateStep(4) || !attendanceFile) return;

    const github = githubUrls.map((u) => u.trim()).filter(Boolean);
    const docs = docUrls.map((u) => u.trim()).filter(Boolean);
    const meetingsMeta: MeetingInputMeta[] = meetings.map((meeting) => ({
      session_label: meeting.session_label.trim(),
      session_date: meeting.session_date,
      duration_minutes: Number(meeting.duration_minutes),
    }));

    try {
      const response = await createReport.mutateAsync({
        attendance_file: attendanceFile,
        github_urls: github,
        google_doc_urls: docs,
        meetings: meetingsMeta,
        meeting_files: meetings.map((meeting) => ({
          attendance: meeting.attendance_file!,
          transcript: meeting.transcript_file!,
          chat: meeting.chat_file!,
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
              Create Assignment Report
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Upload attendance to auto-create the next group, link resources,
              and add meeting sessions for contribution analysis.
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
            <>
              <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <UsersIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p>
                    Upload an attendance CSV with columns: Name, Email,
                    Duration_Minutes, Facilitator. Members will be provisioned
                    automatically and the group will be named {nextGroupLabel}.
                  </p>
                </div>
              </div>
              <MeetingFilePicker
                id="report-attendance"
                label="Attendance list (.csv)"
                accept=".csv"
                file={attendanceFile}
                onChange={async (file) => {
                  setAttendanceFile(file);
                  setMembers([]);
                  if (file) await parseAttendance(file);
                }}
                disabled={pending}
              />
              {members.length > 0 && (
                <div className="rounded-xl border">
                  <div className="border-b px-4 py-2 text-sm font-medium">
                    {members.length} member{members.length === 1 ? "" : "s"} detected
                  </div>
                  <ul className="max-h-48 divide-y overflow-y-auto text-sm">
                    {members.map((member) => (
                      <li key={member.email} className="flex justify-between px-4 py-2">
                        <span>{member.name}</span>
                        <span className="text-muted-foreground">{member.email}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
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
                    Add at least one meeting session with attendance, transcript,
                    and chat files. Meeting attendance also drives engagement metrics.
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
                    {meetings.length > 1 && (
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
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className={fieldLabelClass}>Session label</Label>
                    <Input
                      placeholder="e.g. Sprint 1 Review"
                      className={fieldInputClass}
                      value={meeting.session_label}
                      onChange={(e) =>
                        updateMeeting(meeting.id, "session_label", e.target.value)
                      }
                      disabled={pending}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className={fieldLabelClass}>Session date</Label>
                      <Input
                        type="date"
                        className={fieldInputClass}
                        value={meeting.session_date}
                        onChange={(e) =>
                          updateMeeting(meeting.id, "session_date", e.target.value)
                        }
                        disabled={pending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className={fieldLabelClass}>Duration (minutes)</Label>
                      <Input
                        type="number"
                        min={1}
                        className={fieldInputClass}
                        value={meeting.duration_minutes}
                        onChange={(e) =>
                          updateMeeting(
                            meeting.id,
                            "duration_minutes",
                            e.target.value
                          )
                        }
                        disabled={pending}
                      />
                    </div>
                  </div>
                  <MeetingFilePicker
                    id={`meeting-${meeting.id}-attendance`}
                    label="Attendance (.csv)"
                    accept=".csv"
                    file={meeting.attendance_file}
                    onChange={(file) =>
                      updateMeeting(meeting.id, "attendance_file", file)
                    }
                    disabled={pending}
                  />
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
                    label="Chat export (.txt)"
                    accept=".txt"
                    file={meeting.chat_file}
                    onChange={(file) => updateMeeting(meeting.id, "chat_file", file)}
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
              <ReviewRow label="Members" value={`${members.length} from attendance`} />
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
                value={`${meetings.length} session${meetings.length === 1 ? "" : "s"}`}
              />
              <p className="text-xs text-muted-foreground">
                Submitting will create the next auto-named group, provision members,
                sync GitHub/Docs data, process meetings, and email the supervisor when ready.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 gap-3 border-t bg-muted/30 px-6 py-4 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="h-10 min-w-24"
            onClick={step === 1 ? () => onOpenChange(false) : () => setStep(step - 1)}
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
        <Button type="button" variant="outline" size="sm" onClick={onAdd} disabled={disabled}>
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
