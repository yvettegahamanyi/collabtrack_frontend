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

export interface MemberParticipation {
  user_id: string;
  name: string;
  email: string;
  github_connected: boolean;
  google_connected: boolean;
  github_login?: string | null;
  google_email_matched?: boolean | null;
  github: GitHubMetrics | null;
  google_docs: GoogleDocsMetrics | null;
}

export interface GroupContributionsData {
  group_id: string;
  last_synced_at: string | null;
  members: MemberParticipation[];
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
}

export type GroupContributionsResponse = ApiResponse<GroupContributionsData>;
export type MemberParticipationResponse = ApiResponse<MemberParticipation>;
export type GroupReposResponse = ApiResponse<GroupGithubRepo[]>;
export type GroupDocumentsResponse = ApiResponse<GroupGoogleDoc[]>;
export type SyncGroupResponse = ApiResponse<SyncGroupData>;
