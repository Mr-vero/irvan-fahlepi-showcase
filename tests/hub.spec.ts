import { expect, test } from "@playwright/test";
import { chooseConsent } from "./helpers";

test("the index links to every demo", async ({ page }) => {
  await page.goto("/");
  await chooseConsent(page, "Decline");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Games, quizzes");

  const spotlight = page.locator(".spot");
  await expect(spotlight.getByRole("heading", { level: 2 })).toHaveText("Shade Match");
  await expect(spotlight.locator('a[href="/loreal-shade-match"]')).toBeAttached();

  for (const [title, path] of [
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

test("the live-work gallery links out to every shipped project", async ({ page }) => {
  await page.goto("/");
  await chooseConsent(page, "Decline");
  const cards = page.locator("a.live-card");
  await expect(cards).toHaveCount(9);
  for (const href of ["https://getpingplay.com", "https://mr-vero.github.io/the-last-ember/", "https://jakjapanmatsuri.vercel.app"]) {
    await expect(page.locator(`a.live-card[href="${href}"]`)).toHaveAttribute("target", "_blank");
  }
});

test("a Forge-made game loads and runs inside the page", async ({ page }) => {
  await page.goto("/");
  await chooseConsent(page, "Decline");
  await page.getByRole("button", { name: /Tap to play Glow Haul Seoul/ }).click();
  const frame = page.locator(".arcade-phone iframe");
  await expect(frame).toHaveAttribute("src", /glow-haul-seoul/);
  await expect(page.getByRole("link", { name: /Join the Forge waitlist/ })).toHaveAttribute("href", "https://getpingplay.com/creators#forge-waitlist");
});
