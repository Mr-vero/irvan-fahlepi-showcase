"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";
import Photo from "@/components/Photo";
import type { PhotoKey } from "@/lib/photos";
import { SITE } from "@/lib/site";
import "./reel.css";

/**
 * "Concept to live", a process film built in code. Every scene sits on one large board and a camera
 * travels between them: brief → blueprint → design → build → QA → ship → measure, then pulls back to
 * show the whole board. The stage is laid out at a fixed 1600 × 900 and scaled to fit, like a video,
 * so it frames the same on every screen.
 */

const W = 1600;
const H = 900;
const GAP = 100;
const PANELS = {
  brief: [0, 0],
  design: [W + GAP, 0],
  build: [2 * (W + GAP), 0],
  qa: [2 * (W + GAP), H + GAP],
  ship: [W + GAP, H + GAP],
  measure: [0, H + GAP],
} as const;
const BOARD = { w: 3 * W + 2 * GAP, h: 2 * H + GAP };

const SCENES = [
  { id: "title", label: "Title", n: "", head: "", line: "" },
  { id: "brief", label: "Brief", n: "01", head: "Brief", line: "Read the brief for what the client actually needs." },
  { id: "blueprint", label: "Blueprint", n: "02", head: "Blueprint", line: "Every screen planned before a pixel is drawn." },
  { id: "design", label: "Design", n: "03", head: "Design", line: "Brand assets gathered, then built into the experience." },
  { id: "build", label: "Build", n: "04", head: "Build with AI", line: "I write it; Claude Code pairs on it, with tests." },
  { id: "qa", label: "QA", n: "05", head: "QA on real devices", line: "Desktop, Android and iOS, on every push." },
  { id: "ship", label: "Ship", n: "06", head: "Ship", line: "Preview for the client, production on merge." },
  { id: "measure", label: "Measure", n: "07", head: "Measure", line: "The funnel is agreed before launch, not after." },
  { id: "live", label: "Live", n: "", head: "", line: "" },
] as const;

const OPTIONS: { photo: PhotoKey; label: string }[] = [
  { photo: "peony", label: "A rooftop garden" },
  { photo: "hideWarm", label: "A quiet library" },
  { photo: "orangeSlice", label: "A terrace by the sea" },
  { photo: "goldenBottles", label: "A candlelit bar" },
];

const CODE: [string, string][] = [
  ["k", "export default function"],
  ["f", " Result({ family, picks }: Props) {"],
  ["", "  const f = FRAGRANCES[family];"],
  ["", "  const [dist, setDist] = useState<Distribution | null>(null);"],
  ["", ""],
  ["", "  useEffect(() => {"],
  ["s", '    fetch("/api/entries", { method: "POST", body: json(family) })'],
  ["", "      .then((r) => r.json()).then(setDist);"],
  ["", "  }, [family]);"],
  ["", ""],
  ["k", "  const onShare = async () => {"],
  ["", '    track("share_click", { family });'],
  ["", "    const card = await renderShareCard(f);"],
  ["", "    await share(card, `My signature: ${f.name}`);"],
  ["", "  };"],
];

const CLAUDE = [
  ["you", "> Add a share card to the result: 1080×1350, with the notes pyramid"],
  ["dim", "● Reading Result.tsx, lib/data.ts"],
  ["dim", "● Writing lib/shareCard.ts"],
  ["ok", "✓ Canvas card renders at 1080×1350"],
  ["ok", "✓ Added Playwright test: share produces a PNG"],
  ["ok", "✓ 3 files changed · typecheck clean"],
] as const;

const TESTS = ["Survey flow", "Consent", "Share card", "Shade Match", "Scroll story", "API & anti-cheat"];

