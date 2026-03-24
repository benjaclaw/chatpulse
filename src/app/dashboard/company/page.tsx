import { Building2 } from "lucide-react";

export const metadata = {
  title: "Bedriftsinfo — ChatPulse",
};

export default function CompanyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bedriftsinfo</h1>
        <p className="mt-1 text-muted-foreground">
          Informasjon om bedriften din som chatboten kan bruke.
        </p>
      </div>

      <div className="rounded-xl border border-dashed bg-card/50 p-8 text-center dark:bg-card/20">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Building2 className="h-7 w-7 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-semibold">Kommer snart</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Her vil du kunne legge til bedriftsinformasjon som navn, bransje, kontaktinfo og åpningstider.
        </p>
      </div>
    </div>
  );
}
