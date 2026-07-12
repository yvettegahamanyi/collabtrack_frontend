import type { ApiResponse } from "@/lib/auth";

import type { GroupContributionsData } from "@/types/participation";

export type ReportStatus = "DRAFT" | "PROCESSING" | "READY" | "FAILED";
export type ContributionReportStatus = "PENDING" | "READY" | "FAILED";

export interface MemberInput {
  name: string;
  email: string;
}

export interface AssignmentReport {
  group_id: string;
  group_name: string | null;
  group_number: number | null;
  assignment_id: string;
  report_status: ReportStatus | null;
  created_at: string;
  contribution_report_id: string | null;
  contribution_report_status: ContributionReportStatus | null;
  notification_sent_at: string | null;
  has_collaboration_resources?: boolean;
  moodle_grade_sync_available?: boolean;
}

export interface MoodleGradeSyncStudentResult {
  user_id: string;
  student_name: string;
  moodle_user_id: string | null;
  score_given: number | null;
  status: "synced" | "skipped" | "failed";
  message: string | null;
}

export interface MoodleGradeSyncResult {
  group_id: string;
  assignment_id: string;
  score_maximum: number;
  synced_count: number;
  failed_count: number;
  skipped_count: number;
  results: MoodleGradeSyncStudentResult[];
  synced_at: string;
}

export interface AssignmentReportDetail extends AssignmentReport {
  contributions: GroupContributionsData | null;
}

export interface CreateReportPayload {
  members: MemberInput[];
  github_urls: string[];
  google_doc_urls: string[];
  meeting_files: Array<{
    transcript: File;
    chat: File | null;
  }>;
}

export interface SetupReportPayload {
  github_urls: string[];
  google_doc_urls: string[];
  meeting_files: Array<{
    transcript: File;
    chat: File | null;
  }>;
}

export interface CreateReportResult {
  group_id: string;
  group_name: string;
  group_number: number;
  assignment_id: string;
  report_status: ReportStatus;
  members_provisioned: number;
  meetings_created: number;
}

export interface SetupReportResult {
  group_id: string;
  group_name: string | null;
  report_status: ReportStatus;
  resources_linked: number;
  meetings_queued: number;
}

export type MembersPreviewResponse = ApiResponse<{
  members: MemberInput[];
}>;
export type ReportsResponse = ApiResponse<AssignmentReport[]>;
export type ReportDetailResponse = ApiResponse<AssignmentReportDetail>;
export type CreateReportResponse = ApiResponse<CreateReportResult>;
export type SetupReportResponse = ApiResponse<SetupReportResult>;
export type MoodleGradeSyncResponse = ApiResponse<MoodleGradeSyncResult>;
