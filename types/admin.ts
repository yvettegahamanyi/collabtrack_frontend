import type { ApiResponse } from "@/lib/auth";
import type { ApiRole } from "@/lib/auth";

export interface AdminStats {
  user_count: number;
  active_user_count: number;
  report_count: number;
  class_count: number;
  assignment_count: number;
}

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: ApiRole | null;
  is_active: boolean;
  created_at: string;
}

export type AdminStatsResponse = ApiResponse<AdminStats>;
export type AdminUsersResponse = ApiResponse<AdminUser[]>;
export type AdminUserResponse = ApiResponse<AdminUser>;
