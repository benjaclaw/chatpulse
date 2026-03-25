import { CompanyPageClient } from "@/components/dashboard/company-page";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bedriftsinfo — ChatPulse",
};

export default function CompanyPage(): React.ReactNode {
  return <CompanyPageClient />;
}
