import { LIGHTHOUSE, type Scores } from "@/lib/lighthouse";

const CATEGORIES: [keyof Scores, string][] = [
  ["performance", "Performance"],
  ["accessibility", "Accessibility"],
  ["bestPractices", "Best practices"],
  ["seo", "SEO"],
];

/** A Lighthouse-style gauge: the ring fills to the score, green from 90. */
function Gauge({ value, label }: { value: number; label: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const tone = value >= 90 ? "pass" : value >= 50 ? "average" : "fail";
  return (
    <div className={`lh-gauge lh-${tone}`} title={`${label}: ${value}`}>
      <svg viewBox="0 0 64 64" aria-hidden>
        <circle cx="32" cy="32" r={r} className="lh-track" />
        <circle cx="32" cy="32" r={r} className="lh-fill" strokeDasharray={`${(value / 100) * c} ${c}`} />
      </svg>
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

export default function Lighthouse() {
  if (!LIGHTHOUSE.pages.length) return null;
  return (
    <section className="lab-section" aria-labelledby="lighthouse">
      <div className="lab-head">
        <h2 id="lighthouse">Lighthouse</h2>
        <p>
          Every page, measured on the production site on {LIGHTHOUSE.measuredAt} with Lighthouse 12 (best of three runs each). Mobile is Lighthouse’s
          simulated mid-range phone on slow 4G, the harshest of its settings.
        </p>
      </div>
      <div className="lh-table">
        {LIGHTHOUSE.pages.map((p) => (
          <div key={p.path} className="lh-row">
            <p className="lh-page">
              <b>{p.name}</b>
              <span>{p.path}</span>
            </p>
            {(["desktop", "mobile"] as const).map((form) => (
              <div key={form} className="lh-form">
                <span className="lh-form-label">{form === "desktop" ? "Desktop" : "Mobile"}</span>
                <div className="lh-gauges">
                  {CATEGORIES.map(([k, label]) => (
                    <Gauge key={k} value={p[form][k]} label={label} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
