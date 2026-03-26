"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createT, type Language } from "@/lib/i18n";

export function LandingHeader(): React.ReactNode {
  const [language] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("chatpulse_lang") as Language) || "nb";
    }
    return "nb";
  });
  const t = createT(language);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Image src="/logo.svg" alt="ChatPulse" width={120} height={24} priority />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex md:items-center md:gap-4">
          <Link
            href="/pricing"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            {t("landing.header.pricing")}
          </Link>
          <Link
            href="/features"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            {t("landing.header.features")}
          </Link>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            {t("landing.header.login")}
          </Link>
          <Link href="/signup" className={cn(buttonVariants())}>
            {t("landing.header.getStarted")}
          </Link>
        </div>

        {/* Hamburger button */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-background px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-2">
            <Link
              href="/pricing"
              onClick={() => setMobileOpen(false)}
              className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start")}
            >
              {t("landing.header.pricing")}
            </Link>
            <Link
              href="/features"
              onClick={() => setMobileOpen(false)}
              className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start")}
            >
              {t("landing.header.features")}
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start")}
            >
              {t("landing.header.login")}
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className={cn(buttonVariants(), "w-full")}
            >
              {t("landing.header.getStarted")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
