import { api } from "@/lib/api-client";
import type {
  AssignmentDetailResponse,
  AssignmentResponse,
  AssignmentsResponse,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from "@/types/assignments";

export function getClassAssignments(classId: string) {
  return api.get<AssignmentsResponse>(`/classes/${classId}/assignments`);
}

export function getAssignment(assignmentId: string) {
  return api.get<AssignmentDetailResponse>(`/assignments/${assignmentId}`);
}

export function createAssignment(
  classId: string,
  payload: CreateAssignmentPayload
) {
  return api.post<AssignmentResponse>(
    `/classes/${classId}/assignments`,
    payload
  );
}

export function updateAssignment(
  assignmentId: string,
  payload: UpdateAssignmentPayload
) {
  return api.put<AssignmentResponse>(`/assignments/${assignmentId}`, payload);
}

export function deleteAssignment(assignmentId: string) {
  return api.delete<{ data: null; message: string; code: number }>(
    `/assignments/${assignmentId}`
  );
}
