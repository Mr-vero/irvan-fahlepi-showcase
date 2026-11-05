import { expect, test } from "@playwright/test";
import { chooseConsent, trackedEvents } from "./helpers";

test("the scroll story renders end to end and reports completion", async ({ page }) => {
  await page.goto("/atelier");
  await chooseConsent(page, "Accept");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Atelier");
  await expect(page.locator(".at-card")).toHaveCount(7);

  await page.evaluate(() => window.scrollTo(0, window.innerHeight));
  await page.locator("#at-end").scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: /Made to be/ })).toBeVisible();
  await expect.poll(() => trackedEvents(page)).toEqual(expect.arrayContaining(["story_start", "story_complete"]));
});

test("the lab shows live numbers and the QA matrix", async ({ page }) => {
  await page.goto("/lab");
  await chooseConsent(page, "Decline");
  await expect(page.getByRole("heading", { name: "Live analytics" })).toBeVisible();
  // KPIs switch from the placeholder dash to numbers once /api/stats answers.
  await expect(page.locator(".lab-kpi-value").first()).not.toHaveText("—");
  await expect(page.getByRole("table")).toContainText("Shade Match");
});
