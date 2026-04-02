import { Suspense } from "react";
import { InsightsPageClient } from "@/components/dashboard/insights-page";

export const metadata = {
  title: "Innsikt",
};

export default function InsightsPage(): React.ReactNode {
  return (
    <Suspense>
      <InsightsPageClient />
    </Suspense>
  );
}
