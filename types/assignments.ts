import type { ApiResponse } from "@/lib/auth";

import type { AssignmentReport } from "@/types/reports";

export type AssignmentStatus = "ACTIVE" | "DONE";

export interface Assignment {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  supervisor_email: string | null;
  status: AssignmentStatus;
  created_at: string;
  report_count: number;
}

export interface AssignmentDetail extends Assignment {
  class_name: string | null;
  reports: AssignmentReport[];
}

export interface CreateAssignmentPayload {
  title: string;
  description?: string;
  supervisor_email?: string;
  status?: AssignmentStatus;
}

export interface UpdateAssignmentPayload {
  title?: string;
  description?: string;
  supervisor_email?: string;
  status?: AssignmentStatus;
}

export type AssignmentsResponse = ApiResponse<Assignment[]>;
export type AssignmentResponse = ApiResponse<Assignment>;
export type AssignmentDetailResponse = ApiResponse<AssignmentDetail>;
