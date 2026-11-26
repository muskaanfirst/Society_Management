import { expect, type Page } from "@playwright/test";

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByPlaceholder("yourname@thapar.edu").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).not.toHaveURL(/\/login$/);
}

// The onboarding quiz auto-opens for any student with no persona result yet
// (a fresh e2e browser context never has one in localStorage), which would
// otherwise cover the page under test. Waits briefly since it mounts just
// after the page's own navigation settles, not instantly.
export async function dismissQuizIfPresent(page: Page) {
  const heading = page.getByRole("heading", { name: "Onboarding Quiz" });
  try {
    await heading.waitFor({ state: "visible", timeout: 3000 });
  } catch {
    return; // never appeared -- nothing to dismiss
  }
  await heading.locator("xpath=..").getByRole("button").first().click();
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
}

// Switches the logged-in account without relying on the TopBar's logout
// button, which only exists on top-level tab pages (not nested detail pages
// like a society's own page) -- clearing storage directly works from anywhere.
export async function switchAccount(page: Page) {
  await page.evaluate(() => localStorage.clear());
  await page.goto("/login");
}
