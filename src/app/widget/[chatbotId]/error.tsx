"use client";

export default function WidgetError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}): React.ReactNode {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="text-sm text-muted-foreground">
        Kunne ikke laste chatten. Prøv igjen.
      </p>
      <button
        onClick={unstable_retry}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
      >
        Prøv igjen
      </button>
    </div>
  );
}
