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

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  onboarding: "/onboarding",
  admin: "/admin",
  instructor: "/instructor",
  student: "/student",
} as const;
