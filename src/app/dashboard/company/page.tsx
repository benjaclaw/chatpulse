import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata = {
  title: "Bedriftsinfo — ChatPulse",
};

export default function CompanyPage(): React.ReactNode {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bedriftsinfo</h1>
        <p className="mt-1 text-muted-foreground">
          Informasjon om bedriften din som chatboten kan bruke.
        </p>
      </div>

      <EmptyState
        icon={Building2}
        title="Kommer snart"
        description="Her vil du kunne legge til bedriftsinformasjon som navn, bransje, kontaktinfo og åpningstider."
      />
    </div>
  );
}
