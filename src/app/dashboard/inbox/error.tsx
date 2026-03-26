"use client";

import { RouteError } from "@/components/dashboard/route-error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactNode {
  return <RouteError error={error} reset={reset} />;
}
