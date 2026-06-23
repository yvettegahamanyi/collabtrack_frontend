import { api } from "@/lib/api-client";
import type {
  CreateMeetingSessionPayload,
  GroupEngagementResponse,
  MeetingSessionResponse,
  MeetingSessionsResponse,
  SubmitNameMappingPayload,
} from "@/types/meetings";

export function createMeetingSession(
  groupId: string,
  payload: CreateMeetingSessionPayload
) {
  return api.post<MeetingSessionResponse>(`/groups/${groupId}/meetings`, payload);
}

export function uploadMeetingFiles(
  groupId: string,
  meetingId: string,
  files: {
    attendance_file: File;
    transcript_file: File;
    chat_file: File;
  }
) {
  const formData = new FormData();
  formData.append("attendance_file", files.attendance_file);
  formData.append("transcript_file", files.transcript_file);
  formData.append("chat_file", files.chat_file);

  return api.postForm<MeetingSessionResponse>(
    `/groups/${groupId}/meetings/${meetingId}/upload`,
    formData
  );
}

export function submitNameMapping(
  groupId: string,
  meetingId: string,
  payload: SubmitNameMappingPayload
) {
  return api.post<MeetingSessionResponse>(
    `/groups/${groupId}/meetings/${meetingId}/mapping`,
    payload
  );
}

export function getMeetingSessions(groupId: string) {
  return api.get<MeetingSessionsResponse>(`/groups/${groupId}/meetings`);
}

export function getMeetingSession(groupId: string, meetingId: string) {
  return api.get<MeetingSessionResponse>(
    `/groups/${groupId}/meetings/${meetingId}`
  );
}

export function deleteMeetingSession(groupId: string, meetingId: string) {
  return api.delete<{ data: null; message: string; code: number }>(
    `/groups/${groupId}/meetings/${meetingId}`
  );
}

export function getGroupEngagement(groupId: string) {
  return api.get<GroupEngagementResponse>(`/groups/${groupId}/engagement`);
}
