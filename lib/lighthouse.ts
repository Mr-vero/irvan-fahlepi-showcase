/**
 * Lighthouse 12 results for the production site, written by scripts/lighthouse.mjs. Mobile runs use
 * Lighthouse's default simulated mid-range phone on slow 4G; desktop uses its desktop preset.
 */
export type Scores = { performance: number; accessibility: number; bestPractices: number; seo: number };
export type PageScores = { path: string; name: string; mobile: Scores; desktop: Scores };

export const LIGHTHOUSE: { measuredAt: string; origin: string; pages: PageScores[] } = {
  measuredAt: "",
  origin: "https://irvan-fahlepi.vercel.app",
  pages: [],
};
