import type { MemberParticipation } from "@/types/participation";

export type PlatformKey = "github" | "docs" | "meeting";

export interface PlatformPercentages {
  github: number;
  docs: number;
  meeting: number;
}

export interface ContributionComparisonRow extends PlatformPercentages {
  member: string;
  userId: string;
  isCurrentUser: boolean;
}

export interface GroupPlatformAverages extends PlatformPercentages {}

export interface ActivePlatforms {
  github: boolean;
  docs: boolean;
  meeting: boolean;
}

export interface StudentPlatformProfile extends PlatformPercentages {
  contributorTier: string | null;
}

export type PlatformLevel = "low" | "average" | "high";

export interface PlatformInsight {
  platform: PlatformKey;
  level: PlatformLevel;
}

export interface ParticipationInsightResult {
  messages: string[];
  platformLevels: PlatformInsight[];
}

const LOW_RATIO = 0.65;
const HIGH_RATIO = 1.5;
const VERY_HIGH_ABSOLUTE = 75;
const LOW_GROUP_AVG_THRESHOLD = 40;

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  github: "GitHub",
  docs: "Docs",
  meeting: "Meeting",
};

const LOW_SUGGESTIONS: Record<PlatformKey, string> = {
  github:
    "Try pushing code, opening pull requests, or reviewing teammates' PRs.",
  docs: "Try editing the shared document and leaving comments on teammates' work.",
  meeting:
    "Try attending meetings consistently and contributing in chat or speaking up.",
};

const HIGH_SUGGESTIONS: Record<PlatformKey, string> = {
  github: "Consider delegating issues or pairing with teammates on PRs.",
  docs: "Consider sharing document ownership and inviting others to edit.",
  meeting: "Consider inviting quieter members to speak or rotating facilitation.",
};

