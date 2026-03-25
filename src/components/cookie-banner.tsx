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
    if (!getStoredConsent()) {
      setVisible(true);
    }
    setLang(detectLanguage());
  }, []);

  const t = createT(lang);

  function accept(consent: CookieConsent) {
    localStorage.setItem(CONSENT_KEY, consent);
    setVisible(false);
    if (consent === "all") {
      window.location.reload();
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 p-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {t("cookie.message")}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => accept("all")}
            className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary/90"
          >
            {t("cookie.acceptAll")}
          </button>
          <button
            onClick={() => accept("necessary-only")}
            className="rounded-md border px-4 py-2 text-xs font-medium transition-colors hover:bg-muted"
          >
            {t("cookie.necessaryOnly")}
          </button>
          <Link
            href="/cookies"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 text-xs text-muted-foreground underline transition-colors hover:text-foreground"
          >
            {t("cookie.readMore")}
          </Link>
        </div>
      </div>
    </div>
  );
}
