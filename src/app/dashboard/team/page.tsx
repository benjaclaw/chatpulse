import { Suspense } from "react";
import { TeamPageClient } from "@/components/dashboard/team-page";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Team — ChatPulse",
};

export default function TeamPage(): React.ReactNode {
  return (
    <Suspense>
      <TeamPageClient />
    </Suspense>
  );
}
