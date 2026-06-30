import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import * as participationService from "@/service/participation.service";

export function useGroupContributions(groupId: string) {
  return useQuery({
    queryKey: queryKeys.participation.group(groupId),
    queryFn: () => participationService.getGroupContributions(groupId),
    enabled: Boolean(groupId),
  });
}

export function useMemberParticipation(groupId: string, userId: string) {
  return useQuery({
    queryKey: queryKeys.participation.member(groupId, userId),
    queryFn: () => participationService.getMemberParticipation(groupId, userId),
    enabled: Boolean(groupId) && Boolean(userId),
  });
}

export function useGroupRepos(groupId: string) {
  return useQuery({
    queryKey: queryKeys.participation.repos(groupId),
    queryFn: () => participationService.getGroupRepos(groupId),
    enabled: Boolean(groupId),
  });
}

export function useGroupDocuments(groupId: string) {
  return useQuery({
    queryKey: queryKeys.participation.documents(groupId),
    queryFn: () => participationService.getGroupDocuments(groupId),
    enabled: Boolean(groupId),
  });
}

export function useLinkGroupRepo(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (url: string) =>
      participationService.linkGroupRepo(groupId, { url }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.participation.repos(groupId),
      });
    },
  });
}

export function useUnlinkGroupRepo(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (repoId: string) =>
      participationService.unlinkGroupRepo(groupId, repoId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.participation.repos(groupId),
      });
    },
  });
}

export function useLinkGroupDocument(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (url: string) =>
      participationService.linkGroupDocument(groupId, { url }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.participation.documents(groupId),
      });
    },
  });
}

export function useUnlinkGroupDocument(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) =>
      participationService.unlinkGroupDocument(groupId, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.participation.documents(groupId),
      });
    },
  });
}

export function useSyncGroup(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => participationService.syncGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.participation.group(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.participation.repos(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.participation.documents(groupId),
      });
    },
  });
}

export function useGroupParticipationScores(groupId: string) {
  return useQuery({
    queryKey: queryKeys.participation.scores(groupId),
    queryFn: () => participationService.getGroupParticipationScores(groupId),
    enabled: Boolean(groupId),
  });
}

export function useMemberParticipationScore(groupId: string, userId: string) {
  return useQuery({
    queryKey: queryKeys.participation.memberScore(groupId, userId),
    queryFn: () =>
      participationService.getMemberParticipationScore(groupId, userId),
    enabled: Boolean(groupId) && Boolean(userId),
  });
}

export function useGenerateParticipationScores(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      participationService.generateParticipationScores(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.participation.scores(groupId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.instructor.all });
    },
  });
}
