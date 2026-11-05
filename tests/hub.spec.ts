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
  await page.getByRole("button", { name: "Jump to Build" }).click();
  await expect(page.locator('.rf-cap[data-cap="build"]')).toBeVisible();
  await expect(page.locator(".rf-claude")).toBeAttached();
});

test("the live-work tour walks through all eight projects and links out to each", async ({ page }) => {
  await page.goto("/");
  await chooseConsent(page, "Decline");
  await expect(page.locator(".tour-links a")).toHaveCount(8);
  for (const href of ["https://getpingplay.com", "https://mr-vero.github.io/the-last-ember/", "https://jakjapanmatsuri.vercel.app"]) {
    await expect(page.locator(`.tour-links a[href="${href}"]`)).toHaveAttribute("target", "_blank");
  }

  // Scroll into the laptop half: the lid has opened and a desktop project is on screen with its caption.
  const tour = page.locator(".tour");
  await page.evaluate(() => {
    const el = document.querySelector<HTMLElement>(".tour")!;
    const travel = el.offsetHeight - 2 * innerHeight;
    scrollTo(0, el.getBoundingClientRect().top + scrollY + travel * 0.775);
  });
  await expect(tour).toHaveAttribute("data-phase", "laptop");
  await expect(tour).toHaveAttribute("data-step", "5");
  await expect(page.locator(`.tour-cap[data-i="5"] .tour-name`)).toBeVisible();
});

test("a Forge-made game loads and runs inside the page", async ({ page }) => {
  await page.goto("/");
  await chooseConsent(page, "Decline");
  await page.getByRole("button", { name: /Tap to play Glow Haul Seoul/ }).click();
  const frame = page.locator(".arcade-phone iframe");
  await expect(frame).toHaveAttribute("src", /glow-haul-seoul/);
  await expect(page.getByRole("link", { name: /Join the Forge waitlist/ })).toHaveAttribute("href", "https://getpingplay.com/creators#forge-waitlist");
});
