import { test, expect } from "@playwright/test";
import { loginAs, dismissQuizIfPresent } from "./helpers";
import { E2E_STUDENT_EMAIL, E2E_TECH_SOCIETY_ID } from "./globalSetup";
import { TEST_PASSWORD } from "../tests/helpers/testDb";

test("Track A: proctored assessment flags a tab switch and submits a real score", async ({
  page,
}) => {
  await loginAs(page, E2E_STUDENT_EMAIL, TEST_PASSWORD);
  await dismissQuizIfPresent(page);

  // Each full navigation remounts the student layout, which re-shows the
  // quiz again as long as personaResult is still null -- dismiss it fresh
  // after this goto too, not just after login.
  await page.goto(`/student/societies/${E2E_TECH_SOCIETY_ID}`);
  await dismissQuizIfPresent(page);
  await page.getByRole("link", { name: /Take Proctored Assessment/ }).click();

  await expect(page.getByText("Proctored Assessment", { exact: true })).toBeVisible();
  await expect(page.getByText("0 of 8 answered")).toBeVisible({ timeout: 15000 });

  // Answer every question (pick the first option each time).
  for (let i = 1; i <= 8; i++) {
    const questionText = page.locator("p", { hasText: new RegExp(`^${i}\\.`) });
    const card = questionText.locator("xpath=..");
    await card.getByRole("button").first().click();
  }
  await expect(page.getByText("8 of 8 answered")).toBeVisible();

  // Real OS-level tab switches can't be simulated in a test runner -- this is
  // the same technique used to verify the anti-cheat listeners manually.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { value: true, configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.getByText(/Tab switch detected/)).toBeVisible();
  await expect(page.getByText(/1 switches/)).toBeVisible();

  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await page.waitForTimeout(1100);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByText(/[1-9]\d*s away/)).toBeVisible();

  await page.getByRole("button", { name: "Submit Assessment" }).click();

  await expect(page).toHaveURL(new RegExp(`/student/societies/${E2E_TECH_SOCIETY_ID}$`));
  await expect(page.getByText("Assessed")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/^\d+\/100$/)).toBeVisible();
});
