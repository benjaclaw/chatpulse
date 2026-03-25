import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vilkår for bruk",
};

export default function TermsPage(): React.ReactNode {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/"
        className="mb-8 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        &larr; Tilbake til forsiden
      </Link>

      <h1 className="mb-2 font-heading text-3xl font-bold">
        Vilkår for bruk
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Sist oppdatert: 25. mars 2026
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-3">
        <section>
          <h2>1. Om tjenesten</h2>
          <p>
            ChatPulse er en AI-chatbot-plattform levert av Gains AS (org.nr 930
            118 427 MVA). Tjenesten lar deg opprette, trene og embedde
            AI-chatboter på din nettside.
          </p>
        </section>

        <section>
          <h2>2. Konto og ansvar</h2>
          <p>
            Du er ansvarlig for å holde din konto og innloggingsinformasjon
            sikker. Du er ansvarlig for all aktivitet som skjer under din konto.
            Du må varsle oss umiddelbart ved mistanke om uautorisert bruk.
          </p>
        </section>

        <section>
          <h2>3. Akseptabel bruk</h2>
          <p>Du forplikter deg til å ikke bruke ChatPulse til å:</p>
          <ul className="space-y-2">
            <li>Spre ulovlig, skadelig eller villedende innhold.</li>
            <li>Krenke andres immaterielle rettigheter.</li>
            <li>Sende spam eller uønsket kommunikasjon.</li>
            <li>
              Forsøke å omgå sikkerhetstiltak eller forstyrre tjenesten.
            </li>
            <li>
              Bruke tjenesten til formål som er i strid med norsk lov.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Eierskap til data</h2>
          <p>
            Du beholder fullt eierskap til alt innhold du laster opp til
            ChatPulse, inkludert kunnskapsbase, samtaler og konfigurasjon. Vi
            bruker dine data utelukkende for å levere og forbedre tjenesten.
          </p>
          <p>
            Du kan når som helst eksportere eller slette dine data i henhold til
            vår{" "}
            <Link href="/privacy" className="text-primary underline">
              personvernerklæring
            </Link>
            .
          </p>
        </section>

        <section>
          <h2>5. Tjenestens tilgjengelighet</h2>
          <p>
            Vi tilstreber høy oppetid, men kan ikke garantere uavbrutt tilgang.
            Vi forbeholder oss retten til å utføre vedlikehold og oppdateringer
            som kan medføre midlertidig nedetid.
          </p>
        </section>

        <section>
          <h2>6. Ansvarsbegrensning</h2>
          <p>
            ChatPulse leveres &laquo;som den er&raquo;. Gains AS er ikke
            ansvarlig for indirekte tap, følgeskader eller tap av data som følge
            av bruk av tjenesten, i den grad dette er tillatt etter norsk lov.
          </p>
          <p>
            AI-genererte svar kan inneholde feil. Du er selv ansvarlig for å
            verifisere at chatbotens svar er korrekte og passende for dine
            kunder.
          </p>
        </section>

        <section>
          <h2>7. Oppsigelse</h2>
          <p>
            Du kan når som helst avslutte din konto. Vi forbeholder oss retten
            til å suspendere eller avslutte kontoer som bryter disse vilkårene.
            Ved oppsigelse slettes dine data i henhold til vår
            personvernerklæring.
          </p>
        </section>

        <section>
          <h2>8. Endringer i vilkårene</h2>
          <p>
            Vi kan oppdatere disse vilkårene ved behov. Vesentlige endringer vil
            bli varslet via e-post eller på nettsiden minst 30 dager før de trer
            i kraft. Fortsatt bruk av tjenesten etter endringer utgjør
            aksept av de oppdaterte vilkårene.
          </p>
        </section>

        <section>
          <h2>9. Lovvalg og verneting</h2>
          <p>
            Disse vilkårene er underlagt norsk lov. Eventuelle tvister skal
            løses ved Bergen tingrett.
          </p>
        </section>

        <section>
          <h2>10. Kontakt</h2>
          <p>
            Spørsmål om disse vilkårene kan rettes til{" "}
            <a
              href="mailto:post@chatpulse.no"
              className="text-primary underline"
            >
              post@chatpulse.no
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
