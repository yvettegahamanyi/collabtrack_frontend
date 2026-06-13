import { api } from "@/lib/api-client";
import type {
  AcceptInviteResponse,
  CreateGroupPayload,
  CreateInvitePayload,
  GroupResponse,
  GroupsResponse,
  InviteDetailsResponse,
  InviteLinkResponse,
  UpdateGroupPayload,
} from "@/types/groups";

export function getGroups() {
  return api.get<GroupsResponse>("/groups");
}

export function getGroup(groupId: string) {
  return api.get<GroupResponse>(`/groups/${groupId}`);
}

export function createGroup(payload: CreateGroupPayload) {
  return api.post<GroupResponse>("/groups", payload);
}

export function updateGroup(groupId: string, payload: UpdateGroupPayload) {
  return api.put<GroupResponse>(`/groups/${groupId}`, payload);
}

export function deleteGroup(groupId: string) {
  return api.delete<{ data: null; message: string; code: number }>(
    `/groups/${groupId}`
  );
}

export function createInvite(groupId: string, payload: CreateInvitePayload) {
  return api.post<InviteLinkResponse>(`/groups/${groupId}/invite`, payload);
}

export function removeMember(groupId: string, userId: string) {
  return api.delete<{ data: null; message: string; code: number }>(
    `/groups/${groupId}/members/${userId}`
  );
}

export function verifyInvite(token: string) {
  return api.get<InviteDetailsResponse>(`/invite/${token}`);
}

export function acceptInvite(token: string) {
  return api.post<AcceptInviteResponse>(`/invite/${token}/accept`);
}
