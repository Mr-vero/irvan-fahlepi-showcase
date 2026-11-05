import { expect, test } from "@playwright/test";
import { answerSurvey, chooseConsent, trackedEvents } from "./helpers";

test("answers lead to the matching fragrance and a live distribution", async ({ page }) => {
  await page.goto("/maison-lumiere");
  await chooseConsent(page, "Accept");
  await page.getByRole("button", { name: "Begin the ritual" }).click();

  await answerSurvey(page, [
    "Beside a fire in a quiet library",
    "Polished oak",
    "Kyoto in autumn",
    "Past midnight",
    "A leather-bound journal",
  ]);

  await expect(page.getByTestId("result-name")).toHaveText("Cèdre Silencieux");
  await expect(page.getByText("Atlas cedar · Vetiver")).toBeVisible();
  await expect(page.getByTestId("distribution").locator(".dist-row.is-you")).toContainText("Woody");

  const events = await trackedEvents(page);
  expect(events).toContain("survey_start");
  expect(events.filter((e) => e === "survey_answer")).toHaveLength(5);
  expect(events).toContain("survey_complete");
});

test("a tie goes to the family chosen most recently", async ({ page }) => {
  await page.goto("/maison-lumiere");
  await chooseConsent(page, "Decline");
  await page.getByRole("button", { name: "Begin the ritual" }).click();

  // Two floral, two amber, one citrus: amber was the later of the tied picks.
  await answerSurvey(page, ["In a rooftop garden at dusk", "Velvet", "Paris in spring", "Past midnight", "A weekend by the sea"]);
  await expect(page.getByTestId("result-name")).toHaveText("Ambre Minuit");
});

test("share produces a PNG card", async ({ page, browserName }) => {
  test.skip(browserName === "webkit", "WebKit can't save canvas blobs as downloads headlessly");
  await page.goto("/maison-lumiere");
  await chooseConsent(page, "Decline");
  await page.getByRole("button", { name: "Begin the ritual" }).click();
  await answerSurvey(page, ["On a terrace above the sea", "Cool linen", "Amalfi in July", "First light", "A weekend by the sea"]);
  await expect(page.getByTestId("result-name")).toHaveText("Lumière d'Été");

  // Force the download path; native share sheets can't be driven headlessly.
  await page.evaluate(() => {
    (navigator as Navigator & { canShare?: unknown }).canShare = () => false;
  });
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Share my scent" }).click();
  expect((await download).suggestedFilename()).toBe("maison-lumiere-citrus.png");
});
