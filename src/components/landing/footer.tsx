"use client";

import { useState } from "react";
import Link from "next/link";
import { createT, type Language } from "@/lib/i18n";

export function LandingFooter(): React.ReactNode {
  const [language] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("chatpulse_lang") as Language) || "nb";
    }
    return "nb";
  });
  const t = createT(language);

  return (
    <footer className="border-t px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <Link href="/" className="flex items-center">
          <img src="/logo.svg" alt="ChatPulse" className="h-5" />
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:gap-6">
          <Link
            href="/privacy"
            className="transition-colors hover:text-foreground"
          >
            {t("landing.footer.privacy")}
          </Link>
          <Link
            href="/terms"
            className="transition-colors hover:text-foreground"
          >
            {t("landing.footer.terms")}
          </Link>
          <Link
            href="/cookies"
            className="transition-colors hover:text-foreground"
          >
            {t("landing.footer.cookies")}
          </Link>
          <span>&copy; {new Date().getFullYear()} Gains AS</span>
        </div>
      </div>
    </footer>
  );
}
