"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { getRequiredPlan, type PlanFeature } from "@/lib/plans";

export function UpgradeBanner({ feature }: { feature: PlanFeature }): React.ReactNode {
  const { t } = useLanguage();
  const required = getRequiredPlan(feature);

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3 dark:border-primary/30 dark:bg-primary/10">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
        <Lock className="h-4 w-4 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground flex-1">
        {t('plans.upgradeBanner', { plan: required.name })}
      </p>
      <Link
        href="/dashboard/settings"
        className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {t('plans.upgrade')}
      </Link>
    </div>
  );
}
