import type { ApiResponse } from "@/lib/auth";

export type TrainingCollectionStatus = "PROCESSING" | "COMPLETED" | "FAILED";

export interface IdentityMemberPreview {
  name: string;
  github_email: string | null;
  google_docs_email: string | null;
  google_meet_email: string | null;
}

export interface DatasetRow {
  id: string;
  student_id: string;
  group_id: string;
  code_commits: number;
  code_share: number;
  review_participation: number;
  attendance_ratio: number;
  speaking_participation_ratio: number;
  chat_participation_ratio: number;
  docs_contribution_share: number;
  comment_activity: number;
  benchmark_score: number;
  created_at: string;
}

export interface TrainingCollection {
  id: string;
  project_group_id: string;
  dataset_group_id: string;
  created_by_user_id: string;
  status: TrainingCollectionStatus;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface TrainingCollectionDetail extends TrainingCollection {
  members: IdentityMemberPreview[];
  dataset_rows: DatasetRow[];
  warnings: string[];
}

export interface MeetingInputMeta {
  session_label: string;
  session_date: string;
  duration_minutes: number;
}

export interface CreateTrainingCollectionPayload {
  identity_csv: File;
  github_urls?: string[];
  google_doc_urls?: string[];
  meetings: MeetingInputMeta[];
  meeting_files: Array<{
    attendance: File;
    transcript: File;
    chat?: File | null;
  }>;
}

export type TrainingCollectionsResponse = ApiResponse<TrainingCollection[]>;
export type TrainingCollectionDetailResponse = ApiResponse<TrainingCollectionDetail>;
