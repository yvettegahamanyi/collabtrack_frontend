"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
  BarChart3Icon,
  DownloadIcon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
  UploadIcon,
  VideoIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useIntegrations } from "@/service/use-integrations";
import { useCreateTrainingCollection } from "@/service/use-training";
import type { ApiError } from "@/types";
import type {
  DatasetRow,
  IdentityMemberPreview,
  MeetingInputMeta,
  TrainingCollectionDetail,
} from "@/types/training";

const STEPS = [
  { id: 1, label: "Identity" },
  { id: 2, label: "Resources" },
  { id: 3, label: "Meetings" },
  { id: 4, label: "Review" },
] as const;

const fieldLabelClass =
  "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

const identityPreviewColumns: ColumnDef<IdentityMemberPreview>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: { isPrimary: true },
  },
  {
    accessorKey: "github_email",
    header: "GitHub",
    cell: ({ row }) => row.original.github_email ?? "—",
  },
  {
    accessorKey: "google_docs_email",
    header: "Docs",
    cell: ({ row }) => row.original.google_docs_email ?? "—",
  },
  {
    accessorKey: "google_meet_email",
    header: "Meet",
    cell: ({ row }) => row.original.google_meet_email ?? "—",
  },
];

const datasetRowColumns: ColumnDef<DatasetRow>[] = [
  {
    accessorKey: "student_id",
    header: "Student ID",
    meta: { isPrimary: true },
  },
  {
    id: "code_commits",
    accessorFn: (row) => `${(row.code_commits * 100).toFixed(0)}%`,
    header: "Commits",
    meta: { align: "right" },
  },
  {
    id: "code_share",
    accessorFn: (row) => `${(row.code_share * 100).toFixed(0)}%`,
    header: "Lines",
    meta: { align: "right" },
  },
  {
    id: "review_participation",
    accessorFn: (row) => `${(row.review_participation * 100).toFixed(0)}%`,
    header: "Reviews",
    meta: { align: "right" },
  },
  {
    id: "attendance_ratio",
    accessorFn: (row) => `${(row.attendance_ratio * 100).toFixed(0)}%`,
    header: "Attendance",
    meta: { align: "right" },
  },
  {
    id: "docs_contribution_share",
    accessorFn: (row) => `${(row.docs_contribution_share * 100).toFixed(0)}%`,
    header: "Docs",
    meta: { align: "right" },
  },
];

interface MeetingDraft {
  id: string;
  session_label: string;
  session_date: string;
  duration_minutes: string;
  attendance_file: File | null;
  transcript_file: File | null;
  chat_file: File | null;
}

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

function parseIdentityPreview(content: string): IdentityMemberPreview[] {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const nameIndex = headers.findIndex((h) => h === "name");
  const githubIndex = headers.findIndex((h) => h === "github_email");
  const docsIndex = headers.findIndex(
    (h) => h === "google_docs_email" || h === "googledocs_email"
  );
  const meetIndex = headers.findIndex(
    (h) => h === "google_meet_email" || h === "googlemeet_email"
  );

  if (nameIndex === -1) return [];

  return lines.slice(1).flatMap((line) => {
    const cols = line.split(",").map((c) => c.trim());
    const name = cols[nameIndex];
    if (!name) return [];
    return [
      {
        name,
        github_email: githubIndex >= 0 ? cols[githubIndex] || null : null,
        google_docs_email: docsIndex >= 0 ? cols[docsIndex] || null : null,
        google_meet_email: meetIndex >= 0 ? cols[meetIndex] || null : null,
      },
    ];
  });
}

