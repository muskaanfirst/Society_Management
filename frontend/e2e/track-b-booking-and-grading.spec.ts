import { test, expect } from "@playwright/test";
import { loginAs, dismissQuizIfPresent, switchAccount } from "./helpers";
import { E2E_STUDENT_EMAIL, E2E_NONTECH_SOCIETY_ID } from "./globalSetup";
import { TEST_PASSWORD } from "../tests/helpers/testDb";

const NONTECH_MANAGER_EMAIL = "devansh.sethi@thapar.edu";
const DEMO_PASSWORD = "DemoPass#2026"; // documented, non-secret shared seed password

test("Track B: student books an interview, manager's grade persists after reload", async ({
  page,
}) => {
  // --- Student: book the interview for the already-Shortlisted fixture application ---
  await loginAs(page, E2E_STUDENT_EMAIL, TEST_PASSWORD);
  await dismissQuizIfPresent(page);

  // Each full navigation remounts the student layout, which re-shows the
  // quiz again as long as personaResult is still null -- dismiss it fresh
  // after this goto too, not just after login.
  await page.goto(`/student/societies/${E2E_NONTECH_SOCIETY_ID}`);
  await dismissQuizIfPresent(page);
  await expect(page.getByText("Shortlisted", { exact: true })).toBeVisible({ timeout: 15000 });

  await page.getByRole("button", { name: "Book In-Person Interview" }).click();
  await expect(page.getByText("Pick an available slot below.")).toBeVisible();
  // Target by the synthetic venue marker, not the time, to avoid any
  // ambiguity with a real seeded slot that happens to share a time.
  await page.getByRole("button", { name: /TEST-SLOT-E2E-1/ }).click();
  await page.getByRole("button", { name: "Confirm Booking" }).click();

  await expect(page.getByText("Interview booked", { exact: true })).toBeVisible({ timeout: 15000 });

  // --- Manager: grade the (synthetic) application and confirm it persists after a reload ---
  await switchAccount(page);
  await loginAs(page, NONTECH_MANAGER_EMAIL, DEMO_PASSWORD);
  await page.goto("/manager/grading");
  await page.getByRole("button", { name: "Non-Tech View" }).click();

  const testRow = page.locator("tr", { hasText: "Test Student" });
  await expect(testRow).toBeVisible({ timeout: 15000 });
  await testRow.getByLabel("GREEN").click();

  await page.reload();
  await page.getByRole("button", { name: "Non-Tech View" }).click();
  const reloadedRow = page.locator("tr", { hasText: "Test Student" });
  await expect(reloadedRow.getByLabel("GREEN")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
});
