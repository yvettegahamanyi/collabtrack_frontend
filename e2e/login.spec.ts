import { expect, test } from "@playwright/test";

import { API_BASE_URL, E2E_USERS } from "./helpers/api";

test.describe("Login API", () => {
  test("returns a token for valid instructor credentials", async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/auth/login`, {
      data: {
        email: E2E_USERS.instructor.email,
        password: E2E_USERS.instructor.password,
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.access_token).toBeTruthy();
  });

  test("rejects invalid credentials", async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/auth/login`, {
      data: {
        email: E2E_USERS.instructor.email,
        password: "WrongPassword1!",
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.message).toContain("Incorrect email or password");
  });
});

test.describe("Authenticated navigation", () => {
  test.use({ storageState: "e2e/.auth/instructor.json" });

  test("instructor session opens classes page", async ({ page }) => {
    await page.goto("/instructor/classes");
    await expect(page.getByRole("heading", { name: "Classes" })).toBeVisible({
      timeout: 15_000,
    });
  });
});

test.describe("Login UI", () => {
  test("submits credentials and reaches instructor dashboard", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await page.locator("#email").fill(E2E_USERS.instructor.email);
    await page.locator("#password").fill(E2E_USERS.instructor.password);

    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/auth/login") &&
          response.request().method() === "POST"
      ),
      page.getByRole("button", { name: "Sign In" }).click(),
    ]);

    await expect(page).toHaveURL(/\/instructor/, { timeout: 15_000 });
  });
});
