import type { Role } from "@/types";

export const APP_NAME = "CollabTrack";

export const ROLES: Record<Role, string> = {
  admin: "System Admin",
  instructor: "Instructor",
  student: "Student",
};

/** Landing route for each role after authentication. */
export const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  instructor: "/instructor",
  student: "/student",
};

export const MOODLE_LTI_CONFIG = {
  loginUrl:
    "https://collabtrackbackend-production.up.railway.app/lti/login",
  launchUrl:
    "https://collabtrackbackend-production.up.railway.app/lti/launch",
  jwksUrl: "https://collabtrackbackend-production.up.railway.app/lti/jwks",
  clientId: "109uiWnZTEO1GIO",
} as const;

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  privacy: "/privacy",
  terms: "/terms",
  onboarding: "/onboarding",
  ltiCallback: "/auth/lti-callback",
  admin: "/admin",
  instructor: "/instructor",
  student: "/student",
  studentGroups: "/student/group",
  studentPreviousGroups: "/student/group/previous",
  instructorClasses: "/instructor/classes",
  settings: "/settings",
} as const;

export function groupsListPath(role: Role) {
  return role === "instructor"
    ? ROUTES.instructorClasses
    : ROUTES.studentGroups;
}

export function groupPath(
  groupId: string,
  tab?: string,
  role: Role = "student"
) {
  const base =
    role === "instructor"
      ? `/instructor/group/${groupId}`
      : `/student/group/${groupId}`;
  return tab ? `${base}?tab=${tab}` : base;
}

export function invitePath(token: string) {
  return `/invite/${token}`;
}
