import type { ApiResponse } from "@/lib/auth";

import type { GroupContributionsData } from "@/types/participation";

export type ReportStatus = "DRAFT" | "PROCESSING" | "READY" | "FAILED";
export type ContributionReportStatus = "PENDING" | "READY" | "FAILED";

export interface AttendanceMemberPreview {
  name: string;
  email: string;
  duration_minutes: number;
  was_facilitator: boolean;
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
}

export interface AssignmentReportDetail extends AssignmentReport {
  contributions: GroupContributionsData | null;
}

export interface MeetingInputMeta {
  session_label: string;
  session_date: string;
  duration_minutes: number;
}

export interface CreateReportPayload {
  attendance_file: File;
  github_urls: string[];
  google_doc_urls: string[];
  meetings: MeetingInputMeta[];
  meeting_files: Array<{
    attendance: File;
    transcript: File;
    chat: File;
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

export type AttendancePreviewResponse = ApiResponse<{
  members: AttendanceMemberPreview[];
}>;
export type ReportsResponse = ApiResponse<AssignmentReport[]>;
export type ReportDetailResponse = ApiResponse<AssignmentReportDetail>;
export type CreateReportResponse = ApiResponse<CreateReportResult>;
