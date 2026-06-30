import type { ApiResponse } from "@/lib/auth";

import type { AssignmentStatus } from "@/types/assignments";
import type { ReportStatus } from "@/types/reports";

export interface DashboardSummary {
  class_count: number;
  active_assignment_count: number;
  reports_ready_count: number;
  failed_report_count: number;
}

export interface DashboardReportRow {
  group_id: string;
  group_name: string | null;
  group_number: number | null;
  assignment_id: string;
  assignment_title: string;
  class_id: string;
  class_name: string;
  report_status: ReportStatus | null;
  created_at: string;
  notification_sent_at: string | null;
  member_count: number;
}

export interface DashboardAssignmentAction {
  id: string;
  title: string;
  class_id: string;
  class_name: string;
  status: AssignmentStatus;
}

export interface TeamClassificationCount {
  archetype: string;
  label: string;
  count: number;
}

export interface InstructorDashboard {
  summary: DashboardSummary;
  recent_reports: DashboardReportRow[];
  all_reports: DashboardReportRow[];
  failed_reports: DashboardReportRow[];
  assignments_without_reports: DashboardAssignmentAction[];
  team_classifications: TeamClassificationCount[];
  classified_group_count: number;
  unclassified_group_count: number;
}

export type InstructorDashboardResponse = ApiResponse<InstructorDashboard>;
