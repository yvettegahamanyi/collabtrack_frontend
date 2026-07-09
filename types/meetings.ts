import type { ApiResponse } from "@/lib/auth";

export type MeetingSessionStatus =
  | "PENDING"
  | "UPLOADED"
  | "NEEDS_MAPPING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface UnmappedName {
  display_name: string;
}

export interface MeetingSession {
  id: string;
  group_id: string;
  session_label: string;
  session_date: string | null;
  duration_minutes: number | null;
  status: MeetingSessionStatus;
  uploaded_at: string | null;
  processed_at: string | null;
  error_message: string | null;
  unmapped_names: UnmappedName[] | null;
}

export interface CreateMeetingSessionPayload {
  session_label: string;
  session_date: string;
  duration_minutes: number;
}

export interface NameMappingItem {
  display_name: string;
  user_id: string;
}

export interface SubmitNameMappingPayload {
  mappings: NameMappingItem[];
}

export interface StudentEngagement {
  user_id: string;
  student_name: string;
  attendance_ratio: number;
  speaking_ratio: number;
  chat_participation: number;
  meeting_lead_count: number;
  sessions_attended: number;
  total_sessions: number;
}

export interface GroupEngagementReport {
  group_id: string;
  total_sessions: number;
  last_updated: string | null;
  engagement_scores: StudentEngagement[];
}

export type MeetingSessionResponse = ApiResponse<MeetingSession>;
export type MeetingSessionsResponse = ApiResponse<MeetingSession[]>;
export type GroupEngagementResponse = ApiResponse<GroupEngagementReport>;

export const POLLING_STATUSES: MeetingSessionStatus[] = [
  "UPLOADED",
  "PROCESSING",
];
