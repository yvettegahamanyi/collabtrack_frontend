import { expect, test } from "@playwright/test";

import { createClass as createClassApi, createAssignment, E2E_USERS } from "./helpers/api";
import { buildAuthSession } from "./helpers/auth";

test.describe("Instructor flows", () => {
  test.use({ storageState: "e2e/.auth/instructor.json" });

  test("creates a class from the classes page", async ({ page }) => {
    const className = `E2E Class ${Date.now()}`;

    await page.goto("/instructor/classes");
    await page.getByRole("button", { name: "New Class" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.locator("#class-name").fill(className);
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/classes") &&
          response.request().method() === "POST" &&
          response.ok()
      ),
      dialog.getByRole("button", { name: "Create Class" }).click(),
    ]);

    await expect(page.getByText("Class created")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("creates an assignment inside a class", async ({ page }) => {
    const session = await buildAuthSession(
      E2E_USERS.instructor.email,
      E2E_USERS.instructor.password
    );
    const className = `E2E Class ${Date.now()}`;
    const assignmentTitle = `E2E Assignment ${Date.now()}`;
    const courseClass = await createClassApi(session.token, className);

    await page.goto(`/instructor/classes/${courseClass.id}`);
    await page.getByRole("button", { name: "New Assignment" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.locator("#assignment-title").fill(assignmentTitle);
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/assignments") &&
          response.request().method() === "POST" &&
          response.ok()
      ),
      dialog.getByRole("button", { name: "Create Assignment" }).click(),
    ]);

    await expect(page.getByRole("link", { name: assignmentTitle })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("opens report wizard from assignment detail", async ({ page }) => {
    const session = await buildAuthSession(
      E2E_USERS.instructor.email,
      E2E_USERS.instructor.password
    );
    const className = `E2E Class ${Date.now()}`;
    const assignmentTitle = `E2E Assignment ${Date.now()}`;
    const courseClass = await createClassApi(session.token, className);
    const assignment = await createAssignment(
      session.token,
      courseClass.id,
      assignmentTitle
    );

    await page.goto(`/instructor/assignments/${assignment.id}`);
    await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible();
    await page.getByRole("button", { name: "Create Report" }).click();

    const wizard = page.getByRole("dialog");
    await expect(
      wizard.getByRole("heading", { name: "Create Group Report" })
    ).toBeVisible();
    await expect(wizard.getByText("1. Members")).toBeVisible();
  });
});
