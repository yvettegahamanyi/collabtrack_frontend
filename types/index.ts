export type Role = "admin" | "instructor" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role | null;
  avatarUrl?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  details?: unknown;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}
