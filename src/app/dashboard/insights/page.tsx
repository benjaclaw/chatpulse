import { InsightsPageClient } from "@/components/dashboard/insights-page";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Innsikt",
};

export default function InsightsPage(): React.ReactNode {
  return <InsightsPageClient />;
}
