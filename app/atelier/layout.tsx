import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./atelier.css";

const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--at-serif" });
const sans = DM_Sans({ subsets: ["latin"], weight: ["400"], variable: "--at-sans" });

export const metadata: Metadata = {
  title: "Atelier Nº 7 · The making of a bag",
  description: "A scroll story in seven gestures for a fictional leather house. Scroll-driven CSS, no animation library.",
};

export const viewport: Viewport = { themeColor: "#110f0d" };

export default function AtelierLayout({ children }: { children: React.ReactNode }) {
  return <div className={`at ${serif.variable} ${sans.variable}`}>{children}</div>;
}
