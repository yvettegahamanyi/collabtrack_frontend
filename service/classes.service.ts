import { api } from "@/lib/api-client";
import type {
  ClassDetailResponse,
  ClassResponse,
  ClassesResponse,
  CreateClassPayload,
  UpdateClassPayload,
} from "@/types/classes";

export function getClasses() {
  return api.get<ClassesResponse>("/classes");
}

export function getClass(classId: string) {
  return api.get<ClassDetailResponse>(`/classes/${classId}`);
}

export function createClass(payload: CreateClassPayload) {
  return api.post<ClassResponse>("/classes", payload);
}

export function updateClass(classId: string, payload: UpdateClassPayload) {
  return api.put<ClassResponse>(`/classes/${classId}`, payload);
}

export function deleteClass(classId: string) {
  return api.delete<{ data: null; message: string; code: number }>(
    `/classes/${classId}`
  );
}
