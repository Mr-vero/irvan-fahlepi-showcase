import type { Metadata, Viewport } from "next";
import ConsentBanner from "@/components/ConsentBanner";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  title: { default: `${SITE.name} · Interactive work`, template: `%s · ${SITE.name}` },
  description: "Mini games, surveys and scroll stories, taken from prototype to live. Interactive demos by Irvan Fahlepi.",
  authors: [{ name: SITE.name }],
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// Consent Mode v2 defaults must be in place before any tag could load.
const consentDefaults = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  analytics_storage: 'denied', ad_storage: 'denied',
  ad_user_data: 'denied', ad_personalization: 'denied',
  wait_for_update: 500
});`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: consentDefaults }} />
      </head>
      <body>
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
