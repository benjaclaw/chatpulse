import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { DashboardShell } from "@/components/dashboard/shell";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import type { MemberRole, WorkspaceMembership } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactNode> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's workspaces
  const { data: memberships } = await supabase
    .from("members")
    .select("workspace:workspaces(id, name, slug, language, plan_id, message_count, billing_cycle_start), role")
    .eq("user_id", user.id);

  if (!memberships || memberships.length === 0) {
    redirect("/onboarding");
  }

  const workspaces = (memberships as unknown as WorkspaceMembership[]).map((m) => ({
    ...m.workspace,
    role: m.role as MemberRole,
  }));

  // Check super_admin status for admin link
  const sb = createServiceClient();
  const { data: profile } = await sb
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  const isSuperAdmin = profile?.is_super_admin ?? false;

  return (
    <DashboardShell
      user={{ id: user.id, email: user.email!, name: user.user_metadata?.full_name, isSuperAdmin }}
      workspaces={workspaces}
    >
      <Suspense>
        <AnalyticsTracker />
      </Suspense>
      {children}
    </DashboardShell>
  );
}
