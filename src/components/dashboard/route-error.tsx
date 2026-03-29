"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RouteError({
  error,
  reset,
  title = "Noe gikk galt",
  description = "En feil oppstod under lasting av denne siden. Prøv igjen.",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}): React.ReactNode {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 dark:bg-destructive/20">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="mt-5 text-lg font-bold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          Feil-ID: {error.digest}
        </p>
      )}
      <Button onClick={reset} className="mt-6 gap-2" size="sm">
        <RefreshCw className="h-4 w-4" />
        Prøv igjen
      </Button>
    </div>
  );
}
