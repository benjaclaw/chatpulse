import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookiepolicy",
};

export default function CookiesPage(): React.ReactNode {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/"
        className="mb-8 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        &larr; Tilbake til forsiden
      </Link>

      <h1 className="mb-2 font-heading text-3xl font-bold">Cookiepolicy</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Sist oppdatert: 25. mars 2026
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-3">
        <section>
          <h2>Hva er informasjonskapsler?</h2>
          <p>
            Informasjonskapsler (cookies) er små tekstfiler som lagres på din
            enhet når du besøker en nettside. De brukes for å huske
            innstillinger, holde deg innlogget og forstå hvordan nettsiden
            brukes.
          </p>
        </section>

        <section>
          <h2>Nødvendige cookies</h2>
          <p>
            Disse er påkrevd for at nettsiden skal fungere og krever ikke
            samtykke.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b text-foreground">
                  <th className="py-2 pr-4 font-semibold">Navn</th>
                  <th className="py-2 pr-4 font-semibold">Formål</th>
                  <th className="py-2 font-semibold">Varighet</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4 font-mono text-xs">
                    sb-*-auth-token
                  </td>
                  <td className="py-2 pr-4">
                    Supabase autentiseringsøkt — holder deg innlogget
                  </td>
                  <td className="py-2">Sesjon / 1 år</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>Analyse-cookies</h2>
          <p>
            Disse brukes for å forstå hvordan besøkende bruker nettsiden. De
            settes kun dersom du godtar analyse-cookies.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b text-foreground">
                  <th className="py-2 pr-4 font-semibold">Navn</th>
                  <th className="py-2 pr-4 font-semibold">Formål</th>
                  <th className="py-2 font-semibold">Varighet</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4 font-mono text-xs">_ga</td>
                  <td className="py-2 pr-4">
                    Google Analytics — skiller brukere
                  </td>
                  <td className="py-2">2 år</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4 font-mono text-xs">_gid</td>
                  <td className="py-2 pr-4">
                    Google Analytics — skiller brukere (24t)
                  </td>
                  <td className="py-2">24 timer</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>Preferanse-cookies</h2>
          <p>Disse husker valgene dine, for eksempel språk.</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b text-foreground">
                  <th className="py-2 pr-4 font-semibold">Navn</th>
                  <th className="py-2 pr-4 font-semibold">Formål</th>
                  <th className="py-2 font-semibold">Varighet</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4 font-mono text-xs">
                    chatpulse-lang
                  </td>
                  <td className="py-2 pr-4">Ditt foretrukne språk</td>
                  <td className="py-2">1 år</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>Administrere cookies</h2>
          <p>
            Du kan endre dine cookie-preferanser når som helst ved å slette
            cookies i nettleseren din. De fleste nettlesere lar deg også blokkere
            cookies helt. Merk at blokkering av nødvendige cookies kan påvirke
            funksjonaliteten til nettsiden.
          </p>
          <p>Slik sletter du cookies i vanlige nettlesere:</p>
          <ul className="space-y-2">
            <li>
              <strong>Chrome:</strong> Innstillinger &rarr; Personvern og
              sikkerhet &rarr; Slett nettleserdata
            </li>
            <li>
              <strong>Firefox:</strong> Innstillinger &rarr; Personvern og
              sikkerhet &rarr; Informasjonskapsler og nettstedsdata
            </li>
            <li>
              <strong>Safari:</strong> Innstillinger &rarr; Personvern &rarr;
              Administrer nettstedsdata
            </li>
          </ul>
        </section>

        <section>
          <h2>Kontakt</h2>
          <p>
            Har du spørsmål om vår bruk av cookies? Kontakt oss på{" "}
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
