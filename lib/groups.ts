import type { AssignmentStatus, Group } from "@/types/groups";
import type { User } from "@/types";

export function canManageGroupResources(
  user: Pick<User, "id" | "role"> | null | undefined,
  group: Pick<Group, "owner_id">
): boolean {
  if (!user) return false;
  return user.id === group.owner_id || user.role === "instructor";
}

export function canGenerateParticipationScores(
  user: Pick<User, "id" | "role"> | null | undefined,
  group: Pick<Group, "owner_id" | "members">
): boolean {
  if (!user) return false;
  if (user.id === group.owner_id) return true;
  if (user.role === "instructor") return true;
  return (
    group.members?.some(
      (member) => member.user_id === user.id && member.role === "INSTRUCTOR"
    ) ?? false
  );
}

export function contributorTierLabel(tier: string): string {
  switch (tier) {
    case "strong":
      return "Strong contributor";
    case "average":
      return "Average contributor";
    default:
      return "Below average contributor";
  }
}

export function contributorTierBadgeVariant(
  tier: string
): "default" | "secondary" | "outline" {
  switch (tier) {
    case "strong":
      return "default";
    case "average":
      return "secondary";
    default:
      return "outline";
  }
}

export function outlierTypeLabel(type: string): string {
  switch (type) {
    case "free_rider":
      return "Free-rider risk";
    case "over_contributor":
      return "Over-contributor";
    case "unusual_profile":
      return "Unusual profile";
    default:
      return "Typical";
  }
}

export function outlierBadgeVariant(
  outlierType: string,
  isOutlier: boolean
): "default" | "secondary" | "outline" | "destructive" {
  if (!isOutlier) return "outline";
  switch (outlierType) {
    case "free_rider":
      return "destructive";
    case "over_contributor":
      return "default";
    default:
      return "secondary";
  }
}

export function teamArchetypeDescription(archetype: string): string {
  switch (archetype) {
    case "balanced_team":
      return "Members contribute evenly across code, docs, and meetings.";
    case "one_dominant_contributor":
      return "One member carries most of the workload — high variance across the team.";
    case "uniformly_disengaged":
      return "Low activity across all collaboration channels.";
    case "high_performing_cohesive":
      return "Strong, balanced participation with low variance between members.";
    default:
      return "Team collaboration pattern identified from aggregated member features.";
  }
}

export function teamArchetypeBadgeVariant(
  archetype: string
): "default" | "secondary" | "outline" | "destructive" {
  switch (archetype) {
    case "high_performing_cohesive":
      return "default";
    case "balanced_team":
      return "secondary";
    case "one_dominant_contributor":
      return "outline";
    case "uniformly_disengaged":
      return "destructive";
    default:
      return "secondary";
  }
}

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

export function sortGroupsByNewest(groups: Group[]) {
  return [...groups].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
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