function safeRatio(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return numerator / denominator;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundPercent(value: number): number {
  return Math.round(Math.min(Math.max(value * 100, 0), 100));
}

export function memberFirstName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "Member";
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

interface GroupRawTotals {
  commits: number;
  lines: number;
  prsReviewed: number;
  edits: number;
  comments: number;
  hasMeetingData: boolean;
}

function computeGroupRawTotals(members: MemberParticipation[]): GroupRawTotals {
  let commits = 0;
  let lines = 0;
  let prsReviewed = 0;
  let edits = 0;
  let comments = 0;
  let hasMeetingData = false;

  for (const member of members) {
    if (member.github) {
      commits += member.github.total_commits;
      lines += member.github.lines_changed;
      prsReviewed += member.github.prs_reviewed;
    }
    if (member.google_docs) {
      edits += member.google_docs.edits;
      comments += member.google_docs.comments;
    }
    if (member.meeting_engagement) {
      const engagement = member.meeting_engagement;
      if (
        engagement.attendance_ratio > 0 ||
        engagement.speaking_ratio > 0 ||
        engagement.chat_participation > 0
      ) {
        hasMeetingData = true;
      }
    }
  }

  return { commits, lines, prsReviewed, edits, comments, hasMeetingData };
}

export function getActivePlatforms(members: MemberParticipation[]): ActivePlatforms {
  const totals = computeGroupRawTotals(members);
  return {
    github: totals.commits > 0 || totals.lines > 0 || totals.prsReviewed > 0,
    docs: totals.edits > 0 || totals.comments > 0,
    meeting: totals.hasMeetingData,
  };
}

export function computeMemberPlatformPercentages(
  member: MemberParticipation,
  totals: GroupRawTotals
): PlatformPercentages {
  const githubValues: number[] = [];
  if (member.github) {
    if (totals.commits > 0) {
      githubValues.push(safeRatio(member.github.total_commits, totals.commits));
    }
    if (totals.lines > 0) {
      githubValues.push(safeRatio(member.github.lines_changed, totals.lines));
    }
    if (totals.prsReviewed > 0) {
      githubValues.push(
        safeRatio(member.github.prs_reviewed, totals.prsReviewed)
      );
    }
  }

  const docsValues: number[] = [];
  if (member.google_docs) {
    if (totals.edits > 0) {
      docsValues.push(safeRatio(member.google_docs.edits, totals.edits));
    }
    if (totals.comments > 0) {
      docsValues.push(
        safeRatio(member.google_docs.comments, totals.comments)
      );
    }
  }

  const meetingValues: number[] = [];
  if (member.meeting_engagement && totals.hasMeetingData) {
    meetingValues.push(member.meeting_engagement.attendance_ratio);
    meetingValues.push(member.meeting_engagement.speaking_ratio);
    meetingValues.push(member.meeting_engagement.chat_participation);
  }

  return {
    github: roundPercent(mean(githubValues)),
    docs: roundPercent(mean(docsValues)),
    meeting: roundPercent(mean(meetingValues)),
  };
}

export function buildContributionComparison(
  members: MemberParticipation[],
  currentUserId: string
): ContributionComparisonRow[] {
  const totals = computeGroupRawTotals(members);

  return members.map((member) => {
    const percentages = computeMemberPlatformPercentages(member, totals);
    return {
      ...percentages,
      member: memberFirstName(member.name),
      userId: member.user_id,
      isCurrentUser: member.user_id === currentUserId,
    };
  });
}

export function computeGroupPlatformAverages(
  rows: ContributionComparisonRow[]
): GroupPlatformAverages {
  if (rows.length === 0) {
    return { github: 0, docs: 0, meeting: 0 };
  }

  return {
    github: Math.round(
      rows.reduce((sum, row) => sum + row.github, 0) / rows.length
    ),
    docs: Math.round(rows.reduce((sum, row) => sum + row.docs, 0) / rows.length),
    meeting: Math.round(
      rows.reduce((sum, row) => sum + row.meeting, 0) / rows.length
    ),
  };
}

function classifyPlatformLevel(
  pct: number,
  groupAvg: number,
  memberCount: number
): PlatformLevel {
  const fairLow = (100 / Math.max(memberCount, 1)) * 0.5;
  const lowThreshold = Math.max(fairLow, groupAvg * LOW_RATIO);
  const highThreshold = groupAvg * HIGH_RATIO;

  if (pct < lowThreshold) return "low";
  if (pct > highThreshold) return "high";
  return "average";
}

function isVeryHighDominance(pct: number, groupAvg: number): boolean {
  return pct >= VERY_HIGH_ABSOLUTE && groupAvg < LOW_GROUP_AVG_THRESHOLD;
}

export function buildParticipationInsights(
  profile: StudentPlatformProfile,
  groupAverages: GroupPlatformAverages,
  activePlatforms: ActivePlatforms,
  memberCount: number
): ParticipationInsightResult {
  const platformKeys = (["github", "docs", "meeting"] as PlatformKey[]).filter(
    (key) => activePlatforms[key]
  );

  const platformLevels: PlatformInsight[] = platformKeys.map((platform) => ({
    platform,
    level: classifyPlatformLevel(
      profile[platform],
      groupAverages[platform],
      memberCount
    ),
  }));

  const lowPlatforms = platformLevels.filter((item) => item.level === "low");
  const highPlatforms = platformLevels.filter((item) => item.level === "high");
  const veryHighPlatforms = platformKeys.filter((platform) =>
    isVeryHighDominance(profile[platform], groupAverages[platform])
  );

  const messages: string[] = [];
  const isBelowTier = profile.contributorTier === "below";
  const allAverage =
    platformLevels.length > 0 &&
    platformLevels.every((item) => item.level === "average");

  if (isBelowTier || lowPlatforms.length > 0) {
    for (const { platform } of lowPlatforms) {
      messages.push(
        `Your ${PLATFORM_LABELS[platform]} participation is lower than your teammates. ${LOW_SUGGESTIONS[platform]}`
      );
    }
    if (lowPlatforms.length === 0 && isBelowTier) {
      messages.push(
        "Your overall contribution is below your teammates. Try increasing activity across GitHub, docs, and meetings."
      );
    }
  }

  const carryingLoad =
    veryHighPlatforms.length > 0 || highPlatforms.length >= 2;

  if (carryingLoad) {
    const dominantPlatforms =
      veryHighPlatforms.length > 0
        ? veryHighPlatforms
        : highPlatforms.map((item) => item.platform);

    const labels = dominantPlatforms.map((platform) => PLATFORM_LABELS[platform]);
    const labelText =
      labels.length === 1
        ? labels[0]
        : `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;

    messages.push(
      `You're contributing heavily on ${labelText}. Consider talking with your team about sharing tasks — balanced collaboration often improves everyone's score. ${dominantPlatforms.map((platform) => HIGH_SUGGESTIONS[platform]).join(" ")}`
    );
  }

  if (
    messages.length === 0 &&
    allAverage &&
    (profile.contributorTier === "average" ||
      profile.contributorTier === "strong" ||
      profile.contributorTier === null)
  ) {
    messages.push(
      "You're maintaining balanced contribution across your team. Keep up the good practice!"
    );
  }

  if (messages.length === 0 && lowPlatforms.length > 0 && highPlatforms.length > 0) {
    for (const { platform } of lowPlatforms) {
      messages.push(
        `Focus on improving ${PLATFORM_LABELS[platform]}: ${LOW_SUGGESTIONS[platform]}`
      );
    }
  }

  if (messages.length === 0) {
    messages.push(
      "Review your contribution breakdown and keep collaborating consistently with your team."
    );
  }

  return { messages, platformLevels };
}

export function getMemberRawCounts(member: MemberParticipation): {
  githubCommits: number;
  docEdits: number;
} {
  return {
    githubCommits: member.github?.total_commits ?? 0,
    docEdits: member.google_docs?.edits ?? 0,
  };
}

/** Platform share cards from persisted ML feature rows (matches backend scoring). */
export function platformPercentagesFromScoreFeatures(
  features: Record<string, number>
): PlatformPercentages {
  const githubValues: number[] = [];
  if ((features.code_commits ?? 0) > 0) {
    githubValues.push(features.code_commits);
  }
  if ((features.code_share ?? 0) > 0) {
    githubValues.push(features.code_share);
  }
  if ((features.review_participation ?? 0) > 0) {
    githubValues.push(features.review_participation);
  }

  const docsValues: number[] = [];
  if ((features.docs_contribution_share ?? 0) > 0) {
    docsValues.push(features.docs_contribution_share);
  }
  if ((features.comment_activity ?? 0) > 0) {
    docsValues.push(features.comment_activity);
  }

  const meetingValues: number[] = [];
  if ((features.attendance_ratio ?? 0) > 0) {
    meetingValues.push(features.attendance_ratio);
  }
  if ((features.speaking_participation_ratio ?? 0) > 0) {
    meetingValues.push(features.speaking_participation_ratio);
  }
  if ((features.chat_participation_ratio ?? 0) > 0) {
    meetingValues.push(features.chat_participation_ratio);
  }

  return {
    github: roundPercent(mean(githubValues.length > 0 ? githubValues : [0])),
    docs: roundPercent(mean(docsValues.length > 0 ? docsValues : [0])),
    meeting: roundPercent(mean(meetingValues.length > 0 ? meetingValues : [0])),
  };
}

export function mlParticipationScorePercent(predictedScore: number): number {
  return Math.round(predictedScore * 100);
}

export function meetingActivityLabel(meetingPct: number): string {
  if (meetingPct >= 70) return "Highly Active";
  if (meetingPct >= 40) return "Active";
  return "Low Activity";
}
