import { expect, test } from "@playwright/test";
import { chooseConsent } from "./helpers";

test("the index links to every demo", async ({ page }) => {
  await page.goto("/");
  await chooseConsent(page, "Decline");
  await expect(page.getByRole("heading", { level: 1, name: "Irvan Fahlepi" })).toBeAttached();

  for (const [title, path] of [
    ["Shade Match", "/loreal-shade-match"],
    ["Maison Lumière", "/maison-lumiere"],
    ["Atelier Nº 7", "/atelier"],
    ["The Lab", "/lab"],
  ]) {
    await expect(page.locator(`a.hub-row[href="${path}"]`)).toContainText(title);
  }
});

test("the reel can be paused and its timecode stops", async ({ page }) => {
  await page.goto("/");
  await chooseConsent(page, "Decline");
  const tc = page.locator(".reel-tc");
  await expect(tc).not.toHaveText("00:00:00:00");

  await page.getByRole("button", { name: "Pause reel" }).click();
  const frozen = await tc.textContent();
  await page.waitForTimeout(600);
  await expect(tc).toHaveText(frozen!);
  await expect(page.getByRole("button", { name: "Play reel" })).toBeVisible();
});

test("the reel's segments jump between scenes", async ({ page }) => {
  await page.goto("/");
  await chooseConsent(page, "Decline");
  await page.getByRole("button", { name: "Jump to Ask" }).click();
  await expect(page.locator('[data-scene="ask"]')).toBeVisible();
});
