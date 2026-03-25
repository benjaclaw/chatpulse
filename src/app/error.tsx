"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}): React.ReactNode {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight">
        Noe gikk galt
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        En uventet feil oppstod. Prøv å laste siden på nytt, eller kontakt
        support hvis problemet vedvarer.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          Feil-ID: {error.digest}
        </p>
      )}
      <Button onClick={() => unstable_retry()} className="mt-6 gap-2">
        <RefreshCw className="h-4 w-4" data-icon="inline-start" />
        Prøv igjen
      </Button>
    </div>
  );
}
