"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { getRequiredPlan, type PlanFeature } from "@/lib/plans";

export function UpgradeBanner({ feature }: { feature: PlanFeature }): React.ReactNode {
  const { t } = useLanguage();
  const required = getRequiredPlan(feature);

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3">
      <Lock className="h-4 w-4 text-primary shrink-0" />
      <p className="text-sm text-muted-foreground flex-1">
        {t('plans.upgradeBanner', { plan: required.name })}
      </p>
      <Link
        href="/dashboard/settings"
        className="text-sm font-medium text-primary hover:underline shrink-0"
      >
        {t('plans.upgrade')}
      </Link>
    </div>
  );
}
