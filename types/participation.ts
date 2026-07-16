import type { ApiResponse } from "@/lib/auth";

export interface GitHubMetrics {
  total_commits: number;
  lines_changed: number;
  prs_created: number;
  prs_reviewed: number;
  comments: number;
}

export interface GoogleDocsMetrics {
  edits: number;
  comments: number;
}

export interface GoogleDocSyncEvent {
  type: "edit" | "comment" | "comment_reply";
  file_id: string;
  source_id?: string | null;
  author_email?: string | null;
  author_name?: string | null;
  matched_email?: string | null;
  match_method?: string | null;
  timestamp?: string | null;
}

export interface GithubSyncEvent {
  type: "commit" | "pr_created" | "pr_reviewed" | "comment";
  owner: string;
  repo: string;
  source_id?: string | null;
  author_login?: string | null;
  author_email?: string | null;
  matched_login?: string | null;
  matched_email?: string | null;
  match_method?: string | null;
  timestamp?: string | null;
  message?: string | null;
  additions?: number | null;
  deletions?: number | null;
  lines_changed?: number | null;
}

export interface MeetingEngagementMetrics {
  attendance_ratio: number;
  speaking_ratio: number;
  chat_participation: number;
  meeting_lead_count: number;
}

export interface MemberParticipation {
  user_id: string;
  name: string;
  email: string;
  github_connected: boolean;
  google_connected: boolean;
  github_login?: string | null;
  google_email_matched?: boolean | null;
  github: GitHubMetrics | null;
  github_events?: GithubSyncEvent[];
  google_docs: GoogleDocsMetrics | null;
  google_docs_events?: GoogleDocSyncEvent[];
  meeting_engagement?: MeetingEngagementMetrics | null;
}

export interface GroupContributionsData {
  group_id: string;
  last_synced_at: string | null;
  members: MemberParticipation[];
  warnings?: string[];
}

export interface GroupGithubRepo {
  id: string;
  group_id: string;
  owner: string;
  repo: string;
  url: string;
  default_branch?: string | null;
  created_at: string;
}

export interface GroupGoogleDoc {
  id: string;
  group_id: string;
  file_id: string;
  title: string;
  url: string;
  created_at: string;
}

export interface SyncGroupData {
  group_id: string;
  synced_at: string;
  members_synced: number;
  warnings?: string[];
}

export type GroupContributionsResponse = ApiResponse<GroupContributionsData>;
export type MemberParticipationResponse = ApiResponse<MemberParticipation>;
export type GroupReposResponse = ApiResponse<GroupGithubRepo[]>;
export type GroupDocumentsResponse = ApiResponse<GroupGoogleDoc[]>;
export type SyncGroupResponse = ApiResponse<SyncGroupData>;

export interface OutlierDetection {
  is_outlier: boolean;
  anomaly_score: number;
  outlier_type: "typical" | "free_rider" | "over_contributor" | "unusual_profile" | string;
}

export interface StudentCluster {
  cluster_id: number;
  cluster_key: string;
  cluster_label: string;
  composite_score?: number;
  active_platforms?: string[];
}

export interface LLMRationale {
  reasoning: string;
  top_area: string | null;
  flags: string[];
  confidence: number;
  group_observations?: string;
  model_version?: string;
}

export interface ParticipationScore {
  user_id: string;
  name: string | null;
  predicted_score: number;
  contributor_tier: "strong" | "average" | "below" | string;
  features: Record<string, number>;
  generated_at: string;
  outlier?: OutlierDetection | null;
  student_cluster?: StudentCluster | null;
  llm_rationale?: LLMRationale | null;
}

export interface ParticipationScoresSummary {
  group_id: string;
  generated_at: string;
  scores: ParticipationScore[];
  warnings?: string[];
}

export type ParticipationScoresResponse = ApiResponse<ParticipationScoresSummary>;
export type ParticipationScoreResponse = ApiResponse<ParticipationScore>;
