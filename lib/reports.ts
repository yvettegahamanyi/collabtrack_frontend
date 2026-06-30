import type { ReportStatus } from "@/types/reports";

export function reportGroupLabel(
  groupName: string | null,
  groupNumber: number | null
): string {
  return groupName ?? (groupNumber != null ? `Group ${groupNumber}` : "Group");
}

export function reportStatusVariant(
  status: ReportStatus | null | undefined
): "default" | "destructive" | "secondary" | "outline" {
  switch (status) {
    case "READY":
      return "default";
    case "FAILED":
      return "destructive";
    case "PROCESSING":
    case "DRAFT":
      return "secondary";
    default:
      return "outline";
  }
}

export function reportStatusLabel(status: ReportStatus | null | undefined): string {
  return status ?? "DRAFT";
}

export function reportTableStatusLabel(
  status: ReportStatus | null | undefined
): string {
  switch (status) {
    case "READY":
      return "Ready";
    case "FAILED":
      return "Flagged";
    case "PROCESSING":
    case "DRAFT":
      return "Processing";
    default:
      return "Unknown";
  }
}

export function reportTableStatusVariant(
  status: ReportStatus | null | undefined
): "default" | "destructive" | "secondary" | "outline" {
  switch (status) {
    case "READY":
      return "secondary";
    case "FAILED":
      return "destructive";
    case "PROCESSING":
    case "DRAFT":
      return "outline";
    default:
      return "outline";
  }
}

export function reportDetailHref(assignmentId: string, groupId: string): string {
  return `/instructor/assignments/${assignmentId}/reports/${groupId}?tab=contribution`;
}

export function formatReportDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
