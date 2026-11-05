import { expect, type Page } from "@playwright/test";

export async function chooseConsent(page: Page, choice: "Accept" | "Decline") {
  const dialog = page.getByRole("dialog", { name: "Cookie consent" });
  await dialog.getByRole("button", { name: choice }).click();
  await expect(dialog).toBeHidden();
}

/** Returns the names of analytics events pushed to the dataLayer so far. */
export async function trackedEvents(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    (window.dataLayer ?? [])
      .map((entry) => Array.from(entry as ArrayLike<unknown>))
      .filter((args) => args[0] === "event")
      .map((args) => String(args[1])),
  );
}

export async function answerSurvey(page: Page, optionLabels: string[]) {
  for (const [i, label] of optionLabels.entries()) {
    await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", String(i + 1));
    await page.getByRole("button", { name: label }).click();
  }
}

type Shade = { l: number; c: number; h: number };
export type Round = { target: Shade; options: Shade[] };

/** Index of the option that matches the target, the way a player with a perfect eye would pick. */
export function matchIndex(r: Round): number {
  return r.options.findIndex((o) => o.l === r.target.l && o.c === r.target.c && o.h === r.target.h);
}
