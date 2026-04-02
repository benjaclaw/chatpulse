import { Suspense } from "react";
import { AnalyticsPageClient } from "@/components/dashboard/analytics-page";

export const metadata = {
  title: "Analytics",
};

export default function AnalyticsPage(): React.ReactNode {
  return (
    <Suspense>
      <AnalyticsPageClient />
    </Suspense>
  );
}
