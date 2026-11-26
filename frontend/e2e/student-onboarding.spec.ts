import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";
import { E2E_STUDENT_EMAIL } from "./globalSetup";
import { TEST_PASSWORD } from "../tests/helpers/testDb";

test("student completes onboarding and sees real MLE compatibility scores", async ({ page }) => {
  await loginAs(page, E2E_STUDENT_EMAIL, TEST_PASSWORD);

  // The onboarding quiz auto-opens for a student with no persona result yet.
  await expect(page.getByRole("heading", { name: "Onboarding Quiz" })).toBeVisible();

  await page.getByRole("button", { name: "Coding" }).click();
  await page.getByRole("button", { name: "Robotics & Hardware" }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();

  await page.getByRole("button", { name: "Technical / Programming" }).click();
  await page.getByRole("button", { name: "See my persona match" }).click();

  // Real round-trip through Next.js -> mle-service -> Postgres.
  await expect(page.getByText("Your persona match")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/^\d+%$/)).toBeVisible();

  await page.getByRole("button", { name: "Explore recommended societies" }).click();

  // Back on the Societies page, the "Top Matches" filter should now show
  // real recommendations instead of the empty state.
  await page.getByRole("button", { name: "Top Matches" }).click();
  await expect(page.getByText("No matches yet")).toHaveCount(0);
});
