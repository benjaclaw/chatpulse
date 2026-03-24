import { Settings, Bell, Shield, Globe } from "lucide-react";

export const metadata = {
  title: "Innstillinger — ChatPulse",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Innstillinger</h1>
        <p className="mt-1 text-muted-foreground">
          Administrer workspace-innstillinger.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsCard
          icon={Settings}
          title="Generelt"
          description="Workspace-navn, slug og grunnleggende konfigurasjon."
        />
        <SettingsCard
          icon={Bell}
          title="Varsler"
          description="E-postvarsler for nye samtaler og ubesvarte spørsmål."
        />
        <SettingsCard
          icon={Shield}
          title="Sikkerhet"
          description="API-nøkler, tilgangskontroll og autentisering."
        />
        <SettingsCard
          icon={Globe}
          title="Embed"
          description="Embed-kode og widget-konfigurasjon for nettsiden din."
        />
      </div>

      <div className="rounded-xl border border-dashed bg-card/50 p-8 text-center dark:bg-card/20">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Settings className="h-7 w-7 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-semibold">Kommer snart</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Innstillinger-siden er under utvikling. Sjekk tilbake snart!
        </p>
      </div>
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
