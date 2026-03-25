"use client";

import { useEffect } from "react";
import { ShieldAlert, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminError({
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
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-xl font-bold tracking-tight">
        Feil i admin-panelet
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Kunne ikke laste admin-innholdet. Prøv igjen eller gå tilbake til
        dashboardet.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          Feil-ID: {error.digest}
        </p>
      )}
      <div className="mt-6 flex gap-3">
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <Button onClick={() => unstable_retry()} className="gap-2">
          <RefreshCw className="h-4 w-4" data-icon="inline-start" />
          Prøv igjen
        </Button>
      </div>
    </div>
  );
}
