import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import * as classesService from "@/service/classes.service";
import type { CreateClassPayload, UpdateClassPayload } from "@/types/classes";

export function useClasses() {
  return useQuery({
    queryKey: queryKeys.classes.list(),
    queryFn: () => classesService.getClasses(),
  });
}

export function useClass(classId: string) {
  return useQuery({
    queryKey: queryKeys.classes.detail(classId),
    queryFn: () => classesService.getClass(classId),
    enabled: Boolean(classId),
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClassPayload) =>
      classesService.createClass(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.instructor.all });
    },
  });
}

export function useUpdateClass(classId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateClassPayload) =>
      classesService.updateClass(classId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.classes.detail(classId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.instructor.all });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (classId: string) => classesService.deleteClass(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.instructor.all });
    },
  });
}
