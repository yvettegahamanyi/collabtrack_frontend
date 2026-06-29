import { api } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/auth";
import type {
  GroupContributionsResponse,
  GroupDocumentsResponse,
  GroupGoogleDoc,
  GroupGithubRepo,
  GroupReposResponse,
  MemberParticipationResponse,
  ParticipationScoreResponse,
  ParticipationScoresResponse,
  SyncGroupResponse,
} from "@/types/participation";

export function getGroupContributions(groupId: string) {
  return api.get<GroupContributionsResponse>(
    `/groups/${groupId}/contributions`
  );
}

export function getMemberParticipation(groupId: string, userId: string) {
  return api.get<MemberParticipationResponse>(
    `/groups/${groupId}/members/${userId}/participation`
  );
}

export function getGroupRepos(groupId: string) {
  return api.get<GroupReposResponse>(`/groups/${groupId}/repos`);
}

export function linkGroupRepo(groupId: string, payload: { url: string }) {
  return api.post<ApiResponse<GroupGithubRepo>>(
    `/groups/${groupId}/repos`,
    payload
  );
}

export function unlinkGroupRepo(groupId: string, repoId: string) {
  return api.delete<{ data: null; message: string; code: number }>(
    `/groups/${groupId}/repos/${repoId}`
  );
}

export function getGroupDocuments(groupId: string) {
  return api.get<GroupDocumentsResponse>(`/groups/${groupId}/documents`);
}

export function linkGroupDocument(groupId: string, payload: { url: string }) {
  return api.post<ApiResponse<GroupGoogleDoc>>(
    `/groups/${groupId}/documents`,
    payload
  );
}

export function unlinkGroupDocument(groupId: string, docId: string) {
  return api.delete<{ data: null; message: string; code: number }>(
    `/groups/${groupId}/documents/${docId}`
  );
}

export function syncGroup(groupId: string) {
  return api.post<SyncGroupResponse>(`/groups/${groupId}/sync`);
}

export function generateParticipationScores(groupId: string) {
  return api.post<ParticipationScoresResponse>(
    `/groups/${groupId}/participation-scores/generate`
  );
}

export function getGroupParticipationScores(groupId: string) {
  return api.get<ParticipationScoresResponse>(
    `/groups/${groupId}/participation-scores`
  );
}

export function getMemberParticipationScore(groupId: string, userId: string) {
  return api.get<ParticipationScoreResponse>(
    `/groups/${groupId}/members/${userId}/participation-score`
  );
}
