"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateWorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactNode {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-bold">Noe gikk galt</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Kunne ikke laste siden. Prøv igjen.
      </p>
      <Button onClick={reset} className="mt-5 gap-2" size="sm">
        <RefreshCw className="h-4 w-4" />
        Prøv igjen
      </Button>
    </div>
  );
}
