import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import * as assignmentsService from "@/service/assignments.service";
import type {
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from "@/types/assignments";

export function useClassAssignments(classId: string) {
  return useQuery({
    queryKey: queryKeys.assignments.list(classId),
    queryFn: () => assignmentsService.getClassAssignments(classId),
    enabled: Boolean(classId),
  });
}

export function useAssignment(assignmentId: string) {
  return useQuery({
    queryKey: queryKeys.assignments.detail(assignmentId),
    queryFn: () => assignmentsService.getAssignment(assignmentId),
    enabled: Boolean(assignmentId),
    refetchInterval: (query) => {
      const reports = query.state.data?.data?.reports ?? [];
      const hasProcessing = reports.some(
        (report) =>
          report.report_status === "PROCESSING" || report.report_status === "DRAFT"
      );
      return hasProcessing ? 5000 : false;
    },
  });
}

export function useCreateAssignment(classId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) =>
      assignmentsService.createAssignment(classId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.classes.detail(classId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.assignments.list(classId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.instructor.all });
    },
  });
}

export function useUpdateAssignment(assignmentId: string, classId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAssignmentPayload) =>
      assignmentsService.updateAssignment(assignmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.assignments.detail(assignmentId),
      });
      if (classId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.classes.detail(classId),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.instructor.all });
    },
  });
}

export function useDeleteAssignment(classId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string) =>
      assignmentsService.deleteAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.classes.detail(classId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.assignments.list(classId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.instructor.all });
    },
  });
}
