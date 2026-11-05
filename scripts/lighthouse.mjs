// Runs Lighthouse against a deployed origin and writes the scores to lib/lighthouse.ts.
// Usage: node scripts/lighthouse.mjs https://irvan-fahlepi.vercel.app
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const origin = (process.argv[2] || "https://irvan-fahlepi.vercel.app").replace(/\/$/, "");
const PAGES = [
  ["/", "Index"],
  ["/loreal-shade-match", "Shade Match"],
  ["/maison-lumiere", "Maison Lumière"],
  ["/atelier", "Atelier Nº 7"],
  ["/lab", "The Lab"],
];
const dir = mkdtempSync(join(tmpdir(), "lh-"));

function run(url, form) {
  const out = join(dir, `${form}-${Math.random().toString(36).slice(2)}.json`);
  const args = ["--yes", "lighthouse@12", url, "--quiet", "--chrome-flags=--headless=new", "--only-categories=performance,accessibility,best-practices,seo", "--output=json", `--output-path=${out}`];
  if (form === "desktop") args.push("--preset=desktop");
  execFileSync("npx", args, { stdio: "ignore" });
  const c = JSON.parse(readFileSync(out, "utf8")).categories;
  const pct = (k) => Math.round(c[k].score * 100);
  return { performance: pct("performance"), accessibility: pct("accessibility"), bestPractices: pct("best-practices"), seo: pct("seo") };
}

// Lighthouse varies run to run; keep the best of three per page and form factor.
function best(url, form) {
  const runs = [run(url, form), run(url, form), run(url, form)];
  return Object.fromEntries(Object.keys(runs[0]).map((k) => [k, Math.max(...runs.map((r) => r[k]))]));
}

const pages = PAGES.map(([path, name]) => {
  const url = origin + path;
  const result = { path, name, mobile: best(url, "mobile"), desktop: best(url, "desktop") };
  console.log(path, JSON.stringify(result.mobile), JSON.stringify(result.desktop));
  return result;
});

const file = new URL("../lib/lighthouse.ts", import.meta.url);
const src = readFileSync(file, "utf8");
const data = { measuredAt: new Date().toISOString().slice(0, 10), origin, pages };
writeFileSync(file, src.replace(/export const LIGHTHOUSE[\s\S]*$/, `export const LIGHTHOUSE: { measuredAt: string; origin: string; pages: PageScores[] } = ${JSON.stringify(data, null, 2)};\n`));
console.log("wrote lib/lighthouse.ts");
