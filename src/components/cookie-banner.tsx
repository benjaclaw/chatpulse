"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createT } from "@/lib/i18n";
import type { Language } from "@/lib/i18n";

type CookieConsent = "all" | "necessary-only";

const CONSENT_KEY = "chatpulse-cookie-consent";

export function getStoredConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CONSENT_KEY) as CookieConsent | null;
}

export function hasAnalyticsConsent(): boolean {
  return getStoredConsent() === "all";
}

function detectLanguage(): Language {
  if (typeof window === "undefined") return "nb";
  try {
    const stored = localStorage.getItem("chatpulse-lang");
    if (stored === "en" || stored === "nb") return stored;
  } catch {
    // ignore
  }
  return navigator.language.startsWith("en") ? "en" : "nb";
}

export function CookieBanner(): React.ReactNode {
  const [visible, setVisible] = useState(false);
  const [lang, setLang] = useState<Language>("nb");

  useEffect(() => {
    // Don't show cookie banner in widget iframe
    if (window.location.pathname.startsWith("/widget")) return;

    const stored = getStoredConsent();
    if (!stored) {
      setVisible(true);
    } else if (stored === "all") {
      // Restore consent for returning users who already accepted
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", { analytics_storage: "granted", ad_storage: "granted" });
      }
    }
    setLang(detectLanguage());
  }, []);

  const t = createT(lang);

  function accept(consent: CookieConsent) {
    localStorage.setItem(CONSENT_KEY, consent);
    setVisible(false);

    // Push consent update to GTM dataLayer
    window.dataLayer = window.dataLayer || [];
    if (consent === "all") {
      window.dataLayer.push({ event: "consent_update", analytics_storage: "granted", ad_storage: "granted" } as Record<string, unknown>);
      // Also call gtag consent update if gtag is available
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", { analytics_storage: "granted", ad_storage: "granted" });
      }
      window.location.reload();
    } else {
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", { analytics_storage: "denied", ad_storage: "denied" });
      }
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up border-t bg-background/95 p-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {t("cookie.message")}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => accept("all")}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {t("cookie.acceptAll")}
          </button>
          <button
            onClick={() => accept("necessary-only")}
            className="rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t("cookie.necessaryOnly")}
          </button>
          <Link
            href="/cookies"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-3 py-2.5 text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t("cookie.readMore")}
          </Link>
        </div>
      </div>
    </div>
  );
}
