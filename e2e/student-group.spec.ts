import { expect, test } from "@playwright/test";

import { deleteGroup, E2E_USERS, listGroups } from "./helpers/api";

test.describe("Student group creation", () => {
  test.use({ storageState: "e2e/.auth/student.json" });

  test.afterEach(async ({ page }) => {
    const raw = await page.evaluate(() =>
      localStorage.getItem("collabtrack-auth")
    );
    if (!raw) return;

    const parsed = JSON.parse(raw) as {
      state?: { token?: string | null };
    };
    const token = parsed.state?.token;
    if (!token) return;

    try {
      const groups = await listGroups(token);
      for (const group of groups) {
        if (group.group_name.startsWith("E2E Group")) {
          await deleteGroup(token, group.id);
        }
      }
    } catch {
      // Best-effort cleanup.
    }
  });

  test("creates a project group and lands on members tab", async ({ page }) => {
    const groupName = `E2E Group ${Date.now()}`;

    await page.goto("/student/group");
    await expect(page.getByRole("heading", { name: "My Group" })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("button", { name: "Create New Group" }).click();

    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", { name: "Create New Project Group" })
    ).toBeVisible();
    await dialog.locator("#group-name").fill(groupName);
    await dialog.locator("#description").fill("Created by Playwright E2E test");
    await dialog.getByRole("button", { name: "Create Group" }).click();

    await expect(page).toHaveURL(/\/student\/group\/[^/?]+\?tab=members/);
    await expect(page.getByText("Group created successfully")).toBeVisible();
    await expect(page.getByRole("heading", { name: groupName })).toBeVisible();
  });
});
