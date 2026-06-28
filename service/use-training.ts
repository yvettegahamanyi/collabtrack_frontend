import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import * as trainingService from "@/service/training.service";
import type { CreateTrainingCollectionPayload } from "@/types/training";

export function useTrainingCollections() {
  return useQuery({
    queryKey: queryKeys.training.list(),
    queryFn: () => trainingService.getTrainingCollections(),
  });
}

export function useTrainingCollection(collectionId: string | null) {
  return useQuery({
    queryKey: queryKeys.training.detail(collectionId ?? ""),
    queryFn: () => trainingService.getTrainingCollection(collectionId!),
    enabled: Boolean(collectionId),
  });
}

export function useCreateTrainingCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTrainingCollectionPayload) =>
      trainingService.createTrainingCollection(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.training.all });
    },
  });
}