function downloadDatasetCsv(result: TrainingCollectionDetail) {
  const headers = [
    "student_id",
    "group_id",
    "code_commits",
    "code_share",
    "review_participation",
    "attendance_ratio",
    "speaking_participation_ratio",
    "chat_participation_ratio",
    "docs_contribution_share",
    "comment_activity",
  ];
  const rows = result.dataset_rows.map((row) =>
    [
      row.student_id,
      row.group_id,
      row.code_commits,
      row.code_share,
      row.review_participation,
      row.attendance_ratio,
      row.speaking_participation_ratio,
      row.chat_participation_ratio,
      row.docs_contribution_share,
      row.comment_activity,
    ].join(",")
  );
  const blob = new Blob([[headers.join(","), ...rows].join("\n")], {
    type: "text/csv",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `training-group-${result.dataset_group_id}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function TrainingCollectionWizard() {
  const createCollection = useCreateTrainingCollection();
  const { data: integrationsData } = useIntegrations();
  const integrations = integrationsData?.data;

  const [step, setStep] = useState(1);
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [identityPreview, setIdentityPreview] = useState<IdentityMemberPreview[]>(
    []
  );
  const [githubUrls, setGithubUrls] = useState<string[]>([""]);
  const [docUrls, setDocUrls] = useState<string[]>([""]);
  const [meetings, setMeetings] = useState<MeetingDraft[]>([]);
  const [result, setResult] = useState<TrainingCollectionDetail | null>(null);

  const pending = createCollection.isPending;

  const hasGithubIntegration = integrations?.github.connected ?? false;
  const hasGoogleIntegration = integrations?.google.connected ?? false;

  const integrationWarnings = useMemo(() => {
    const warnings: string[] = [];
    const hasGithub = githubUrls.some((u) => u.trim().length > 0);
    const hasDoc = docUrls.some((u) => u.trim().length > 0);
    if (hasGithub && !hasGithubIntegration) {
      warnings.push("Connect GitHub in Settings before submitting repository URLs.");
    }
    if (hasDoc && !hasGoogleIntegration) {
      warnings.push("Connect Google Docs in Settings before submitting document URLs.");
    }
    return warnings;
  }, [docUrls, githubUrls, hasGithubIntegration, hasGoogleIntegration]);

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

  const reset = () => {
    setStep(1);
    setIdentityFile(null);
    setIdentityPreview([]);
    setGithubUrls([""]);
    setDocUrls([""]);
    setMeetings([]);
    setResult(null);
  };

  const handleIdentityUpload = async (file: File | null) => {
    setIdentityFile(file);
    if (!file) {
      setIdentityPreview([]);
      return;
    }
    const content = await file.text();
    const preview = parseIdentityPreview(content);
    setIdentityPreview(preview);
    if (preview.length === 0) {
      toast.error(
        "Could not parse identity CSV. Include a name column and platform emails."
      );
    }
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

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!identityFile || identityPreview.length === 0) {
        toast.error("Upload a valid identity mapping CSV");
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      if (integrationWarnings.length > 0) {
        toast.error(integrationWarnings[0]);
        return false;
      }
      return true;
    }

    if (currentStep === 3) {
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
        if (
          !meeting.attendance_file ||
          !validateExtension(meeting.attendance_file, ".csv")
        ) {
          toast.error(`Meeting ${index + 1}: attendance .csv is required`);
          return false;
        }
        if (
          !meeting.transcript_file ||
          !validateExtension(meeting.transcript_file, ".txt")
        ) {
          toast.error(`Meeting ${index + 1}: transcript .txt is required`);
          return false;
        }
        if (
          meeting.chat_file &&
          !validateExtension(meeting.chat_file, ".txt")
        ) {
          toast.error(`Meeting ${index + 1}: chat file must be a .txt`);
          return false;
        }
      }
      return true;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !identityFile) {
      return;
    }

    const github = githubUrls.map((u) => u.trim()).filter(Boolean);
    const docs = docUrls.map((u) => u.trim()).filter(Boolean);
    const hasMeetings = meetings.length > 0;
    if (github.length === 0 && docs.length === 0 && !hasMeetings) {
      toast.error("Add at least one GitHub URL, Google Doc URL, or meeting");
      return;
    }

    const meetingsMeta: MeetingInputMeta[] = meetings.map((meeting) => ({
      session_label: meeting.session_label.trim(),
      session_date: meeting.session_date,
      duration_minutes: Number(meeting.duration_minutes),
    }));

    try {
      const response = await createCollection.mutateAsync({
        identity_csv: identityFile,
        github_urls: github,
        google_doc_urls: docs,
        meetings: meetingsMeta,
        meeting_files: meetings.map((meeting) => ({
          attendance: meeting.attendance_file!,
          transcript: meeting.transcript_file!,
          chat: meeting.chat_file,
        })),
      });
      setResult(response.data);
      toast.success(`Training group ${response.data.dataset_group_id} collected`);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message ?? "Training data collection failed");
    }
  };

  if (result) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Collection complete</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Group ID {result.dataset_group_id} · {result.dataset_rows.length}{" "}
              student rows saved
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => downloadDatasetCsv(result)}>
              <DownloadIcon className="mr-2 size-4" />
              Download CSV
            </Button>
            <Button onClick={reset}>Collect another group</Button>
          </div>
        </CardHeader>
        <CardContent>
          {result.warnings.length > 0 && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              {result.warnings.join(" ")}
            </div>
          )}
          <DataTable
            columns={datasetRowColumns}
            data={result.dataset_rows}
            embedded
            searchable={false}
            paginated={result.dataset_rows.length > 10}
            toolbar={false}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3Icon className="size-5 text-primary" />
            Training data collection
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload cross-platform identity mapping, optional GitHub/Google Meet
            artifacts, and export anonymized feature rows to the training dataset.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
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

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className={fieldLabelClass}>Identity mapping CSV</Label>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) =>
                    handleIdentityUpload(e.target.files?.[0] ?? null)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Columns: name, github_email, google_docs_email, google_meet_email
                  (at least one email per row).
                </p>
              </div>
              {identityPreview.length > 0 && (
                <DataTable
                  columns={identityPreviewColumns}
                  data={identityPreview}
                  searchable={false}
                  paginated={false}
                  toolbar={false}
                />
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
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
                onRemove={(index) =>
                  removeUrlField(docUrls, setDocUrls, index)
                }
                disabled={pending}
              />
              <p className="text-xs text-muted-foreground">
                Add multiple repos or docs — contribution metrics are aggregated
                across all linked resources when you collect.
              </p>
              {integrationWarnings.map((warning) => (
                <p key={warning} className="text-sm text-amber-600">
                  {warning}
                </p>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {meetings.map((meeting, index) => (
                <div key={meeting.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium">
                      <VideoIcon className="size-4" />
                      Meeting {index + 1}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setMeetings((current) =>
                          current.filter((item) => item.id !== meeting.id)
                        )
                      }
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input
                      placeholder="Session label"
                      value={meeting.session_label}
                      onChange={(e) =>
                        updateMeeting(meeting.id, "session_label", e.target.value)
                      }
                    />
                    <Input
                      type="date"
                      value={meeting.session_date}
                      onChange={(e) =>
                        updateMeeting(meeting.id, "session_date", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Duration (min)"
                      value={meeting.duration_minutes}
                      onChange={(e) =>
                        updateMeeting(meeting.id, "duration_minutes", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(
                      [
                        ["attendance_file", "Attendance (.csv)", ".csv", true],
                        ["transcript_file", "Transcript (.txt)", ".txt", true],
                        ["chat_file", "Chat (.txt, optional)", ".txt", false],
                      ] as const
                    ).map(([field, label, accept, required]) => (
                      <div key={field} className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {label}
                          {!required ? " — optional" : ""}
                        </p>
                        <Input
                          type="file"
                          accept={accept}
                          onChange={(e) =>
                            updateMeeting(
                              meeting.id,
                              field,
                              e.target.files?.[0] ?? null
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setMeetings((current) => [...current, createMeetingDraft()])
                }
              >
                <PlusIcon className="mr-2 size-4" />
                Add meeting
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-medium">Members:</span> {identityPreview.length}
              </p>
              <p>
                <span className="font-medium">GitHub repos:</span>{" "}
                {githubUrls.map((u) => u.trim()).filter(Boolean).length || "None"}
              </p>
              <p>
                <span className="font-medium">Google Docs:</span>{" "}
                {docUrls.map((u) => u.trim()).filter(Boolean).length || "None"}
              </p>
              <p>
                <span className="font-medium">Meetings:</span> {meetings.length}
              </p>
            </div>
          )}

          <div className="flex justify-between border-t pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={step === 1 || pending}
              onClick={() => setStep((current) => Math.max(current - 1, 1))}
            >
              Back
            </Button>
            {step < 4 ? (
              <Button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (!validateStep(step)) return;
                  setStep((current) => Math.min(current + 1, 4));
                }}
              >
                Next
              </Button>
            ) : (
              <Button type="button" disabled={pending} onClick={handleSubmit}>
                <UploadIcon className="mr-2 size-4" />
                {pending ? "Collecting..." : "Collect training data"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
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
        <Button type="button" variant="outline" size="sm" onClick={onAdd} disabled={disabled}>
          <PlusIcon className="mr-1 size-4" />
          Add
        </Button>
      </div>
      {urls.map((url, index) => (
        <div key={index} className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute top-3 left-3 size-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              className="pl-9"
              value={url}
              onChange={(e) => onChange(index, e.target.value)}
              disabled={disabled}
            />
          </div>
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
