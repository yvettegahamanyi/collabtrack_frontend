import { api } from "@/lib/api-client";
import type {
  CreateTrainingCollectionPayload,
  TrainingCollectionDetailResponse,
  TrainingCollectionsResponse,
} from "@/types/training";

export function createTrainingCollection(payload: CreateTrainingCollectionPayload) {
  const form = new FormData();
  form.append("identity_csv", payload.identity_csv);

  const githubUrls = (payload.github_urls ?? []).map((u) => u.trim()).filter(Boolean);
  const docUrls = (payload.google_doc_urls ?? []).map((u) => u.trim()).filter(Boolean);
  if (githubUrls.length > 0) {
    form.append("github_urls", JSON.stringify(githubUrls));
  }
  if (docUrls.length > 0) {
    form.append("google_doc_urls", JSON.stringify(docUrls));
  }

  form.append("meetings_meta", JSON.stringify(payload.meetings));

  payload.meeting_files.forEach((files, index) => {
    form.append(`meetings_${index}_attendance`, files.attendance);
    form.append(`meetings_${index}_transcript`, files.transcript);
    if (files.chat) {
      form.append(`meetings_${index}_chat`, files.chat);
    }
  });

  return api.postForm<TrainingCollectionDetailResponse>(
    "/training/collections",
    form
  );
}

export function getTrainingCollections() {
  return api.get<TrainingCollectionsResponse>("/training/collections");
}

export function getTrainingCollection(collectionId: string) {
  return api.get<TrainingCollectionDetailResponse>(
    `/training/collections/${collectionId}`
  );
}
