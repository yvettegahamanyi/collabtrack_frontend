export const API_BASE_URL =
  process.env.PLAYWRIGHT_API_URL ?? "http://127.0.0.1:8000";

export const E2E_USERS = {
  instructor: {
    email: process.env.E2E_INSTRUCTOR_EMAIL ?? "e2e.instructor@example.com",
    password: process.env.E2E_INSTRUCTOR_PASSWORD ?? "E2ETest123!",
    name: process.env.E2E_INSTRUCTOR_NAME ?? "E2E Instructor",
  },
  student: {
    email: process.env.E2E_STUDENT_EMAIL ?? "e2e.student@example.com",
    password: process.env.E2E_STUDENT_PASSWORD ?? "E2ETest123!",
    name: process.env.E2E_STUDENT_NAME ?? "E2E Student",
  },
} as const;

interface ApiEnvelope<T> {
  data: T;
  message: string;
  code: number;
}

interface LoginData {
  access_token: string;
  token_type: string;
}

interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string | null;
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const body = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok) {
    throw new Error(body.message ?? `Request failed: ${path}`);
  }
  return body.data;
}

export async function login(email: string, password: string) {
  return apiRequest<LoginData>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(token: string) {
  return apiRequest<ApiUser>("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createClass(token: string, name: string) {
  return apiRequest<{ id: string; name: string }>("/classes", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, description: "Created for E2E tests" }),
  });
}

export async function createAssignment(
  token: string,
  classId: string,
  title: string
) {
  return apiRequest<{ id: string; title: string }>(
    `/classes/${classId}/assignments`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, description: "E2E assignment" }),
    }
  );
}

export async function deleteClass(token: string, classId: string) {
  await fetch(`${API_BASE_URL}/classes/${classId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteGroup(token: string, groupId: string) {
  await fetch(`${API_BASE_URL}/groups/${groupId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function listGroups(token: string) {
  return apiRequest<Array<{ id: string; group_name: string }>>("/groups", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
