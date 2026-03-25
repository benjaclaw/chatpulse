"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthError({
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
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-bold tracking-tight">
        Noe gikk galt
      </h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Kunne ikke laste innloggingssiden. Vennligst prøv igjen.
      </p>
      <Button
        onClick={() => unstable_retry()}
        className="mt-5 gap-2"
        size="sm"
      >
        <RefreshCw className="h-4 w-4" data-icon="inline-start" />
        Prøv igjen
      </Button>
    </div>
  );
}
