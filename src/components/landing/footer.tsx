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
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-foreground">Følg oss</span>
              <a
                href="#"
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="LinkedIn"
              >
                LinkedIn <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Twitter / X"
              >
                Twitter / X <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </nav>
        </div>

        {/* Company info */}
        <div className="mt-8 border-t pt-6 text-sm text-muted-foreground">
          <div className="flex flex-col gap-1">
            <span>ChatPulse AS — Org.nr: 000 000 000</span>
            <span>Postadresse: Adresseveien 1, 0000 Oslo</span>
            <span>
              Kontakt:{" "}
              <a
                href="mailto:post@chatpulse.no"
                className="underline transition-colors hover:text-foreground"
              >
                post@chatpulse.no
              </a>
            </span>
          </div>
          <div className="mt-4">
            &copy; {new Date().getFullYear()} ChatPulse AS. Alle rettigheter
            reservert.
          </div>
        </div>
      </div>
    </footer>
  );
}
