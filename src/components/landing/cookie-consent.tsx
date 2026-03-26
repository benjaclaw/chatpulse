"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "chatpulse_cookie_consent";

export function CookieConsent(): React.ReactNode {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  function accept(value: "accepted" | "necessary") {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up border-t bg-background/80 backdrop-blur"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Vi bruker informasjonskapsler for å forbedre opplevelsen din.{" "}
          <Link href="/privacy" className="text-primary underline">
            Les mer
          </Link>
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => accept("necessary")}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Kun nødvendige
          </button>
          <button
            onClick={() => accept("accepted")}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Godta
          </button>
        </div>
      </div>
    </div>
  );
}
