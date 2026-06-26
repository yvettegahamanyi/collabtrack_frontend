import { api } from "@/lib/api-client";
import type {
  AttendancePreviewResponse,
  CreateReportPayload,
  CreateReportResponse,
  ReportDetailResponse,
  ReportsResponse,
} from "@/types/reports";

export function previewAttendance(assignmentId: string, attendanceFile: File) {
  const form = new FormData();
  form.append("attendance_file", attendanceFile);
  return api.postForm<AttendancePreviewResponse>(
    `/assignments/${assignmentId}/reports/preview-attendance`,
    form
  );
}

export function createReport(assignmentId: string, payload: CreateReportPayload) {
  const form = new FormData();
  form.append("attendance_file", payload.attendance_file);
  form.append("github_urls", JSON.stringify(payload.github_urls));
  form.append("google_doc_urls", JSON.stringify(payload.google_doc_urls));
  form.append("meetings", JSON.stringify(payload.meetings));

  payload.meeting_files.forEach((files, index) => {
    form.append(`meeting_${index}_attendance`, files.attendance);
    form.append(`meeting_${index}_transcript`, files.transcript);
    form.append(`meeting_${index}_chat`, files.chat);
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
