"use client";

import { RouteError } from "@/components/dashboard/route-error";

export default function DashboardError({
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
      title="Kunne ikke laste dashboardet"
      description="En feil oppstod under lasting av denne siden. Prøv igjen eller gå tilbake til forsiden."
      backLink={{ href: "/dashboard", label: "Dashboard" }}
    />
  );
}
