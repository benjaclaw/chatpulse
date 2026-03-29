"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { getRequiredPlan, type PlanFeature } from "@/lib/plans";

export function UpgradeBanner({ feature }: { feature: PlanFeature }): React.ReactNode {
  const { t } = useLanguage();
  const required = getRequiredPlan(feature);

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5 flex items-center gap-3 transition-colors duration-200 hover:bg-primary/8 dark:border-primary/30 dark:bg-primary/10">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20">
        <Lock className="h-4 w-4 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground flex-1">
        {t('plans.upgradeBanner', { plan: required.name })}
      </p>
      <Link
        href="/dashboard/settings"
        className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/10 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {t('plans.upgrade')}
      </Link>
    </div>
  );
}
