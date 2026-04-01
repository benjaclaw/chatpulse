"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function RouteError({
  error,
  reset,
  title = "Noe gikk galt",
  description = "En feil oppstod under lasting av denne siden. Prøv igjen.",
  icon: Icon = AlertTriangle,
  backLink,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  backLink?: { href: string; label: string };
}): React.ReactNode {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center animate-scroll-fade">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 shadow-sm dark:bg-destructive/20">
        <Icon className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="mt-5 text-lg font-bold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          Feil-ID: {error.digest}
        </p>
      )}
      <div className="mt-6 flex gap-3">
        {backLink && (
          <Link
            href={backLink.href}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            {backLink.label}
          </Link>
        )}
        <Button onClick={reset} className="gap-2" size="sm">
          <RefreshCw className="h-4 w-4" />
          Prøv igjen
        </Button>
      </div>
    </div>
  );
}
