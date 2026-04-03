"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, ArrowRight, Lock, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { getRequiredPlan, type PlanFeature } from "@/lib/plans";

interface UpgradeBannerProps {
  /** Specific feature that requires upgrade (used in sub-pages) */
  feature?: string;
  /** Workspace ID (used for dashboard-level paywall) */
  workspaceId?: string;
}

export function UpgradeBanner({ feature, workspaceId }: UpgradeBannerProps): React.ReactNode {
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Dashboard-level paywall (no plan selected)
  if (workspaceId && !feature) {
    return (
      <div className="relative overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 p-6 shadow-lg">
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{t("upgrade.paywallTitle")}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {t("upgrade.paywallDescription")}
              </p>
            </div>
          </div>

          <Link
            href="/pricing"
            className={cn(
              buttonVariants({ size: "lg" }),
              "shrink-0 whitespace-nowrap"
            )}
          >
            {t("upgrade.seePlans")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Feature-specific upgrade banner
  const requiredPlan = feature ? getRequiredPlan(feature as PlanFeature) : null;

  return (
    <div className="rounded-xl border bg-muted/50 p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Lock className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-semibold">
        {t("upgrade.featureTitle")}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {requiredPlan
          ? t("upgrade.featureRequires").replace("{plan}", requiredPlan.name)
          : t("upgrade.featureGeneric")}
      </p>
      <Link
        href="/pricing"
        className={cn(buttonVariants({ size: "sm" }), "mt-4")}
      >
        {t("upgrade.upgradePlan")}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </div>
  );
}
