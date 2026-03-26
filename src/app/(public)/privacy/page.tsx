import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personvernerklæring",
  description: "Les ChatPulse sin personvernerklæring. Vi forklarer hvilke opplysninger vi samler inn, hvordan de brukes, og dine rettigheter under GDPR.",
  alternates: {
    canonical: "https://chatpulse.no/privacy",
  },
  openGraph: {
    title: "Personvernerklæring — ChatPulse",
    description: "Les ChatPulse sin personvernerklæring. Vi forklarer hvilke opplysninger vi samler inn, hvordan de brukes, og dine rettigheter under GDPR.",
    url: "https://chatpulse.no/privacy",
  },
};

// Static page — revalidate once per day
export const revalidate = 86400;

export default function PrivacyPage(): React.ReactNode {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 font-heading text-3xl font-bold">
        Personvernerklæring
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Sist oppdatert: 25. mars 2026
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-3">
        <section>
          <h2>1. Behandlingsansvarlig</h2>
          <p>
            Gains AS (org.nr 930 118 427 MVA) er behandlingsansvarlig for
            personopplysninger som samles inn via ChatPulse.
          </p>
          <p>
            Kontakt:{" "}
            <a
              href="mailto:post@chatpulse.no"
              className="text-primary underline"
            >
              post@chatpulse.no
            </a>
          </p>
        </section>

        <section>
          <h2>2. Hvilke opplysninger vi samler inn</h2>

          <h3>Kontoinformasjon</h3>
          <p>
            Når du oppretter en konto samler vi inn navn og e-postadresse. Ved
            innlogging via Google mottar vi profilinformasjon fra din
            Google-konto (navn, e-post, profilbilde) gjennom OAuth 2.0.
          </p>

          <h3>Chatbot-samtaler</h3>
          <p>
            Meldinger sendt til og fra chatboten lagres for å gi deg innsikt og
            forbedre tjenesten. Samtaler slettes automatisk etter 90 dager.
          </p>

          <h3>Analytiske data</h3>
          <p>
            Vi bruker Google Analytics med anonymisert IP-adresse for å forstå
            hvordan nettsiden brukes. Dette inkluderer sidevisninger, varighet på
            besøk og generell bruksmønster. Ingen personlig identifiserbar
            informasjon sendes til Google Analytics.
          </p>
        </section>

        <section>
          <h2>3. Rettslig grunnlag</h2>
          <ul className="space-y-2">
            <li>
              <strong>Avtale (GDPR art. 6(1)(b)):</strong> Behandling av
              kontoinformasjon og samtaler er nødvendig for å levere tjenesten.
            </li>
            <li>
              <strong>Samtykke (GDPR art. 6(1)(a)):</strong> Analyse-cookies
              settes kun med ditt samtykke.
            </li>
            <li>
              <strong>Berettiget interesse (GDPR art. 6(1)(f)):</strong>{" "}
              Nødvendige cookies for autentisering og sikkerhet.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Databehandlere og tredjeparter</h2>
          <p>Vi deler opplysninger med følgende tredjeparter:</p>
          <ul className="space-y-2">
            <li>
              <strong>Google</strong> — Analytics (anonymisert bruksstatistikk)
              og Authentication (innlogging via Google). Data kan overføres til
              USA under EU-US Data Privacy Framework.
            </li>
            <li>
              <strong>Supabase</strong> — Database og autentisering. Data lagres
              i EU-regionen.
            </li>
            <li>
              <strong>Vercel</strong> — Hosting av nettsiden. Data behandles i
              henhold til Vercels databehandleravtale.
            </li>
          </ul>
        </section>

        <section>
          <h2>5. Informasjonskapsler (cookies)</h2>
          <p>
            Vi bruker følgende typer informasjonskapsler. Se vår{" "}
            <a href="/cookies" className="text-primary underline">
              cookiepolicy
            </a>{" "}
            for detaljer.
          </p>
          <ul className="space-y-2">
            <li>
              <strong>Nødvendige:</strong> Autentiseringsøkt (Supabase). Krever
              ikke samtykke.
            </li>
            <li>
              <strong>Analyse:</strong> Google Analytics (_ga, _gid). Krever
              samtykke.
            </li>
            <li>
              <strong>Preferanser:</strong> Språkvalg. Krever samtykke.
            </li>
          </ul>
        </section>

        <section>
          <h2>6. Lagring og sletting</h2>
          <ul className="space-y-2">
            <li>
              <strong>Chatbot-samtaler:</strong> Slettes automatisk etter 90
              dager.
            </li>
            <li>
              <strong>Kontodata:</strong> Lagres så lenge kontoen er aktiv. Ved
              sletting av konto fjernes alle tilknyttede data.
            </li>
          </ul>
        </section>

        <section>
          <h2>7. Data om chatbot-sluttbrukere</h2>
          <p>
            Besøkende som bruker en ChatPulse-chatbot på en kundes nettside får
            sine meldinger lagret som en del av samtaleloggen. Ingen
            personopplysninger samles inn med mindre brukeren frivillig oppgir
            dette i samtalen.
          </p>
        </section>

        <section>
          <h2>8. Dine rettigheter</h2>
          <p>I henhold til GDPR har du rett til:</p>
          <ul className="space-y-2">
            <li>
              <strong>Innsyn:</strong> Be om kopi av dine personopplysninger.
            </li>
            <li>
              <strong>Retting:</strong> Korrigere unøyaktige opplysninger.
            </li>
            <li>
              <strong>Sletting:</strong> Be om at dine data slettes.
            </li>
            <li>
              <strong>Dataportabilitet:</strong> Motta dine data i et
              maskinlesbart format.
            </li>
            <li>
              <strong>Klage:</strong> Du kan klage til Datatilsynet
              (datatilsynet.no) dersom du mener dine rettigheter ikke er
              ivaretatt.
            </li>
          </ul>
          <p>
            Kontakt oss på{" "}
            <a
              href="mailto:post@chatpulse.no"
              className="text-primary underline"
            >
              post@chatpulse.no
            </a>{" "}
            for å utøve dine rettigheter.
          </p>
        </section>

        <section>
          <h2>9. Endringer</h2>
          <p>
            Vi kan oppdatere denne personvernerklæringen ved behov. Vesentlige
            endringer vil bli varslet via e-post eller på nettsiden.
          </p>
        </section>
      </div>
    </div>
  );
}
