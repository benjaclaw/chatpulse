import { Suspense } from "react";
import { CompanyPageClient } from "@/components/dashboard/company-page";

export const metadata = {
  title: "Bedriftsinfo — ChatPulse",
};

export default function CompanyPage(): React.ReactNode {
  return (
    <Suspense>
      <CompanyPageClient />
    </Suspense>
  );
}
