import { api } from "@/lib/api-client";
import type {
  CreateReportPayload,
  CreateReportResponse,
  MembersPreviewResponse,
  ReportDetailResponse,
  ReportsResponse,
} from "@/types/reports";

export function previewMembers(assignmentId: string, membersFile: File) {
  const form = new FormData();
  form.append("members_file", membersFile);
  return api.postForm<MembersPreviewResponse>(
    `/assignments/${assignmentId}/reports/preview-members`,
    form
  );
}

export function createReport(assignmentId: string, payload: CreateReportPayload) {
  const form = new FormData();
  form.append("members", JSON.stringify(payload.members));
  form.append("github_urls", JSON.stringify(payload.github_urls));
  form.append("google_doc_urls", JSON.stringify(payload.google_doc_urls));

  payload.meeting_files.forEach((files, index) => {
    form.append(`meeting_${index}_transcript`, files.transcript);
    if (files.chat) {
      form.append(`meeting_${index}_chat`, files.chat);
    }
  });

  return api.postForm<CreateReportResponse>(
    `/assignments/${assignmentId}/reports`,
    form
  );
}

export function getReports(assignmentId: string) {
  return api.get<ReportsResponse>(`/assignments/${assignmentId}/reports`);
}

export function getReport(assignmentId: string, groupId: string) {
  return api.get<ReportDetailResponse>(
    `/assignments/${assignmentId}/reports/${groupId}`
  );
}

export function notifySupervisor(assignmentId: string, groupId: string) {
  return api.post<{ data: null; message: string; code: number }>(
    `/assignments/${assignmentId}/reports/${groupId}/notify`
  );
}
