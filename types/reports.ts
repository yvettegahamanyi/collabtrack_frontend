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

export interface CreateReportResult {
  group_id: string;
  group_name: string;
  group_number: number;
  assignment_id: string;
  report_status: ReportStatus;
  members_provisioned: number;
  meetings_created: number;
}

export type MembersPreviewResponse = ApiResponse<{
  members: MemberInput[];
}>;
export type ReportsResponse = ApiResponse<AssignmentReport[]>;
export type ReportDetailResponse = ApiResponse<AssignmentReportDetail>;
export type CreateReportResponse = ApiResponse<CreateReportResult>;
