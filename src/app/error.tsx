"use client";

import { RouteError } from "@/components/dashboard/route-error";

export default function Error({
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
      description="En uventet feil oppstod. Prøv å laste siden på nytt, eller kontakt support hvis problemet vedvarer."
      backLink={{ href: "/", label: "Gå til forsiden" }}
    />
  );
}
