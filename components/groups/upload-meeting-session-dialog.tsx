"use client";

import { CloudUploadIcon, VideoIcon } from "lucide-react";
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
import {
  useCreateMeetingSession,
  useUploadMeetingFiles,
} from "@/service/use-meetings";
import type { ApiError } from "@/types";
import type { MeetingSession } from "@/types/meetings";

interface UploadMeetingSessionDialogProps {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: (session: MeetingSession) => void;
}

const fieldLabelClass =
  "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

const fieldInputClass = "h-11 bg-muted/50";

const STEPS = [
  { id: 1, label: "Session details" },
  { id: 2, label: "Upload files" },
] as const;

function validateExtension(file: File, ext: string) {
  return file.name.toLowerCase().endsWith(ext);
}

export function UploadMeetingSessionDialog({
  groupId,
  open,
  onOpenChange,
  onUploaded,
}: UploadMeetingSessionDialogProps) {
  const createSession = useCreateMeetingSession(groupId);
  const uploadFiles = useUploadMeetingFiles(groupId);

  const [step, setStep] = useState(1);
  const [sessionLabel, setSessionLabel] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [chatFile, setChatFile] = useState<File | null>(null);

  const reset = () => {
    setStep(1);
    setSessionLabel("");
    setSessionDate("");
    setDurationMinutes("");
    setAttendanceFile(null);
    setTranscriptFile(null);
    setChatFile(null);
  };

  const pending = createSession.isPending || uploadFiles.isPending;

  const validateStep1 = () => {
    if (!sessionLabel.trim()) {
      toast.error("Session label is required");
      return false;
    }
    if (!sessionDate) {
      toast.error("Session date is required");
      return false;
    }
    const duration = Number(durationMinutes);
    if (!duration || duration <= 0) {
      toast.error("Duration must be greater than 0 minutes");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
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
  };

  const handleNext = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    try {
      const sessionResponse = await createSession.mutateAsync({
        session_label: sessionLabel.trim(),
        session_date: sessionDate,
        duration_minutes: Number(durationMinutes),
      });

      const uploadResponse = await uploadFiles.mutateAsync({
        meetingId: sessionResponse.data.id,
        files: {
          attendance_file: attendanceFile!,
          transcript_file: transcriptFile!,
          chat_file: chatFile!,
        },
      });

      toast.success("Meeting session uploaded — processing started");
      onUploaded(uploadResponse.data);
      reset();
      onOpenChange(false);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Failed to upload meeting session");
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
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="gap-3 border-b bg-muted/20 px-6 py-5 pr-14">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <VideoIcon className="size-5" />
          </div>
          <div className="space-y-1.5">
            <DialogTitle className="text-lg font-semibold text-primary">
              Upload Meeting Session
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Add attendance, transcript, and chat files for one meeting
              session. CollabTrack will calculate engagement scores
              automatically.
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
                <Label htmlFor="session-label" className={fieldLabelClass}>
                  Session label
                </Label>
                <Input
                  id="session-label"
                  placeholder="e.g. Sprint 1 Review — June 10"
                  className={fieldInputClass}
                  value={sessionLabel}
                  onChange={(e) => setSessionLabel(e.target.value)}
                  disabled={pending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-date" className={fieldLabelClass}>
                  Session date
                </Label>
                <Input
                  id="session-date"
                  type="date"
                  className={fieldInputClass}
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  disabled={pending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className={fieldLabelClass}>
                  Meeting duration (minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  placeholder="60"
                  className={fieldInputClass}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  disabled={pending}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <FilePicker
                id="attendance"
                label="Attendance list (.csv)"
                accept=".csv"
                file={attendanceFile}
                onChange={setAttendanceFile}
                disabled={pending}
              />
              <FilePicker
                id="transcript"
                label="Meeting transcript (.txt)"
                accept=".txt"
                file={transcriptFile}
                onChange={setTranscriptFile}
                disabled={pending}
              />
              <FilePicker
                id="chat"
                label="Chat export (.txt)"
                accept=".txt"
                file={chatFile}
                onChange={setChatFile}
                disabled={pending}
              />
              <p className="text-xs text-muted-foreground">
                Transcript and chat lines should follow the format{" "}
                <code className="rounded bg-muted px-1">[HH:MM] Name: message</code>
                . Names must match attendance Student_ID values or be mapped
                after upload.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 gap-3 border-t bg-muted/30 px-6 py-4 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="h-10 min-w-24"
            onClick={step === 1 ? () => onOpenChange(false) : () => setStep(1)}
            disabled={pending}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>

          {step === 1 ? (
            <Button type="button" className="h-10 min-w-28" onClick={handleNext}>
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              className="h-10 min-w-36"
              onClick={handleSubmit}
              disabled={pending}
            >
              {pending ? "Processing…" : "Process Session"}
              {!pending && <CloudUploadIcon />}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FilePicker({
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
