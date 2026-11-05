import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./maison.css";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["300"], style: ["normal", "italic"], variable: "--ml-serif" });
const sans = Inter({ subsets: ["latin"], weight: ["400", "500"], variable: "--ml-sans" });

export const metadata: Metadata = {
  title: "Maison Lumière · Find your signature scent",
  description: "Five questions to your signature fragrance. A survey demo for a fictional fragrance house.",
};

export const viewport: Viewport = { themeColor: "#f2ece2" };

export default function MaisonLayout({ children }: { children: React.ReactNode }) {
  return <div className={`ml ${serif.variable} ${sans.variable}`}>{children}</div>;
}
