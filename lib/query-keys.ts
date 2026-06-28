/**
 * Centralized TanStack Query keys. Use these everywhere instead of inline
 * arrays so cache invalidation stays consistent.
 */
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (params?: Record<string, unknown>) =>
      ["users", "list", params ?? {}] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
  courses: {
    all: ["courses"] as const,
    detail: (id: string) => ["courses", "detail", id] as const,
  },
  classes: {
    all: ["classes"] as const,
    list: () => ["classes", "list"] as const,
    detail: (id: string) => ["classes", "detail", id] as const,
  },
  assignments: {
    all: ["assignments"] as const,
    list: (classId: string) => ["assignments", "list", classId] as const,
    detail: (id: string) => ["assignments", "detail", id] as const,
  },
  reports: {
    list: (assignmentId: string) => ["reports", "list", assignmentId] as const,
    detail: (assignmentId: string, groupId: string) =>
      ["reports", "detail", assignmentId, groupId] as const,
  },
  projects: {
    all: ["projects"] as const,
    detail: (id: string) => ["projects", "detail", id] as const,
  },
  contributions: {
    all: ["contributions"] as const,
    byProject: (projectId: string) =>
      ["contributions", "project", projectId] as const,
  },
  groups: {
    all: ["groups"] as const,
    list: () => ["groups", "list"] as const,
    detail: (id: string) => ["groups", "detail", id] as const,
  },
  invites: {
    verify: (token: string) => ["invites", "verify", token] as const,
  },
  integrations: {
    all: ["integrations"] as const,
    status: (userId: string) => ["integrations", "status", userId] as const,
  },
  participation: {
    group: (groupId: string) => ["participation", "group", groupId] as const,
    member: (groupId: string, userId: string) =>
      ["participation", "member", groupId, userId] as const,
    repos: (groupId: string) => ["participation", "repos", groupId] as const,
    documents: (groupId: string) =>
      ["participation", "documents", groupId] as const,
  },
  meetings: {
    all: ["meetings"] as const,
    list: (groupId: string) => ["meetings", "list", groupId] as const,
    detail: (groupId: string, meetingId: string) =>
      ["meetings", "detail", groupId, meetingId] as const,
    engagement: (groupId: string) =>
      ["meetings", "engagement", groupId] as const,
  },
  training: {
    all: ["training"] as const,
    list: () => ["training", "list"] as const,
    detail: (id: string) => ["training", "detail", id] as const,
  },
} as const;
