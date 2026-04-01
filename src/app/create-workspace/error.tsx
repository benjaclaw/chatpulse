"use client";

import { RouteError } from "@/components/dashboard/route-error";

export default function CreateWorkspaceError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}): React.ReactNode {
  return (
    <RouteError
      error={error}
      reset={unstable_retry}
      description="Kunne ikke laste siden. Prøv igjen."
    />
  );
}
