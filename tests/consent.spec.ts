import { expect, test } from "@playwright/test";
import { answerSurvey, chooseConsent, trackedEvents } from "./helpers";

test("declining consent sends no analytics at all", async ({ page }) => {
  const beacons: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/events") || r.url().includes("googletagmanager")) beacons.push(r.url());
  });

  await page.goto("/maison-lumiere");
  await chooseConsent(page, "Decline");
  await page.getByRole("button", { name: "Begin the ritual" }).click();
  await answerSurvey(page, ["In a rooftop garden at dusk", "Silk", "Paris in spring", "Golden afternoon", "A hand-tied bouquet"]);
  await expect(page.getByTestId("result-name")).toHaveText("Rose Nocturne");

  expect(await trackedEvents(page)).toEqual([]);
  expect(beacons).toEqual([]);
  await expect(page.locator("#ga-script")).toHaveCount(0);
});

test("nothing is tracked before the visitor chooses", async ({ page }) => {
  await page.goto("/maison-lumiere");
  await page.getByRole("button", { name: "Begin the ritual" }).click();
  await expect(page.getByRole("progressbar")).toBeVisible();
  expect(await trackedEvents(page)).toEqual([]);
});

test("the choice is remembered across pages", async ({ page }) => {
  await page.goto("/");
  await chooseConsent(page, "Accept");
  await page.goto("/maison-lumiere");
  await expect(page.getByRole("dialog", { name: "Cookie consent" })).toHaveCount(0);
  await page.getByRole("button", { name: "Begin the ritual" }).click();
  await expect(page.getByRole("progressbar")).toBeVisible();
  expect(await trackedEvents(page)).toContain("survey_start");
});
