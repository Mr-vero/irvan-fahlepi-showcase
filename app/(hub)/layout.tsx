import { Instrument_Serif, Inter_Tight } from "next/font/google";
import "./hub.css";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--hub-serif" });
const sans = Inter_Tight({ subsets: ["latin"], weight: ["400", "500"], variable: "--hub-sans" });

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return <div className={`hub ${serif.variable} ${sans.variable}`}>{children}</div>;
}
