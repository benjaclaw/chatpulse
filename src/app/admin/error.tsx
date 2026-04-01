"use client";

import { ShieldAlert } from "lucide-react";
import { RouteError } from "@/components/dashboard/route-error";

export default function AdminError({
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
      title="Feil i admin-panelet"
      description="Kunne ikke laste admin-innholdet. Prøv igjen eller gå tilbake til dashboardet."
      icon={ShieldAlert}
      backLink={{ href: "/dashboard", label: "Dashboard" }}
    />
  );
}
