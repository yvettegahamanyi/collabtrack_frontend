import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import * as meetingsService from "@/service/meetings.service";
import type {
  CreateMeetingSessionPayload,
  MeetingSessionStatus,
  SubmitNameMappingPayload,
} from "@/types/meetings";
import { POLLING_STATUSES } from "@/types/meetings";

export function useMeetingSessions(groupId: string) {
  return useQuery({
    queryKey: queryKeys.meetings.list(groupId),
    queryFn: () => meetingsService.getMeetingSessions(groupId),
    enabled: Boolean(groupId),
  });
}

export function useMeetingSession(
  groupId: string,
  meetingId: string | null,
  options?: { poll?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.meetings.detail(groupId, meetingId ?? ""),
    queryFn: () => meetingsService.getMeetingSession(groupId, meetingId!),
    enabled: Boolean(groupId) && Boolean(meetingId),
    refetchInterval: (query) => {
      if (!options?.poll) return false;
      const status = query.state.data?.data.status as
        | MeetingSessionStatus
        | undefined;
      if (!status) return false;
      return POLLING_STATUSES.includes(status) ? 2500 : false;
    },
  });
}

export function useGroupEngagement(groupId: string) {
  return useQuery({
    queryKey: queryKeys.meetings.engagement(groupId),
    queryFn: () => meetingsService.getGroupEngagement(groupId),
    enabled: Boolean(groupId),
  });
}

export function useCreateMeetingSession(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMeetingSessionPayload) =>
      meetingsService.createMeetingSession(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.meetings.list(groupId),
      });
    },
  });
}

export function useUploadMeetingFiles(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      meetingId,
      files,
    }: {
      meetingId: string;
      files: {
        attendance_file: File;
        transcript_file: File;
        chat_file: File;
      };
    }) => meetingsService.uploadMeetingFiles(groupId, meetingId, files),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.meetings.list(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.meetings.detail(groupId, variables.meetingId),
      });
    },
  });
}

export function useSubmitNameMapping(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      meetingId,
      payload,
    }: {
      meetingId: string;
      payload: SubmitNameMappingPayload;
    }) => meetingsService.submitNameMapping(groupId, meetingId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.meetings.list(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.meetings.detail(groupId, variables.meetingId),
      });
    },
  });
}

export function useDeleteMeetingSession(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (meetingId: string) =>
      meetingsService.deleteMeetingSession(groupId, meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.meetings.list(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.meetings.engagement(groupId),
      });
    },
  });
}

export function invalidateMeetingQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  groupId: string
) {
  queryClient.invalidateQueries({
    queryKey: queryKeys.meetings.list(groupId),
  });
  queryClient.invalidateQueries({
    queryKey: queryKeys.meetings.engagement(groupId),
  });
}
