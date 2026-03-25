import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { LanguageProvider } from "@/lib/i18n/context";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Onboarding — ChatPulse",
};

export default async function OnboardingPage(): Promise<React.ReactNode> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user already has a workspace
  const { data: memberships } = await supabase
    .from("members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1);

  if (memberships && memberships.length > 0) {
    redirect("/dashboard");
  }

  return (
    <LanguageProvider>
      <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
        </div>
        <div className="relative z-10 w-full py-8">
          <OnboardingWizard userEmail={user.email} />
        </div>
      </div>
    </LanguageProvider>
  );
}
