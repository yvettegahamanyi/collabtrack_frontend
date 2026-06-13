import type { Role, User } from "@/types";

export type ApiRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string | null;
  is_active?: boolean;
  created_at?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  code: number;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginData {
  access_token: string;
  token_type: string;
}

export interface RegisterData {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

export interface UpdateProfilePayload {
  name: string;
  role: ApiRole;
}

export function toApiRole(role: Role): ApiRole {
  switch (role) {
    case "student":
      return "STUDENT";
    case "instructor":
      return "INSTRUCTOR";
    case "admin":
      return "ADMIN";
  }
}

export function fromApiRole(apiRole: string | null | undefined): Role | null {
  if (!apiRole) return null;

  switch (apiRole.toUpperCase()) {
    case "STUDENT":
      return "student";
    case "INSTRUCTOR":
      return "instructor";
    case "ADMIN":
      return "admin";
    default:
      return null;
  }
}

export function mapApiUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: fromApiRole(apiUser.role),
  };
}
