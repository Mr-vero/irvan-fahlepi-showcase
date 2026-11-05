/**
 * Lighthouse 12 results for the production site, written by scripts/lighthouse.mjs. Mobile runs use
 * Lighthouse's default simulated mid-range phone on slow 4G; desktop uses its desktop preset.
 */
export type Scores = { performance: number; accessibility: number; bestPractices: number; seo: number };
export type PageScores = { path: string; name: string; mobile: Scores; desktop: Scores };

export const LIGHTHOUSE: { measuredAt: string; origin: string; pages: PageScores[] } = {
  "measuredAt": "2026-11-05",
  "origin": "https://irvan-fahlepi.vercel.app",
  "pages": [
    {
      "path": "/",
      "name": "Index",
      "mobile": {
        "performance": 99,
        "accessibility": 100,
        "bestPractices": 100,
        "seo": 100
      },
      "desktop": {
        "performance": 100,
        "accessibility": 100,
        "bestPractices": 100,
        "seo": 100
      }
    },
    {
      "path": "/loreal-shade-match",
      "name": "Shade Match",
      "mobile": {
        "performance": 99,
        "accessibility": 100,
        "bestPractices": 100,
        "seo": 100
      },
      "desktop": {
        "performance": 100,
        "accessibility": 100,
        "bestPractices": 100,
        "seo": 100
      }
    },
    {
      "path": "/maison-lumiere",
      "name": "Maison Lumière",
      "mobile": {
        "performance": 100,
        "accessibility": 100,
        "bestPractices": 100,
        "seo": 100
      },
      "desktop": {
        "performance": 100,
        "accessibility": 100,
        "bestPractices": 100,
        "seo": 100
      }
    },
    {
      "path": "/atelier",
      "name": "Atelier Nº 7",
      "mobile": {
        "performance": 100,
        "accessibility": 100,
        "bestPractices": 100,
        "seo": 100
      },
      "desktop": {
        "performance": 100,
        "accessibility": 100,
        "bestPractices": 100,
        "seo": 100
      }
    },
    {
      "path": "/lab",
      "name": "The Lab",
      "mobile": {
        "performance": 100,
        "accessibility": 100,
        "bestPractices": 100,
        "seo": 100
      },
      "desktop": {
        "performance": 100,
        "accessibility": 100,
        "bestPractices": 100,
        "seo": 100
      }
    }
  ]
};
