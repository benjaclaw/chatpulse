import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/shell";
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
    redirect("/create-workspace");
  }

  const workspaces = (memberships as unknown as WorkspaceMembership[]).map((m) => ({
    ...m.workspace,
    role: m.role as MemberRole,
  }));

  return (
    <DashboardShell
      user={{ id: user.id, email: user.email!, name: user.user_metadata?.full_name }}
      workspaces={workspaces}
    >
      {children}
    </DashboardShell>
  );
}
