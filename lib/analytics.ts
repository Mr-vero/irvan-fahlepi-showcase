"use client";

import type { EventName } from "./events";

export type Consent = "granted" | "denied";

const CONSENT_KEY = "if-consent";
const CONSENT_EVENT = "if-consent-change";

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

let consent: Consent | null = null;

// gtag.js reads `arguments` objects from the dataLayer, not plain arrays.
function gtag(..._args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

function loadGa(id: string) {
  if (document.getElementById("ga-script")) return;
  const s = document.createElement("script");
  s.id = "ga-script";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
  gtag("js", new Date());
  gtag("config", id, { anonymize_ip: true });
}

/**
 * Nothing is sent and no Google script is loaded until the visitor opts in.
 * That is stricter than Consent Mode's cookieless pings, and it is what a CNIL review expects.
 */
export function setConsent(value: Consent, persist = true) {
  consent = value;
  if (persist) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {}
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }
  gtag("consent", "update", {
    analytics_storage: value,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (value === "granted" && id) loadGa(id);
}

/** Sends the event to GA4 (when configured) and to the first-party counter behind the Lab dashboard. */
export function track(event: EventName, params: Record<string, string | number | boolean> = {}) {
  if (consent !== "granted") return;
  gtag("event", event, params);
  try {
    navigator.sendBeacon?.("/api/events", JSON.stringify({ name: event }));
  } catch {}
  if (process.env.NODE_ENV !== "production") console.debug("[analytics]", event, params);
}