function timecode(t: number) {
  const frames = Math.floor((t % 1) * 24);
  const s = Math.floor(t);
  return `00:00:${String(s).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
}

export default function Reel() {
  const root = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [paused, setPaused] = useState(false);

  // The film pins for a screen and a half: it grows to fill the view as it arrives, holds while it plays,
  // and the "keep scrolling" cue only appears once it has held for a moment.
  useScrollProgress(section, (p) => {
    const el = section.current!;
    el.style.setProperty("--rp", p.toFixed(4));
    el.dataset.cue = p > 0.35 ? "on" : "off";
  });

  // Scale the fixed 1600 × 900 stage to the frame.
  useEffect(() => {
    const el = root.current!;
    const ro = new ResizeObserver(() => el.style.setProperty("--k", String(el.clientWidth / W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = root.current!;
    let ctx: gsap.Context | undefined;
    let io: IntersectionObserver | undefined;
    let cancelled = false;
    // GSAP is only needed here, so it loads with the reel instead of holding up the first paint.
    import("gsap").then(({ gsap }) => {
    if (cancelled) return;
    const q = gsap.utils.selector(el);
    ctx = gsap.context(() => {
      const world = q(".rf-world")[0];
      const cam = (p: readonly [number, number]) => ({ x: -p[0], y: -p[1], scale: 1 });
      const move = (to: readonly [number, number], at: string) =>
        t
          .to(world, { scale: 0.86, duration: 0.55, ease: "power2.in" }, at)
          .to(world, { ...cam(to), duration: 1.15, ease: "expo.inOut" }, `${at}+=0.1`);

      gsap.set(world, { ...cam(PANELS.brief), transformOrigin: "0 0" });
      gsap.set(q(".rf-cap"), { autoAlpha: 0 });

      const t = gsap.timeline({ repeat: -1, defaults: { ease: "power3.out" } });
      // Each scene's caption is in from just after its label until the next scene starts.
      const CAP_TIMES: Record<string, [number, number]> = {
        brief: [2.9, 6.2], blueprint: [6.5, 9.6], design: [9.9, 13.4], build: [13.7, 19.2],
        qa: [19.5, 23.2], ship: [23.5, 27.2], measure: [27.5, 31],
      };
      const caption = (id: string) => {
        const range = CAP_TIMES[id];
        if (!range) return;
        const c = q(`.rf-cap[data-cap="${id}"]`);
        t.fromTo(c, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6 }, range[0]).to(c, { autoAlpha: 0, y: -8, duration: 0.3 }, range[1] - 0.3);
      };

      // Title card
      t.addLabel("title", 0)
        .set(q(".rf-title"), { autoAlpha: 1 })
        .fromTo(q(".rf-title-pre"), { opacity: 0, letterSpacing: "0.9em" }, { opacity: 1, letterSpacing: "0.5em", duration: 1.4 }, 0.2)
        .fromTo(q(".rf-title-main"), { opacity: 0, y: 24, filter: "blur(12px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2 }, 0.5)
        .to(q(".rf-title"), { autoAlpha: 0, duration: 0.7, ease: "power1.inOut" }, 2.4);

      // 01 Brief
      t.addLabel("brief", 2.6);
      caption("brief");
      t.from(q(".rf-brief"), { y: 60, rotate: -2, opacity: 0, duration: 1 }, "brief")
        .fromTo(q(".rf-brief-line"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.55, stagger: 0.32, ease: "steps(24)" }, "brief+=0.5")
        .fromTo(q(".rf-mark"), { scaleX: 0 }, { scaleX: 1, duration: 0.35, stagger: 0.18, ease: "power2.out" }, "brief+=2.4")
        .from(q(".rf-note"), { scale: 0, rotate: 30, duration: 0.6, ease: "back.out(2)" }, "brief+=2.9");

      // 02 Blueprint
      t.addLabel("blueprint", 6.2);
      move(PANELS.design, "blueprint");
      caption("blueprint");
      t.fromTo(q(".rf-wire"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, stagger: 0.05, ease: "power2.inOut" }, "blueprint+=1.1")
        .from(q(".rf-anno"), { opacity: 0, x: -14, duration: 0.5, stagger: 0.18 }, "blueprint+=2.1");

      // 03 Design: assets fly in, gather, then snap into the wireframe as it becomes the real thing
      t.addLabel("design", 9.6);
      caption("design");
      q(".rf-asset").forEach((a, i) => {
        const d = a as HTMLElement;
        const gx = Number(d.dataset.gx), gy = Number(d.dataset.gy), r = Number(d.dataset.r);
        t.fromTo(d, { x: gx * 2.4, y: gy * 2.4, rotate: r * 3, scale: 0.6, opacity: 0 }, { x: gx, y: gy, rotate: r, scale: 0.9, opacity: 1, duration: 0.9, ease: "power3.out" }, `design+=${i * 0.07}`)
          .to(d, { x: 0, y: 0, rotate: 0, scale: 1, duration: 0.8, ease: "expo.inOut" }, `design+=${1.3 + i * 0.05}`);
      });
      t.to(q(".rf-bp"), { opacity: 0, duration: 0.8, ease: "power1.inOut" }, "design+=1.9")
        .fromTo(q(".rf-designed"), { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power1.inOut" }, "design+=1.8")
        .to(q(".rf-chip, .rf-type"), { opacity: 0, scale: 0.6, duration: 0.5 }, "design+=2.2");

      // 04 Build with AI
      t.addLabel("build", 13.4);
      move(PANELS.build, "build");
      caption("build");
      t.fromTo(q(".rf-code-line"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.22, stagger: 0.17, ease: "steps(18)" }, "build+=1.1")
        .from(q(".rf-claude-line"), { opacity: 0, y: 8, duration: 0.35, stagger: 0.5 }, "build+=1.4");

      // 05 QA
      t.addLabel("qa", 19.2);
      move(PANELS.qa, "qa");
      caption("qa");
      q(".rf-cell").forEach((c, i) => {
        t.set(c, { attr: { "data-pass": "1" } }, `qa+=${1.2 + i * 0.065}`);
      });
      t.fromTo(q(".rf-passed"), { textContent: 0 }, { textContent: 47, snap: { textContent: 1 }, duration: 1.3, ease: "power1.inOut" }, "qa+=1.2")
        .from(q(".rf-qa-sum"), { opacity: 0, y: 10, duration: 0.5 }, "qa+=2.6");

      // 06 Ship
      t.addLabel("ship", 23.2);
      move(PANELS.ship, "ship");
      caption("ship");
      t.fromTo(q(".rf-push"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.6, ease: "steps(20)" }, "ship+=1.1")
        .from(q(".rf-node"), { scale: 0, duration: 0.4, stagger: 0.32, ease: "back.out(2)" }, "ship+=1.6")
        .from(q(".rf-link"), { scaleX: 0, duration: 0.3, stagger: 0.32 }, "ship+=1.8")
        .from(q(".rf-browser"), { y: 50, opacity: 0, duration: 0.9 }, "ship+=2.8")
        .from(q(".rf-live"), { scale: 0, duration: 0.5, ease: "back.out(3)" }, "ship+=3.3");

      // 07 Measure (demo data)
      t.addLabel("measure", 27.2);
      move(PANELS.measure, "measure");
      caption("measure");
      q(".rf-kpi b").forEach((b, i) => {
        const v = Number((b as HTMLElement).dataset.v);
        const n = { v: 0 };
        t.fromTo(
          n,
          { v: 0 },
          { v, duration: 1.4, ease: "power2.out", onUpdate: () => void (b.textContent = Math.round(n.v).toLocaleString("en")) },
          `measure+=${1.1 + i * 0.1}`,
        );
      });
      t.from(q(".rf-bar i"), { scaleX: 0, duration: 1, stagger: 0.12 }, "measure+=1.3")
        .fromTo(q(".rf-line"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, "measure+=1.3");

      // Live: pull back to the whole board
      t.addLabel("live", 31);
      const fit = Math.min(W / BOARD.w, H / BOARD.h) * 0.92;
      t.to(world, { x: (W - BOARD.w * fit) / 2, y: (H - BOARD.h * fit) / 2, scale: fit, duration: 1.8, ease: "expo.inOut" }, "live")
        .fromTo(q(".rf-end"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, "live+=1.5")
        .from(q(".rf-end > *"), { y: 24, opacity: 0, duration: 0.9, stagger: 0.15 }, "live+=1.7")
        .to(q(".rf-end"), { autoAlpha: 0, duration: 0.6 }, "live+=5")
        .to(world, { opacity: 0, duration: 0.6 }, "live+=5")
        .addLabel("loop", "live+=5.7")
        .set(world, { opacity: 1, ...cam(PANELS.brief) }, "loop");

      const starts = SCENES.map((s) => t.labels[s.id]);
      const ends = [...starts.slice(1), t.labels.loop];
      const fills = q(".reel-seg-fill");
      const tc = q(".reel-tc")[0];
      t.eventCallback("onUpdate", () => {
        const now = t.time();
        tc.textContent = timecode(now);
        fills.forEach((f, i) => {
          const p = gsap.utils.clamp(0, 1, (now - starts[i]) / (ends[i] - starts[i]));
          (f as HTMLElement).style.transform = `scaleX(${p})`;
        });
      });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        t.seek(t.labels.live + 3).pause();
        setPaused(true);
      }
      tl.current = t;
    }, el);

    // Don't spend frames on a reel nobody is looking at.
    let seen = false;
    io = new IntersectionObserver(
      ([entry]) => {
        const t = tl.current;
        if (!t) return;
        if (entry.isIntersecting && !seen) {
          // First proper look: start from the title card, not wherever the loop happened to be.
          seen = true;
          if (!el.dataset.userPaused) t.restart();
          return;
        }
        if (t.paused() === !entry.isIntersecting) return;
        if (!entry.isIntersecting) t.pause();
        else if (!el.dataset.userPaused) t.play();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    });

    return () => {
      cancelled = true;
      io?.disconnect();
      ctx?.revert();
    };
  }, []);

  const toggle = () => {
    const t = tl.current;
    if (!t) return;
    const next = !t.paused();
    t.paused(next);
    root.current!.dataset.userPaused = next ? "1" : "";
    setPaused(next);
  };

  const jump = (id: string) => {
    const t = tl.current;
    if (!t) return;
    t.seek(t.labels[id] + (id === "title" ? 0.01 : 1.4));
    if (!paused) t.play();
  };

  const [bx, by] = PANELS.brief;
  const at = (p: readonly [number, number]) => ({ left: p[0], top: p[1] }) as React.CSSProperties;

  return (
    <section className="reel-wrap" ref={section} data-cue="off" aria-labelledby="reel-title">
      <div className="reel-pin">
      <div className="reel-head">
        <h2 id="reel-title" className="hub-label">
          Showreel · How I work
        </h2>
        <p className="hub-label hub-label-dim">Concept to live in 37 seconds · directed in code</p>
      </div>

      <div className="reel rf" ref={root}>
        <div className="rf-video">
        <div className="rf-stage" aria-hidden>
          <div className="rf-world">
            {/* 01 Brief */}
            <div className="rf-panel rf-p-brief" style={at([bx, by])}>
              <div className="rf-brief">
                <p className="rf-brief-k">Brief · Maison Lumière × agency</p>
                <p className="rf-brief-line rf-brief-h">Find your signature scent</p>
                <p className="rf-brief-line">
                  Deliverables: a 5-question <span className="rf-hl">quiz<i className="rf-mark" /></span>, a share card and a <span className="rf-hl">mini game<i className="rf-mark" /></span>
                </p>
                <p className="rf-brief-line">Audience: FR · EN · mobile first, on campaign traffic</p>
                <p className="rf-brief-line">
                  Must have: GDPR consent and <span className="rf-hl">analytics<i className="rf-mark" /></span> from day one
                </p>
                <p className="rf-brief-line">
                  Launch: <span className="rf-hl">live in 3 weeks<i className="rf-mark" /></span>
                </p>
              </div>
              <p className="rf-note">Concept → Live</p>
            </div>

            {/* 02–03 Blueprint, assets, design */}
            <div className="rf-panel rf-p-design" style={at(PANELS.design)}>
              <div className="rf-bp">
                <svg className="rf-bp-svg" viewBox="0 0 1600 900" fill="none">
                  <rect className="rf-wire" pathLength={1} x="180" y="150" width="860" height="600" rx="14" />
                  <path className="rf-wire" pathLength={1} d="M180 196 H1040" />
                  <rect className="rf-wire" pathLength={1} x="230" y="240" width="420" height="40" />
                  <rect className="rf-wire" pathLength={1} x="230" y="296" width="300" height="20" />
                  <rect className="rf-wire" pathLength={1} x="230" y="370" width="180" height="200" />
                  <rect className="rf-wire" pathLength={1} x="430" y="370" width="180" height="200" />
                  <rect className="rf-wire" pathLength={1} x="630" y="370" width="180" height="200" />
                  <rect className="rf-wire" pathLength={1} x="830" y="370" width="180" height="200" />
                  <rect className="rf-wire" pathLength={1} x="230" y="640" width="200" height="54" rx="27" />
                  <rect className="rf-wire" pathLength={1} x="1140" y="170" width="290" height="580" rx="40" />
                  <circle className="rf-wire" pathLength={1} cx="1285" cy="360" r="90" />
                  <rect className="rf-wire" pathLength={1} x="1180" y="490" width="210" height="18" />
                  <rect className="rf-wire" pathLength={1} x="1180" y="530" width="210" height="80" />
                  <rect className="rf-wire" pathLength={1} x="1190" y="660" width="190" height="48" rx="24" />
                  <path className="rf-wire rf-dim" pathLength={1} d="M180 790 H1040 M180 780 V800 M1040 780 V800" />
                </svg>
                <p className="rf-anno" style={{ left: 240, top: 112 }}>Hero · type-led</p>
                <p className="rf-anno" style={{ left: 240, top: 590 }}>Quiz × 5 · photo answers</p>
                <p className="rf-anno" style={{ left: 1150, top: 770 }}>Result + share card</p>
                <p className="rf-anno" style={{ left: 820, top: 810 }}>1440 · responsive to 390</p>
              </div>

              <div className="rf-designed">
                <div className="rf-site">
                  <span className="rf-site-bar" />
                  <p className="rf-site-k">La Collection Lumière</p>
                  <p className="rf-site-h">
                    Find your <em>signature</em> scent
                  </p>
                  <span className="rf-site-cta">Begin the ritual</span>
                  {OPTIONS.map((o, i) => (
                    <span key={o.label} className="rf-site-label" style={{ left: 50 + i * 200 }}>
                      {o.label}
                    </span>
                  ))}
                </div>
                <div className="rf-phone">
                  <p className="rf-phone-k">Your signature</p>
                  <p className="rf-phone-h">Rose Nocturne</p>
                  <span className="rf-phone-cta">Share my scent</span>
                </div>
              </div>

              {/* Assets: their resting place is the slot; data-g* is where they gather around the blueprint first */}
              {OPTIONS.map((o, i) => (
                <div key={o.photo} className="rf-asset rf-slot" style={{ left: 230 + i * 200, top: 370 }} data-gx={(i - 1.5) * 150} data-gy={i % 2 ? -330 : 360} data-r={(i - 1.5) * 9}>
                  <Photo name={o.photo} alt="" ratio={1.11} sizes="200px" />
                </div>
              ))}
              <div className="rf-asset rf-slot rf-slot-phone" style={{ left: 1195, top: 270 }} data-gx={260} data-gy={-60} data-r={-8}>
                <Photo name="pinkRose" alt="" ratio={1} sizes="200px" />
              </div>
              <div className="rf-asset rf-chip" style={{ left: 1480, top: 220, background: "#f2ece2" }} data-gx={-90} data-gy={80} data-r={6}>
                <b>#F2ECE2</b>
              </div>
              <div className="rf-asset rf-chip" style={{ left: 1480, top: 360, background: "#231e19", color: "#fff" }} data-gx={-110} data-gy={60} data-r={-5}>
                <b>#231E19</b>
              </div>
              <div className="rf-asset rf-chip" style={{ left: 1480, top: 500, background: "#9a5b2e", color: "#fff" }} data-gx={-80} data-gy={40} data-r={4}>
                <b>#9A5B2E</b>
              </div>
              <div className="rf-asset rf-type" style={{ left: 40, top: 760 }} data-gx={120} data-gy={-120} data-r={-6}>
                <em>Aa</em> Cormorant · Inter
              </div>
            </div>

            {/* 04 Build with AI */}
            <div className="rf-panel rf-p-build" style={at(PANELS.build)}>
              <div className="rf-editor">
                <div className="rf-win-bar">
                  <i />
                  <i />
                  <i />
                  <span>Result.tsx — maison-lumiere</span>
                </div>
                <ol className="rf-code">
                  {CODE.map(([kind, line], i) => (
                    <li key={i}>
                      <span className={`rf-code-line rf-c-${kind || "p"}`}>{line || " "}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rf-claude">
                <div className="rf-win-bar">
                  <i />
                  <i />
                  <i />
                  <span>claude · maison-lumiere</span>
                </div>
                <div className="rf-claude-body">
                  {CLAUDE.map(([kind, line]) => (
                    <p key={line} className={`rf-claude-line rf-cl-${kind}`}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* 05 QA */}
            <div className="rf-panel rf-p-qa" style={at(PANELS.qa)}>
              <div className="rf-runner">
                <p className="rf-runner-cmd">
                  <span>$</span> npx playwright test
                </p>
                <div className="rf-grid">
                  <span />
                  <b>Desktop Chrome</b>
                  <b>Android · Pixel 7</b>
                  <b>iOS Safari</b>
                  {TESTS.map((name) => (
                    <div key={name} className="rf-row">
                      <span className="rf-test">{name}</span>
                      <span className="rf-cell" />
                      <span className="rf-cell" />
                      <span className="rf-cell" />
                    </div>
                  ))}
                </div>
                <p className="rf-qa-sum">
                  <b className="rf-passed">47</b> passed · 3 devices · 0 failed
                </p>
              </div>
            </div>

            {/* 06 Ship */}
            <div className="rf-panel rf-p-ship" style={at(PANELS.ship)}>
              <p className="rf-push">
                <span>$</span> git push origin main
              </p>
              <ol className="rf-pipe">
                {["Push", "CI · 47 checks", "Preview", "Production"].map((s, i) => (
                  <li key={s}>
                    {i > 0 && <span className="rf-link" />}
                    <span className="rf-node">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              <div className="rf-browser">
                <div className="rf-win-bar">
                  <i />
                  <i />
                  <i />
                  <span>irvan-fahlepi.vercel.app</span>
                  <b className="rf-live">● Live</b>
                </div>
                <Photo name="peony" alt="" className="rf-browser-shot" sizes="900px" />
                <p className="rf-browser-h">
                  Find your <em>signature</em> scent
                </p>
              </div>
            </div>

            {/* 07 Measure */}
            <div className="rf-panel rf-p-measure" style={at(PANELS.measure)}>
              <p className="rf-demo">Demo data</p>
              <div className="rf-kpis">
                <div className="rf-kpi">
                  <b data-v="1284">1284</b>
                  <span>Survey answers</span>
                </div>
                <div className="rf-kpi">
                  <b data-v="3906">3906</b>
                  <span>Games played</span>
                </div>
                <div className="rf-kpi">
                  <b data-v="18">18</b>
                  <span>Share rate %</span>
                </div>
                <div className="rf-kpi">
                  <b data-v="62">62</b>
                  <span>Story completion %</span>
                </div>
              </div>
              <div className="rf-charts">
                <div className="rf-funnel">
                  {[
                    ["Started", 100],
                    ["Completed", 74],
                    ["Shared", 18],
                  ].map(([l, v]) => (
                    <div key={l} className="rf-bar">
                      <span>{l}</span>
                      <i style={{ width: `${v}%` }} />
                    </div>
                  ))}
                </div>
                <svg className="rf-chart" viewBox="0 0 600 260" fill="none">
                  <path d="M0 250 H600" className="rf-axis" />
                  <path className="rf-line" pathLength={1} d="M0 230 C60 220 90 200 140 190 S240 150 290 160 S380 90 430 80 S520 40 600 30" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="rf-title" aria-hidden>
          <p className="rf-title-pre">How I work</p>
          <p className="rf-title-main">
            From concept <span>to live.</span>
          </p>
        </div>

        <div className="rf-end" aria-hidden>
          <p className="rf-end-k">Brief · Blueprint · Design · Build · QA · Ship · Measure</p>
          <p className="rf-end-h">
            Concept <span>→</span> Live.
          </p>
          <p className="rf-end-n">{SITE.name} · one person, every step</p>
        </div>

        <div className="reel-hud reel-hud-top" aria-hidden>
          <span>
            <i className="reel-rec" /> Rec · 2026
          </span>
          <span className="reel-tc">00:00:00:00</span>
        </div>
        </div>

        <div className="rf-chrome">
        <div className="rf-caps" aria-hidden>
          {SCENES.filter((s) => s.n).map((s) => (
            <p key={s.id} className="rf-cap" data-cap={s.id}>
              <b>{s.n}</b> {s.head}
              <span>{s.line}</span>
            </p>
          ))}
        </div>

        <div className="reel-hud reel-hud-bottom">
          <button className="reel-toggle" onClick={toggle} aria-label={paused ? "Play reel" : "Pause reel"}>
            {paused ? "▶" : "❚❚"}
          </button>
          <ol className="reel-segs">
            {SCENES.map((s) => (
              <li key={s.id}>
                <button onClick={() => jump(s.id)} aria-label={`Jump to ${s.label}`}>
                  <span className="reel-seg-track">
                    <span className="reel-seg-fill" />
                  </span>
                  <span className="reel-seg-label">{s.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        </div>
      </div>
      <p className="reel-cue" aria-hidden>
        Keep scrolling to continue <span>↓</span>
      </p>
      </div>
    </section>
  );
}
