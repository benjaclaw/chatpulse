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
  Zap,
  Puzzle,
  MessageSquare,
  Building2,
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
        <section className="relative flex flex-col items-center justify-center px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-36">
          {/* Background blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
            <div className="absolute -bottom-20 right-1/4 h-[300px] w-[500px] rounded-full bg-accent/5 blur-3xl dark:bg-accent/10" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
              <Sparkles className="h-4 w-4 text-accent" />
              {t("landing.hero.badge")}
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t("landing.hero.title")}
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t("landing.hero.titleGradient")}
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              {t("landing.hero.description")}
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
              <Link
                href="/features"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full sm:w-auto"
                )}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {t("landing.header.features")}
              </Link>
            </div>

            <div className="mt-4">
              <GoogleHeroButton />
            </div>
          </div>

          {/* Animated widget mockup */}
          <div className="relative z-10 mx-auto mt-16 w-full max-w-sm animate-fade-in-up">
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-2xl" />
            <WidgetMockup t={t} />
          </div>
        </section>

        {/* ─── Features ─── */}
        <section
          id="features"
          className="scroll-mt-16 border-t bg-card/50 px-4 py-16 dark:bg-card/20 sm:px-6 sm:py-24"
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
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
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              {t("landing.steps.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              {t("landing.steps.description")}
            </p>

            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <StepCard
                step={1}
                icon={Plus}
                title={t("landing.steps.createTitle")}
                description={t("landing.steps.createDesc")}
              />
              <StepCard
                step={2}
                icon={Zap}
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
          className="scroll-mt-16 border-t px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              {t("landing.pricing.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              {t("landing.pricing.description")}
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <PricingCard
                name={t("landing.pricing.free")}
                price={t("landing.pricing.freePrice")}
                period={t("landing.pricing.perMonth")}
                description={t("landing.pricing.freeDesc")}
                features={[
                  t("landing.pricing.freeF1"),
                  t("landing.pricing.freeF2"),
                  t("landing.pricing.freeF3"),
                ]}
                cta={t("landing.pricing.freeCta")}
                ctaHref="/signup"
                popularLabel={t("landing.pricing.popular")}
              />
              <PricingCard
                name={t("landing.pricing.pro")}
                price={t("landing.pricing.proPrice")}
                period={t("landing.pricing.perMonth")}
                description={t("landing.pricing.proDesc")}
                features={[
                  t("landing.pricing.proF1"),
                  t("landing.pricing.proF2"),
                  t("landing.pricing.proF3"),
                ]}
                cta={t("landing.pricing.proCta")}
                ctaHref="/signup"
                highlighted
                popularLabel={t("landing.pricing.popular")}
              />
              <PricingCard
                name={t("landing.pricing.enterprise")}
                price={t("landing.pricing.enterprisePrice")}
                description={t("landing.pricing.enterpriseDesc")}
                features={[
                  t("landing.pricing.enterpriseF1"),
                  t("landing.pricing.enterpriseF2"),
                  t("landing.pricing.enterpriseF3"),
                ]}
                cta={t("landing.pricing.enterpriseCta")}
                ctaHref="mailto:kontakt@chatpulse.no"
                popularLabel={t("landing.pricing.popular")}
              />
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href="/pricing"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                {t("landing.pricing.viewAll")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="border-t bg-gradient-to-br from-primary/5 via-accent/5 to-background px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("landing.cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              {t("landing.cta.description")}
            </p>
            <div className="mt-8">
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
  popularLabel,
}: {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  popularLabel: string;
}): React.ReactNode {
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
          {popularLabel}
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
