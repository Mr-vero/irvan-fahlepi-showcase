/**
 * Free-licence photography from Unsplash (unsplash.com/license), served from Unsplash's own CDN so each
 * request is resized and re-encoded (AVIF/WebP) to the size it is shown at. No branded products appear.
 */
export const PHOTOS = {
  // Beauty — Shade Match
  redDress: "1768696083080-15d4218ce844",
  lips: "1579752515149-489d8d711342",
  lipsLight: "1781717510837-379bcb92fe13",
  portrait: "1651047481316-1f7565cde651",
  swatches: "1631214499500-2e34edcaccfe",
  lipsticks: "1571646034647-52e6ea84b28c",
  bullet: "1706821753638-70c7ddca341f",
  droplets: "1783058890712-c592fa619bc4",
  // Scent — Maison Lumière
  peony: "1532614208657-10b8d7815f40",
  redRose: "1542324216541-c84c8ba6db04",
  whiteRose: "1513915479708-3e3f7f7c4637",
  pinkRose: "1616581140368-c95002af164f",
  bouquet: "1622658641558-235f26dd270b",
  orange: "1587923793996-ed5cc3eed35d",
  orangeSlice: "1743591141131-3471669f3862",
  lemon: "1603824231744-517ef271df7e",
  lime: "1789301855747-d0f137f748e1",
  goldenBottles: "1622618991746-fe6004db3a47",
  clearBottle: "1761659760494-32b921a2449f",
  amberSwirl: "1763995687869-86fea4d59553",
  // Leather — Atelier Nº 7
  workshop: "1768550005921-8782adcb798c",
  craftsman: "1775127730710-46450adcf73e",
  walletTools: "1628483211662-9bcc692c46dc",
  edge: "1716295177956-420a647c83ac",
  stitching: "1741086154510-522e68f76933",
  thread: "1496180317060-d2026272f138",
  quilted: "1564842505181-8862a3b9b173",
  hide: "1571829604981-ea159f94e5ad",
  hideDark: "1755541608110-3440a0f168ed",
  hideWarm: "1778883008431-4b0e5c78d389",
  laces: "1563433337461-5b65f0834f3a",
} as const;

export type PhotoKey = keyof typeof PHOTOS;

export function photoUrl(key: PhotoKey, w: number, h?: number, q = 72): string {
  const size = h ? `&h=${h}&fit=crop` : "";
  return `https://images.unsplash.com/photo-${PHOTOS[key]}?w=${w}${size}&q=${q}&auto=format&crop=entropy`;
}

/** A width-based srcset; `ratio` (h/w) crops every candidate to the same shape. */
export function photoSrcSet(key: PhotoKey, ratio?: number, widths = [480, 800, 1200, 1800, 2400]): string {
  return widths.map((w) => `${photoUrl(key, w, ratio ? Math.round(w * ratio) : undefined)} ${w}w`).join(", ");
}
