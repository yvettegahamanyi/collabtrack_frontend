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
} as const;
