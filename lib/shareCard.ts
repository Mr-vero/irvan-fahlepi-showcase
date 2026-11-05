"use client";

import type { Fragrance } from "./data";

const W = 1080;
const H = 1350;

/** Draws a 4:5 story-ready card for the visitor's result and returns it as a PNG blob. */
export async function renderShareCard(f: Fragrance): Promise<Blob> {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const serif = getComputedStyle(document.documentElement).getPropertyValue("--font-serif").trim() || "serif";
  const sans = getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim() || "sans-serif";

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0e0c0a");
  bg.addColorStop(1, f.colors[0]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W * 0.7, H * 0.3, 0, W * 0.7, H * 0.3, W * 0.8);
  glow.addColorStop(0, f.colors[1] + "aa");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(232, 214, 180, 0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, W - 96, H - 96);

  ctx.fillStyle = "#e8d6b4";
  ctx.textAlign = "center";
  ctx.font = `500 30px ${sans}`;
  ctx.letterSpacing = "10px";
  ctx.fillText("MAISON LUMIÈRE", W / 2, 150);

  ctx.letterSpacing = "6px";
  ctx.font = `400 26px ${sans}`;
  ctx.fillStyle = "rgba(232, 214, 180, 0.7)";
  ctx.fillText("MY SIGNATURE SCENT", W / 2, 470);

  ctx.letterSpacing = "0px";
  ctx.fillStyle = "#f6efe3";
  ctx.font = `italic 300 120px ${serif}`;
  ctx.fillText(f.name, W / 2, 610, W - 160);

  ctx.font = `400 44px ${serif}`;
  ctx.fillStyle = "rgba(246, 239, 227, 0.8)";
  ctx.fillText(f.tagline, W / 2, 690);

  const rows: [string, string][] = [
    ["TOP", f.notes.top],
    ["HEART", f.notes.heart],
    ["BASE", f.notes.base],
  ];
  rows.forEach(([label, value], i) => {
    const y = 870 + i * 100;
    ctx.letterSpacing = "6px";
    ctx.font = `500 22px ${sans}`;
    ctx.fillStyle = "rgba(232, 214, 180, 0.6)";
    ctx.fillText(label, W / 2, y);
    ctx.letterSpacing = "0px";
    ctx.font = `400 40px ${serif}`;
    ctx.fillStyle = "#f6efe3";
    ctx.fillText(value, W / 2, y + 46);
  });

  ctx.letterSpacing = "4px";
  ctx.font = `400 22px ${sans}`;
  ctx.fillStyle = "rgba(232, 214, 180, 0.6)";
  ctx.fillText("FIND YOURS AT MAISON LUMIÈRE", W / 2, H - 110);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
  );
}
