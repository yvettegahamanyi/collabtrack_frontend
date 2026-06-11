/**
 * Dummy data used to populate the dashboards while the backend is built.
 * Replace these with TanStack Query hooks once the API is ready.
 */

export const studentDashboard = {
  group: "Alpha Team",
  stats: {
    contributionScore: { value: 85, deltaLabel: "+5% vs last week" },
    githubCommits: { value: 24, delta: "+12%", target: 30 },
    docRevisions: { value: 12, target: 15 },
    transcriptAppearances: { value: 42, status: "Highly Active", target: 50 },
  },
  contributionComparison: [
    { member: "Alex", github: 78, docs: 65, meeting: 90 },
    { member: "Sam", github: 55, docs: 42, meeting: 58 },
    { member: "Jordan", github: 48, docs: 70, meeting: 62 },
  ],
  discussion: {
    timeAgo: "14 mins ago",
    coreTheme: "Data Ethics",
    topics: ["Data Ethics", "Machine Learning", "API Design", "User Research"],
    aiInsight:
      "Alex led the discussion on Data Ethics, which accounted for 35% of the total transcript. High sentiment detected during the API Design phase.",
  },
};

export type CohortStatus = "Active" | "Flagged" | "Stable";

export interface Cohort {
  name: string;
  status: CohortStatus;
  metricLabel: string;
  metricValue: number;
  metricTone: "good" | "critical" | "neutral";
  updatedAgo: string;
  memberCount: number;
}

export type MetricStatus = "Optimal" | "Idle" | "Flagged";

export interface DetailedMetric {
  group: string;
  members: number;
  status: MetricStatus;
  trend: string;
  trendDirection: "up" | "flat" | "down";
}

export const instructorDashboard = {
  summary: {
    activeGroups: 12,
    flaggedGroups: 3,
    averageEngagement: 84,
  },
  cohorts: [
    {
      name: "Alpha Team",
      status: "Active",
      metricLabel: "Participation Score",
      metricValue: 92,
      metricTone: "good",
      updatedAgo: "2 hours ago",
      memberCount: 4,
    },
    {
      name: "Beta Squad",
      status: "Flagged",
      metricLabel: "Participation Gap",
      metricValue: 71,
      metricTone: "critical",
      updatedAgo: "2 hours ago",
      memberCount: 4,
    },
    {
      name: "Gamma Project",
      status: "Stable",
      metricLabel: "Participation Score",
      metricValue: 78,
      metricTone: "neutral",
      updatedAgo: "2 hours ago",
      memberCount: 4,
    },
  ] satisfies Cohort[],
  detailedMetrics: [
    {
      group: "Delta Force",
      members: 4,
      status: "Optimal",
      trend: "+12%",
      trendDirection: "up",
    },
    {
      group: "Sigma Seven",
      members: 4,
      status: "Idle",
      trend: "0%",
      trendDirection: "flat",
    },
    {
      group: "Omega Team",
      members: 4,
      status: "Flagged",
      trend: "-8%",
      trendDirection: "down",
    },
  ] satisfies DetailedMetric[],
};
