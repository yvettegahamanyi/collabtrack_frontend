import type { ApiResponse } from "@/lib/auth";

export type AssignmentStatus = "ACTIVE" | "DONE";

export type InviteRole = "STUDENT" | "INSTRUCTOR";

export interface GroupMember {
  user_id: string;
  name: string;
  email: string;
  role: string;
  is_owner: boolean;
  joined_at: string;
}

export interface Group {
  id: string;
  group_name: string;
  description: string | null;
  assignment_status: AssignmentStatus;
  git_weight: number | null;
  doc_weight: number | null;
  transcript_weight: number | null;
  owner_id: string;
  created_at: string;
  members?: GroupMember[];
}

export interface CreateGroupPayload {
  group_name: string;
  description?: string;
  assignment_status: AssignmentStatus;
}

export interface UpdateGroupPayload {
  group_name: string;
  description?: string;
  assignment_status: AssignmentStatus;
}

export interface CreateInvitePayload {
  role: InviteRole;
  expires_in_hours: number;
}

export interface InviteLink {
  token: string;
  invite_url: string;
  role: InviteRole;
  expires_at: string;
  group_id: string;
}

export interface InviteDetails {
  group_id: string;
  group_name: string;
  description: string | null;
  role: InviteRole;
  expires_at: string;
}

export interface AcceptInviteResult {
  group_id: string;
  role: InviteRole;
}

export type GroupsResponse = ApiResponse<Group[]>;
export type GroupResponse = ApiResponse<Group>;
export type InviteLinkResponse = ApiResponse<InviteLink>;
export type InviteDetailsResponse = ApiResponse<InviteDetails>;
export type AcceptInviteResponse = ApiResponse<AcceptInviteResult>;

export type GroupTab =
  | "overview"
  | "members"
  | "contribution"
  | "transcripts";
