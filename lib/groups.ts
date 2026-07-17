import type { User } from "@/types";
import type { AssignmentStatus, Group } from "@/types/groups";

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

export function studentClusterDescription(clusterKey: string): string {
  switch (clusterKey) {
    case "free_rider":
      return "Contribution is well below the group average across measured channels.";
    case "normal_contributor":
      return "Contribution is around the group average across measured channels.";
    case "over_contributor":
      return "Contribution is clearly above the group average across measured channels.";
    case "insufficient_data":
      return "Not enough measured activity on any platform to classify this student.";
    default:
      return "Contribution style identified from collaboration feature patterns.";
  }
}

export function studentClusterPlatformLabel(platform: string): string {
  switch (platform) {
    case "code":
      return "GitHub";
    case "meetings":
      return "Meetings";
    case "communication":
      return "Docs & chat";
    default:
      return platform.replace(/_/g, " ");
  }
}

export function studentClusterBadgeVariant(
  clusterKey: string
): "default" | "secondary" | "outline" | "destructive" {
  switch (clusterKey) {
    case "free_rider":
      return "destructive";
    case "normal_contributor":
      return "secondary";
    case "over_contributor":
      return "default";
    case "insufficient_data":
      return "outline";
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

const PARTICIPATION_FEATURE_LABELS: Record<string, string> = {
  code_commits: "Code commits",
  code_share: "Code lines changed",
  review_participation: "Pull request reviews",
  attendance_ratio: "Meeting attendance",
  speaking_participation_ratio: "Speaking in meetings",
  chat_participation_ratio: "Meeting chat",
  docs_contribution_share: "Google Docs edits",
  comment_activity: "Google Docs comments",
};

export function participationFeatureLabel(key: string): string {
  return PARTICIPATION_FEATURE_LABELS[key] ?? key.replaceAll("_", " ");
}

export function scoreConfidenceTextClass(confidence: number): string {
  if (confidence >= 0.8) {
    return "text-green-600 dark:text-green-400";
  }
  if (confidence >= 0.65) {
    return "text-amber-600 dark:text-amber-400";
  }
  return "text-red-600 dark:text-red-400";
}

export function scoreConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) {
    return "High scoring confidence";
  }
  if (confidence >= 0.65) {
    return "Moderate scoring confidence";
  }
  return "Low scoring confidence";
}

export function llmFlagLabel(flag: string): string {
  switch (flag) {
    case "possible_data_issue":
      return "Possible data issue";
    case "low_measured_activity":
      return "Low measured activity";
    case "high_relative_contribution":
      return "High relative contribution";
    case "uneven_contribution":
      return "Uneven contribution";
    case "single_member_group":
      return "Single-member group";
    case "needs_instructor_review":
      return "Needs instructor review";
    default:
      return flag.replaceAll("_", " ");
  }
}

/** Strip anonymized LLM refs (e.g. "Member C's") when showing reasoning to the member. */
export function sanitizeLlmReasoning(reasoning: string): string {
  const cleaned = reasoning
    .replace(/\bMember [A-Z]+'s\s+/gi, "")
    .replace(/\bMember [A-Z]+'s\b/gi, "")
    .replace(/\bMember [A-Z]+\s+/gi, "")
    .trim();
  if (!cleaned) {
    return reasoning;
  }
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function mergeGroupWithMembers(detail: Group, listItem?: Group): Group {
  return {
    ...detail,
    members: listItem?.members ?? detail.members,
  };
}
