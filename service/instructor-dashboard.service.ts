import { api } from "@/lib/api-client";
import type { InstructorDashboardResponse } from "@/types/instructor-dashboard";

export function getInstructorDashboard() {
  return api.get<InstructorDashboardResponse>("/instructor/dashboard");
}
