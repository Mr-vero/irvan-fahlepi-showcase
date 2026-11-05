import { expect, test } from "@playwright/test";
import { chooseConsent, matchIndex, trackedEvents, type Round } from "./helpers";

test("a full game reaches the leaderboard", async ({ page }, testInfo) => {
  const name = `QA ${testInfo.project.name.slice(0, 10)}`.slice(0, 16);
  await page.goto("/loreal-shade-match");
  await chooseConsent(page, "Accept");
  await expect(page.getByText("Unofficial concept · L’Oréal Paris")).toBeVisible();

  const dealt = page.waitForResponse("**/api/shade/start");
  await page.getByRole("button", { name: "Start" }).click();
  const { rounds } = (await (await dealt).json()) as { rounds: Round[] };

  // Play five perfect rounds with real taps, then let the clock run out.
  for (let i = 0; i < 5; i++) {
    await expect(page.getByText(`Round ${i + 1}`)).toBeVisible();
    await page.getByRole("button", { name: `Shade option ${matchIndex(rounds[i]) + 1}` }).click();
  }
  await expect(page.getByTestId("final-score")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Shades matched")).toBeVisible();

  await page.getByLabel("Name for the leaderboard").fill(name);
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByTestId("leaderboard").locator("li.is-you")).toContainText(name);

  expect(await trackedEvents(page)).toEqual(expect.arrayContaining(["game_start", "game_complete", "leaderboard_submit"]));
});

test("a wrong pick breaks the streak and freezes the board", async ({ page }) => {
  await page.goto("/loreal-shade-match");
  await chooseConsent(page, "Decline");
  const dealt = page.waitForResponse("**/api/shade/start");
  await page.getByRole("button", { name: "Start" }).click();
  const { rounds } = (await (await dealt).json()) as { rounds: Round[] };

  await page.getByRole("button", { name: `Shade option ${matchIndex(rounds[0]) + 1}` }).click();
  await expect(page.getByText("Round 2")).toBeVisible();

  const wrong = rounds[1].options.findIndex((_, i) => i !== matchIndex(rounds[1]));
  await page.getByRole("button", { name: `Shade option ${wrong + 1}` }).click();
  await expect(page.locator(".sm-grid")).toHaveClass(/is-frozen/);
  await expect(page.getByText("Round 2")).toBeVisible();
  await expect(page.locator(".sm-hud-right .sm-hud-value")).toHaveText("×1.0");
});

test("names are validated before they reach the board", async ({ page }) => {
  await page.goto("/loreal-shade-match");
  await chooseConsent(page, "Decline");
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByTestId("final-score")).toBeVisible({ timeout: 10_000 });

  await page.getByLabel("Name for the leaderboard").fill("<script>");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.locator(".sm-form").getByRole("alert")).toHaveText("Use 2–16 letters, numbers or spaces.");
});
