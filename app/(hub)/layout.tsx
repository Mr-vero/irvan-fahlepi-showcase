import { Outfit } from "next/font/google";
import "./hub.css";

const sans = Outfit({ subsets: ["latin"], weight: ["400", "500", "700", "800"], variable: "--hub-sans" });

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return <div className={`hub ${sans.variable}`}>{children}</div>;
}
