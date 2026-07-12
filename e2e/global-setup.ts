import fs from "node:fs";
import path from "node:path";

import { API_BASE_URL, E2E_USERS } from "./helpers/api";
import { buildAuthSession } from "./helpers/auth";

const AUTH_DIR = path.join(__dirname, ".auth");
const BASE_ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3002";

function writeStorageState(filename: string, storageValue: string) {
  fs.writeFileSync(
    path.join(AUTH_DIR, filename),
    JSON.stringify({
      cookies: [],
      origins: [
        {
          origin: BASE_ORIGIN,
          localStorage: [{ name: "collabtrack-auth", value: storageValue }],
        },
      ],
    })
  );
}

async function ensureBackendReachable() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: E2E_USERS.instructor.email,
        password: E2E_USERS.instructor.password,
      }),
    });
    if (!response.ok && response.status !== 401) {
      throw new Error(`Unexpected status ${response.status}`);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown connection error";
    throw new Error(
      [
        `Cannot reach CollabTrack backend at ${API_BASE_URL} (${message}).`,
        "Start the backend before running E2E tests:",
        "  cd collabtrack-backend",
        "  source venv/bin/activate",
        "  python -m scripts.seed_e2e_users",
        "  uvicorn app.main:app --reload --port 8000",
      ].join("\n")
    );
  }
}

export default async function globalSetup() {
  await ensureBackendReachable();

  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const instructor = await buildAuthSession(
    E2E_USERS.instructor.email,
    E2E_USERS.instructor.password
  );
  writeStorageState("instructor.json", instructor.storageValue);

  const student = await buildAuthSession(
    E2E_USERS.student.email,
    E2E_USERS.student.password
  );
  writeStorageState("student.json", student.storageValue);
}
