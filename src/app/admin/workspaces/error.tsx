"use client";

import { ShieldAlert } from "lucide-react";
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
      title="Feil ved lasting av workspaces"
      description="Kunne ikke laste workspace-listen. Prøv igjen."
      icon={ShieldAlert}
      backLink={{ href: "/admin", label: "Admin" }}
    />
  );
}
