"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  Upload,
  Sparkles,
  TestTube,
  Code2,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createT, type Language } from "@/lib/i18n";

export function PricingContent(): React.ReactNode {
  const [language] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("chatpulse_lang") as Language) || "nb";
    }
    return "nb";
  });
  const t = createT(language);

  return (
    <>
      {/* ─── Monthly Plans ─── */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {t("pricing.title")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              {t("pricing.subtitle")}
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <PlanCard
              name={t("pricing.basicName")}
              price={t("pricing.basicPrice")}
              period={t("pricing.perMonth")}
              features={[
                t("pricing.basicF1"),
                t("pricing.basicF2"),
                t("pricing.basicF3"),
                t("pricing.basicF4"),
              ]}
              cta={t("pricing.basicCta")}
              ctaHref="/signup"
            />
            <PlanCard
              name={t("pricing.startupName")}
              price={t("pricing.startupPrice")}
              period={t("pricing.perMonth")}
              popular
              popularLabel={t("pricing.popular")}
              features={[
                t("pricing.startupF2"),
                t("pricing.startupF3"),
                t("pricing.startupF4"),
                t("pricing.startupF5"),
                t("pricing.startupF6"),
              ]}
              cta={t("pricing.startupCta")}
              ctaHref="/signup"
            />
            <PlanCard
              name={t("pricing.proName")}
              price={t("pricing.proPrice")}
              period={t("pricing.perMonth")}
              features={[
                t("pricing.proF2"),
                t("pricing.proF3"),
                t("pricing.proF4"),
                t("pricing.proF5"),
                t("pricing.proF6"),
                t("pricing.proF7"),
              ]}
              cta={t("pricing.proCta")}
              ctaHref="/signup"
            />
          </div>
        </div>
      </section>

      {/* ─── Ready-to-Go Setup ─── */}
      <section
        id="setup"
        className="scroll-mt-16 border-t bg-card/50 px-4 py-16 dark:bg-card/20 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
              <Sparkles className="h-4 w-4 text-accent" />
              {t("pricing.setupBadge")}
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("pricing.setupTitle")}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              {t("pricing.setupSubtitle")}
            </p>
          </div>

          <div className="mt-12 rounded-xl border bg-card p-6 shadow-sm sm:p-8">
            <h3 className="mb-6 text-lg font-semibold">
              {t("pricing.setupIncluded")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <SetupFeature icon={Upload} text={t("pricing.setupI1")} />
              <SetupFeature icon={Sparkles} text={t("pricing.setupI2")} />
              <SetupFeature icon={TestTube} text={t("pricing.setupI3")} />
              <SetupFeature icon={Code2} text={t("pricing.setupI4")} />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {t("pricing.setupIncludedInPro")}
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold">{t("pricing.diyTitle")}</h3>
              <p className="mt-1 text-2xl font-bold">{t("pricing.diyPrice")}</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {t("pricing.diyF1")}
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {t("pricing.diyF2")}
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {t("pricing.diyF3")}
                </li>
              </ul>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "mt-8 w-full"
                )}
              >
                {t("pricing.diyCta")}
              </Link>
            </div>
            <div className="rounded-xl border-2 border-primary bg-card p-6 shadow-lg ring-1 ring-primary/20">
              <h3 className="text-lg font-semibold">{t("pricing.rtgTitle")}</h3>
              <p className="mt-1 text-2xl font-bold">{t("pricing.rtgPrice")}</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {t("pricing.rtgF1")}
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {t("pricing.rtgF2")}
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {t("pricing.rtgF3")}
                </li>
              </ul>
              <a
                href="mailto:post@chatpulse.no"
                className={cn(buttonVariants({ size: "lg" }), "mt-8 w-full")}
              >
                {t("pricing.rtgCta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="border-t px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            {t("pricing.faqTitle")}
          </h2>
          <div className="mt-12 space-y-6">
            <FaqItem question={t("pricing.faq1Q")} answer={t("pricing.faq1A")} />
            <FaqItem question={t("pricing.faq2Q")} answer={t("pricing.faq2A")} />
            <FaqItem question={t("pricing.faq3Q")} answer={t("pricing.faq3A")} />
            <FaqItem question={t("pricing.faq4Q")} answer={t("pricing.faq4A")} />
          </div>
        </div>
      </section>
    </>
  );
}

function PlanCard({
  name,
  price,
  period,
  features,
  cta,
  ctaHref,
  popular = false,
  popularLabel,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  ctaHref: string;
  popular?: boolean;
  popularLabel?: string;
}): React.ReactNode {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border p-6 transition-all duration-200",
        popular
          ? "border-primary bg-card shadow-lg ring-1 ring-primary/20"
          : "bg-card shadow-sm hover:shadow-md"
      )}
    >
      {popular && popularLabel && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-white">
          {popularLabel}
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold">{name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight">{price}</span>
          <span className="text-sm text-muted-foreground">{period}</span>
        </div>
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
            variant: popular ? "default" : "outline",
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

function SetupFeature({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}): React.ReactNode {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm">{text}</span>
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
    <div className="rounded-lg border bg-card p-5">
      <h3 className="font-semibold">{question}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{answer}</p>
    </div>
  );
}
