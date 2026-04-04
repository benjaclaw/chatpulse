"use client";

import { useState } from "react";
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
  Puzzle,
  Building2,
  Shield,
  Server,
  Headset,
  Clock,
  ChevronDown,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createT, type Language } from "@/lib/i18n";
import { LandingHeader } from "./header";
import { LandingFooter } from "./footer";
import { GoogleHeroButton } from "@/components/auth/google-sign-in-button";

export function HomePage(): React.ReactNode {
  const [language] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("chatpulse_lang") as Language) || "nb";
    }
    return "nb";
  });
  const t = createT(language);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />

      <main className="flex flex-1 flex-col">
        {/* ─── Hero ─── */}
        <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-36">
          {/* Background blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
            <div className="absolute -bottom-20 right-1/4 h-[300px] w-[500px] rounded-full bg-accent/5 blur-3xl dark:bg-accent/10" />
            <div className="absolute left-1/4 top-1/3 h-[200px] w-[300px] rounded-full bg-primary/3 blur-3xl animate-pulse-glow" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl">
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t("landing.hero.title")}
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t("landing.hero.titleGradient")}
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              {t("landing.hero.description")}
            </p>

            <p className="mx-auto mt-3 text-sm font-medium tracking-wide text-primary/80">
              {t("landing.hero.stats")}
            </p>

            <div className="mt-10 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto"
                )}
              >
                {t("landing.hero.cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

            </div>

            <div className="mt-4">
              <GoogleHeroButton />
            </div>
          </div>

          {/* Animated widget mockup */}
          <div className="relative z-10 mx-auto mt-16 w-full max-w-sm animate-fade-in-up">
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-2xl animate-pulse-glow" />
            <div className="animate-float">
              <WidgetMockup t={t} />
            </div>
          </div>
        </section>



        {/* ─── Features ─── */}
        <section
          id="features"
          className="scroll-mt-16 border-t bg-card/50 px-4 py-16 dark:bg-card/20 sm:px-6 sm:py-24"
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="font-heading text-center text-2xl font-bold tracking-tight sm:text-3xl">
              {t("landing.features.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              {t("landing.features.description")}
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={BookOpen}
                title={t("landing.features.knowledge")}
                description={t("landing.features.knowledgeDesc")}
              />
              <FeatureCard
                icon={Code2}
                title={t("landing.features.integration")}
                description={t("landing.features.integrationDesc")}
              />
              <FeatureCard
                icon={Palette}
                title={t("landing.features.customization")}
                description={t("landing.features.customizationDesc")}
              />
              <FeatureCard
                icon={BarChart3}
                title={t("landing.features.insights")}
                description={t("landing.features.insightsDesc")}
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
            <h2 className="font-heading text-center text-2xl font-bold tracking-tight sm:text-3xl">
              {t("landing.steps.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              {t("landing.steps.description")}
            </p>

            <div className="relative mt-12 grid gap-8 sm:grid-cols-3">
              <StepCard
                step={1}
                icon={Plus}
                title={t("landing.steps.createTitle")}
                description={t("landing.steps.createDesc")}
              />
              <StepCard
                step={2}
                icon={BookOpen}
                title={t("landing.steps.customizeTitle")}
                description={t("landing.steps.customizeDesc")}
              />
              <StepCard
                step={3}
                icon={Puzzle}
                title={t("landing.steps.embedTitle")}
                description={t("landing.steps.embedDesc")}
              />
            </div>
          </div>
        </section>

        {/* ─── Pricing ─── */}
        <section
          id="pricing"
          className="scroll-mt-16 border-t bg-card/50 px-4 py-16 dark:bg-card/20 sm:px-6 sm:py-24"
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="font-heading text-center text-2xl font-bold tracking-tight sm:text-3xl">
              {t("landing.pricing.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              {t("landing.pricing.description")}
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Basic */}
              <div className="flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md">
                <h3 className="text-lg font-semibold">
                  {t("pricing.basicName")}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight">
                    {t("pricing.basicPriceAnnual")}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t("pricing.perMonth")}
                  </span>
                </div>
                <ul className="mt-6 flex-1 space-y-2.5">
                  <PricingFeature text={t("pricing.basicF1")} />
                  <PricingFeature text={t("pricing.basicF2")} />
                  <PricingFeature text={t("pricing.basicF3")} />
                </ul>
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "mt-8 w-full"
                  )}
                >
                  {t("pricing.basicCta")}
                </Link>
              </div>

              {/* Starter (popular) */}
              <div
                className="relative flex flex-col rounded-xl border-0 bg-card p-6 shadow-lg transition-all duration-200"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--card), var(--card)), linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.4), hsl(var(--primary)))",
                  backgroundOrigin: "border-box",
                  backgroundClip: "padding-box, border-box",
                  border: "2px solid transparent",
                }}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white shadow-md">
                  {t("pricing.popular")}
                </div>
                <h3 className="text-lg font-semibold">
                  {t("pricing.startupName")}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight">
                    {t("pricing.startupPriceAnnual")}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t("pricing.perMonth")}
                  </span>
                </div>
                <ul className="mt-6 flex-1 space-y-2.5">
                  <PricingFeature text={t("pricing.startupF1")} />
                  <PricingFeature text={t("pricing.startupF2")} />
                  <PricingFeature text={t("pricing.startupF3")} />
                </ul>
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "mt-8 w-full"
                  )}
                >
                  {t("pricing.startupCta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>

              {/* Pro */}
              <div className="flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md">
                <h3 className="text-lg font-semibold">
                  {t("pricing.proName")}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight">
                    {t("pricing.proPriceAnnual")}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t("pricing.perMonth")}
                  </span>
                </div>
                <ul className="mt-6 flex-1 space-y-2.5">
                  <PricingFeature text={t("pricing.proF1")} />
                  <PricingFeature text={t("pricing.proF2")} />
                  <PricingFeature text={t("pricing.proF3")} />
                </ul>
                <Link
                  href="/pricing"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "mt-8 w-full"
                  )}
                >
                  {t("pricing.proCta")}
                </Link>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link href="/pricing" className="text-primary hover:underline">
                {t("landing.pricing.viewAll")}
              </Link>
            </p>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="scroll-mt-16 border-t px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-center text-2xl font-bold tracking-tight sm:text-3xl">
              {t("landing.faq.title")}
            </h2>
            <div className="mt-10 space-y-3">
              <FaqItem question={t("landing.faq.q1")} answer={t("landing.faq.a1")} />
              <FaqItem question={t("landing.faq.q2")} answer={t("landing.faq.a2")} />
              <FaqItem question={t("landing.faq.q3")} answer={t("landing.faq.a3")} />
              <FaqItem question={t("landing.faq.q4")} answer={t("landing.faq.a4")} />
              <FaqItem question={t("landing.faq.q5")} answer={t("landing.faq.a5")} />
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="relative overflow-hidden border-t px-4 py-16 sm:px-6 sm:py-24">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" />
          <div className="pointer-events-none absolute -top-20 -left-20 h-[200px] w-[200px] rounded-full bg-accent/5 blur-3xl" />

          <div className="relative mx-auto max-w-2xl text-center">
            <Building2 className="mx-auto mb-4 h-10 w-10 text-primary/60" />
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              {t("landing.cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              {t("landing.cta.description")}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/signup"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                {t("landing.cta.button")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

/* ─── Sub-components ─── */

function WidgetMockup({
  t,
}: {
  t: (key: string) => string;
}): React.ReactNode {
  return (
    <div className="relative rounded-xl border bg-card p-0 shadow-lg">
      {/* Header bar */}
      <div className="flex items-center gap-2 rounded-t-xl bg-primary px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-white">
          {t("landing.widget.botName")}
        </span>
        <span className="ml-auto flex h-2 w-2 rounded-full bg-green-400" />
      </div>
      {/* Messages with staggered animation */}
      <div className="space-y-3 p-4">
        <div
          className="max-w-[75%] rounded-2xl rounded-bl-md bg-muted px-4 py-2 text-sm animate-fade-in-up"
          style={{ animationDelay: "0.2s", animationFillMode: "both" }}
        >
          {t("landing.widget.greeting")}
        </div>
        <div
          className="ml-auto max-w-[75%] rounded-2xl rounded-br-md bg-primary px-4 py-2 text-sm text-white animate-fade-in-up"
          style={{ animationDelay: "0.6s", animationFillMode: "both" }}
        >
          {t("landing.widget.userMsg")}
        </div>
        <div
          className="max-w-[75%] rounded-2xl rounded-bl-md bg-muted px-4 py-2 text-sm animate-fade-in-up"
          style={{ animationDelay: "1s", animationFillMode: "both" }}
        >
          {t("landing.widget.botReply")}
        </div>
      </div>
      {/* Input */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground">
          {t("landing.widget.placeholder")}
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
}): React.ReactNode {
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
}): React.ReactNode {
  return (
    <div className="relative z-10 text-center">
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

function PricingFeature({ text }: { text: string }): React.ReactNode {
  return (
    <li className="flex items-start gap-2 text-sm">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      {text}
    </li>
  );
}

function TrustBadge({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}): React.ReactNode {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 text-primary/70" />
      <span>{text}</span>
    </div>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}): React.ReactNode {
  return (
    <details className="group rounded-lg border bg-card transition-shadow hover:shadow-sm">
      <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
        {question}
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
        {answer}
      </div>
    </details>
  );
}
