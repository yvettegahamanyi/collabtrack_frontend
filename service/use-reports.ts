import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import * as reportsService from "@/service/reports.service";
import type { CreateReportPayload } from "@/types/reports";

export function useReports(assignmentId: string) {
  return useQuery({
    queryKey: queryKeys.reports.list(assignmentId),
    queryFn: () => reportsService.getReports(assignmentId),
    enabled: Boolean(assignmentId),
  });
}

export function useReport(assignmentId: string, groupId: string) {
  return useQuery({
    queryKey: queryKeys.reports.detail(assignmentId, groupId),
    queryFn: () => reportsService.getReport(assignmentId, groupId),
    enabled: Boolean(assignmentId) && Boolean(groupId),
    refetchInterval: (query) => {
      const status = query.state.data?.data?.report_status;
      if (status === "PROCESSING" || status === "DRAFT") {
        return 5000;
      }
      return false;
    },
  });
}

export function usePreviewAttendance(assignmentId: string) {
  return useMutation({
    mutationFn: (file: File) =>
      reportsService.previewAttendance(assignmentId, file),
  });
}

export function useCreateReport(assignmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReportPayload) =>
      reportsService.createReport(assignmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reports.list(assignmentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.assignments.detail(assignmentId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.instructor.all });
    },
  });
}

export function useNotifySupervisor(assignmentId: string, groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => reportsService.notifySupervisor(assignmentId, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reports.detail(assignmentId, groupId),
      });
    },
  });
}
