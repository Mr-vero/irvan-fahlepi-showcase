import { expect, test } from "@playwright/test";
import { chooseConsent } from "./helpers";

test("the index links to every demo", async ({ page }) => {
  await page.goto("/");
  await chooseConsent(page, "Decline");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Games, quizzes");

  for (const [title, path] of [
    ["Shade Match", "/loreal-shade-match"],
    ["Maison Lumière", "/maison-lumiere"],
    ["Atelier Nº 7", "/atelier"],
    ["The Lab", "/lab"],
  ]) {
    const world = page.locator(".world", { has: page.locator(`a[href="${path}"]`) });
    await expect(world.getByRole("heading", { level: 2 })).toHaveText(title);
  }
});

test("the reel plays when on screen and can be paused", async ({ page }) => {
  await page.goto("/");
  await chooseConsent(page, "Decline");
  await page.locator(".reel").scrollIntoViewIfNeeded();
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
  await page.locator(".reel").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Jump to Ask" }).click();
  await expect(page.locator('[data-scene="ask"]')).toBeVisible();
});
