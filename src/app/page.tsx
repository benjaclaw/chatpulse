"use client";

import Link from "next/link";
import {
  BookOpen,
  Palette,
  BarChart3,
  Code2,
  Sparkles,
  ArrowRight,
  Check,
  Plus,
  Zap,
  Puzzle,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
        <span className="font-heading text-xl font-bold text-primary">
          ChatPulse
        </span>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            Logg inn
          </Link>
          <Link href="/signup" className={cn(buttonVariants())}>
            Kom i gang
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* ─── Hero ─── */}
        <section className="relative flex flex-col items-center justify-center px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-36">
          {/* Background blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
            <div className="absolute -bottom-20 right-1/4 h-[300px] w-[500px] rounded-full bg-accent/5 blur-3xl dark:bg-accent/10" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
              <Sparkles className="h-4 w-4 text-accent" />
              AI-drevet kundeservice
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              AI-chatbot for din bedrift
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                — klar på minutter
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Tren chatboten med din kunnskapsbase. Embed på nettsiden. Se hva
              kundene spør om.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/signup"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Kom i gang gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" })
                )}
              >
                Se hvordan det fungerer
              </a>
            </div>
          </div>

          {/* Widget mockup illustration */}
          <div className="relative z-10 mx-auto mt-16 w-full max-w-sm">
            <WidgetMockup />
          </div>
        </section>

        {/* ─── Features ─── */}
        <section className="border-t bg-card/50 px-4 py-16 dark:bg-card/20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Alt du trenger for smart kundeservice
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              Fra kunnskapsbase til live widget — ChatPulse gir deg full
              kontroll.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={BookOpen}
                title="Kunnskapsbase"
                description="Last opp dokumenter og FAQ. Chatboten lærer automatisk."
              />
              <FeatureCard
                icon={Palette}
                title="Tilpasning"
                description="Dine farger, din logo, din velkomstmelding."
              />
              <FeatureCard
                icon={BarChart3}
                title="Innsikt"
                description="Se hva kundene spør om. Finn hull i dokumentasjonen."
              />
              <FeatureCard
                icon={Code2}
                title="Enkel integrasjon"
                description="Én kodelinje. Fungerer på alle nettsider."
              />
            </div>
          </div>
        </section>

        {/* ─── How it works ─── */}
        <section
          id="how-it-works"
          className="scroll-mt-16 border-t px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Tre enkle steg
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              Fra opprettelse til live chatbot på under 10 minutter.
            </p>

            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <StepCard
                step={1}
                icon={Plus}
                title="Opprett"
                description="Opprett workspace og last opp kunnskapsbase."
              />
              <StepCard
                step={2}
                icon={Zap}
                title="Tilpass"
                description="Tilpass chatboten til din merkevare."
              />
              <StepCard
                step={3}
                icon={Puzzle}
                title="Embed"
                description="Embed på nettsiden med én kodelinje."
              />
            </div>
          </div>
        </section>

        {/* ─── Pricing ─── */}
        <section className="border-t bg-card/50 px-4 py-16 dark:bg-card/20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Enkel og forutsigbar prising
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              Start gratis. Oppgrader når du vokser.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <PricingCard
                name="Free"
                price="0 kr"
                period="/mnd"
                description="Perfekt for å prøve ChatPulse"
                features={[
                  "1 chatbot",
                  "100 meldinger/mnd",
                  "50 kunnskapsbaser",
                ]}
                cta="Kom i gang"
                ctaHref="/signup"
              />
              <PricingCard
                name="Pro"
                price="499 kr"
                period="/mnd"
                description="For bedrifter som trenger mer"
                features={[
                  "5 chatbots",
                  "Ubegrenset meldinger",
                  "Priority support",
                ]}
                cta="Oppgrader"
                ctaHref="/signup"
                highlighted
              />
              <PricingCard
                name="Enterprise"
                price="Custom"
                description="For store organisasjoner"
                features={[
                  "Ubegrenset chatbots",
                  "SLA-garanti",
                  "Dedikert support",
                ]}
                cta="Kontakt oss"
                ctaHref="mailto:salg@chatpulse.no"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <span className="font-heading text-lg font-bold text-primary">
            ChatPulse
          </span>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a
              href="https://github.com/benjaclaw/chatpulse"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </a>
            <Link
              href="/privacy"
              className="transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <span>
              &copy; {new Date().getFullYear()} ChatPulse
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-components ─── */

function WidgetMockup() {
  return (
    <div className="rounded-xl border bg-card p-0 shadow-lg">
      {/* Header bar */}
      <div className="flex items-center gap-2 rounded-t-xl bg-primary px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-white">
          ChatPulse Bot
        </span>
      </div>
      {/* Messages */}
      <div className="space-y-3 p-4">
        <div className="max-w-[75%] rounded-2xl rounded-bl-md bg-muted px-4 py-2 text-sm">
          Hei! Hvordan kan jeg hjelpe?
        </div>
        <div className="ml-auto max-w-[75%] rounded-2xl rounded-br-md bg-primary px-4 py-2 text-sm text-white">
          Hva er leveringstiden?
        </div>
        <div className="max-w-[75%] rounded-2xl rounded-bl-md bg-muted px-4 py-2 text-sm">
          Standard frakt tar 3-5 virkedager. Ekspress leverer på 1-2 dager!
        </div>
      </div>
      {/* Input */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground">
          Skriv en melding...
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:hover:border-primary/20">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function StepCard({
  step,
  icon: Icon,
  title,
  description,
}: {
  step: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="relative text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div className="absolute -top-2 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
        {step}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  ctaHref,
  highlighted = false,
}: {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border p-6 transition-all duration-200",
        highlighted
          ? "border-primary bg-card shadow-lg ring-1 ring-primary/20"
          : "bg-card shadow-sm hover:shadow-md"
      )}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-white">
          Populær
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold">{name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight">{price}</span>
          {period && (
            <span className="text-sm text-muted-foreground">{period}</span>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <ul className="mt-6 flex-1 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={cn(
          buttonVariants({
            variant: highlighted ? "default" : "outline",
            size: "lg",
          }),
          "mt-8 w-full"
        )}
      >
        {cta}
      </Link>
    </div>
  );
}
