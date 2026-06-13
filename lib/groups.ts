import type { AssignmentStatus, Group } from "@/types/groups";

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Updated just now";
  if (diffHours < 24) return `Updated ${diffHours}h ago`;
  if (diffDays === 1) return "Updated 1d ago";
  return `Updated ${diffDays}d ago`;
}

export function statusLabel(status: AssignmentStatus): string {
  switch (status) {
    case "ACTIVE":
      return "In Progress";
    case "DONE":
      return "Completed";
  }
}

export function statusBadgeVariant(
  status: AssignmentStatus
): "default" | "secondary" | "outline" {
  return status === "ACTIVE" ? "secondary" : "outline";
}

export function splitGroups(groups: Group[]) {
  return {
    active: groups.filter((g) => g.assignment_status === "ACTIVE"),
    previous: groups.filter((g) => g.assignment_status === "DONE"),
  };
}

export function memberInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function mergeGroupWithMembers(
  detail: Group,
  listItem?: Group
): Group {
  return {
    ...detail,
    members: listItem?.members ?? detail.members,
  };
}
