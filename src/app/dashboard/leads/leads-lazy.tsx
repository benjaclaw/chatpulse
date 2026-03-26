"use client";

import dynamic from "next/dynamic";

const LeadsPageClient = dynamic(
  () => import("@/components/dashboard/leads-page").then((m) => m.LeadsPageClient),
  { ssr: false }
);

export function LeadsPageLazy(): React.ReactNode {
  return <LeadsPageClient />;
}
