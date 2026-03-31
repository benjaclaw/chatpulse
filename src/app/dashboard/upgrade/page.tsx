import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PricingContent } from "@/components/pricing/pricing-content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Oppgrader plan",
};

export default function UpgradePage(): React.ReactNode {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Tilbake til innstillinger
      </Link>
      <Suspense>
        <PricingContent />
      </Suspense>
    </div>
  );
}
