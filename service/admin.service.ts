import { api } from "@/lib/api-client";
import type {
  AdminStatsResponse,
  AdminUserResponse,
  AdminUsersResponse,
} from "@/types/admin";

export function getAdminStats() {
  return api.get<AdminStatsResponse>("/admin/stats");
}

export function getAdminUsers() {
  return api.get<AdminUsersResponse>("/admin/users");
}

export function activateUser(userId: string) {
  return api.post<AdminUserResponse>(`/admin/users/${userId}/activate`);
}

export function deactivateUser(userId: string) {
  return api.post<AdminUserResponse>(`/admin/users/${userId}/deactivate`);
}
