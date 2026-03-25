"use client";

import { useState } from "react";
import Link from "next/link";
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

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <Link href="/" className="flex items-center">
        <img src="/logo.svg" alt="ChatPulse" className="h-6" />
      </Link>
      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/pricing"
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          {t("landing.header.pricing")}
        </Link>
        <Link
          href="/#features"
          className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:inline-flex")}
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
    </header>
  );
}
