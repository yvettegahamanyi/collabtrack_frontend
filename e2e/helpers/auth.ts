import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { getMe, login } from "./api";

type FrontendRole = "admin" | "instructor" | "student";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: FrontendRole | null;
}

function toFrontendRole(apiRole: string | null): FrontendRole | null {
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

export async function buildAuthSession(email: string, password: string) {
  const { access_token } = await login(email, password);
  const apiUser = await getMe(access_token);
  const user: StoredUser = {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: toFrontendRole(apiUser.role),
  };

  const storageValue = JSON.stringify({
    state: {
      user,
      token: access_token,
      isAuthenticated: true,
      needsOnboarding: false,
      redirectPath: null,
    },
  });

  return { user, token: access_token, storageValue };
}

export async function loginViaUi(
  page: Page,
  email: string,
  password: string
) {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
}
