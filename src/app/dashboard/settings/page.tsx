import { Suspense } from "react";
import { SettingsPageClient } from "@/components/dashboard/settings-page";

export const metadata = {
  title: "Innstillinger",
};

export default function SettingsPage(): React.ReactNode {
  return (
    <Suspense>
      <SettingsPageClient />
    </Suspense>
  );
}
