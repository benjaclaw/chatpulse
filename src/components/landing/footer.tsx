"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
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
    <footer className="border-t px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center">
              <Image src="/logo.svg" alt="ChatPulse" width={100} height={20} />
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              {t("landing.footer.tagline")}
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-8 text-sm" role="navigation" aria-label="Footer navigation">
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-foreground">
                {t("landing.footer.product")}
              </span>
              <Link
                href="/features"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("landing.header.features")}
              </Link>
              <Link
                href="/pricing"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("landing.header.pricing")}
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-foreground">
                {t("landing.footer.legal")}
              </span>
              <Link
                href="/privacy"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("landing.footer.privacy")}
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("landing.footer.terms")}
              </Link>
              <Link
                href="/cookies"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("landing.footer.cookies")}
              </Link>
            </div>

          </nav>
        </div>

        {/* Company info */}
        <div className="mt-8 border-t pt-6 text-sm text-muted-foreground">
          <div>
            &copy; {new Date().getFullYear()} ChatPulse AS. Alle rettigheter
            reservert.
          </div>
        </div>
      </div>
    </footer>
  );
}
