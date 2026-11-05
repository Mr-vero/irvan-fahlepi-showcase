import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "./shade.css";

const serif = Bodoni_Moda({ subsets: ["latin"], weight: ["400"], style: ["normal", "italic"], variable: "--sm-serif" });
const sans = Jost({ subsets: ["latin"], weight: ["400"], variable: "--sm-sans" });

export const metadata: Metadata = {
  title: "Shade Match · An unofficial L’Oréal Paris concept",
  description: "A 30-second colour-perception game. An unofficial concept by Irvan Fahlepi, not affiliated with L’Oréal.",
};

export const viewport: Viewport = { themeColor: "#f7f4ef" };

export default function ShadeLayout({ children }: { children: React.ReactNode }) {
  return <div className={`sm ${serif.variable} ${sans.variable}`}>{children}</div>;
}
