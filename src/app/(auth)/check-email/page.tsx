import { Mail } from "lucide-react";
import Link from "next/link";
import Script from "next/script";

export default function CheckEmailPage(): React.ReactNode {
  return (
    <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
      <Script id="track-signup" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: "sign_up", method: "email" });`}
      </Script>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Mail className="h-7 w-7" />
      </div>

      <h1 className="mt-5 text-xl font-bold tracking-tight">
        Sjekk e-posten din
      </h1>

      <p className="mt-3 text-sm text-muted-foreground">
        Vi har sendt en bekreftelseslenke til din e-postadresse. Klikk på lenken
        for å aktivere kontoen din.
      </p>

      <p className="mt-4 text-xs text-muted-foreground">
        Har du ikke mottatt e-posten? Sjekk spam-mappen.
      </p>

      <Link
        href="/login"
        className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
      >
        Tilbake til innlogging
      </Link>
    </div>
  );
}
