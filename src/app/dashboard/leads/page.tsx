import { LeadsPageClient } from "@/components/dashboard/leads-page";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Leads",
};

export default function LeadsPage(): React.ReactNode {
  return <LeadsPageClient />;
}
