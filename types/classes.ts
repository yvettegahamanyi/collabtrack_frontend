import type { ApiResponse } from "@/lib/auth";

export interface CourseClass {
  id: string;
  name: string;
  description: string | null;
  instructor_id: string;
  created_at: string;
  assignment_count: number;
}

export interface ClassDetail extends CourseClass {
  assignments: import("@/types/assignments").Assignment[];
}

export interface CreateClassPayload {
  name: string;
  description?: string;
}

export interface UpdateClassPayload {
  name?: string;
  description?: string;
}

export type ClassesResponse = ApiResponse<CourseClass[]>;
export type ClassResponse = ApiResponse<CourseClass>;
export type ClassDetailResponse = ApiResponse<ClassDetail>;
