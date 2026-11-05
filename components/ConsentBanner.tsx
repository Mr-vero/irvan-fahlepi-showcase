"use client";

import { useEffect, useState } from "react";
import { readConsent, setConsent, type Consent } from "@/lib/analytics";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    if (stored) setConsent(stored, false);
    else setVisible(true);
  }, []);

  const choose = (value: Consent) => {
    setConsent(value);
    setVisible(false);
  };

  if (!visible) return null;
  return (
    <div className="if-consent" role="dialog" aria-label="Cookie consent">
      <p>Analytics help me see how these demos are used. Nothing is tracked unless you accept.</p>
      <div className="if-consent-actions">
        <button className="if-decline" onClick={() => choose("denied")}>
          Decline
        </button>
        <button className="if-accept" onClick={() => choose("granted")}>
          Accept
        </button>
      </div>
    </div>
  );
}
