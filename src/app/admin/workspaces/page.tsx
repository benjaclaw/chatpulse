import { createServiceClient } from "@/lib/supabase/service";
import { WorkspacesTable } from "./workspaces-table";
import type { AdminWorkspace } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminWorkspacesPage(): Promise<React.ReactNode> {
  const supabase = createServiceClient();

  // Fetch workspaces and members separately to avoid nested join issues with service client
  const { data: workspacesData } = await supabase
    .from("workspaces")
    .select("id, name, slug, plan_id, message_count, created_at")
    .order("created_at", { ascending: false });

  const { data: membersData } = await supabase
    .from("members")
    .select("id, user_id, workspace_id, role");

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, email");

  const profileMap = new Map((profilesData ?? []).map((p: { id: string; email: string }) => [p.id, p.email]));

  const workspaces: AdminWorkspace[] = (workspacesData ?? []).map((ws: Record<string, unknown>) => {
    const wsMembers = (membersData ?? []).filter((m: { workspace_id: string }) => m.workspace_id === ws.id);
    return {
      id: ws.id as string,
      name: ws.name as string,
      slug: ws.slug as string,
      plan_id: (ws.plan_id as string) || "free",
      message_count: (ws.message_count as number) || 0,
      member_count: wsMembers.length,
      created_at: ws.created_at as string,
      members: wsMembers.map((m: { id: string; user_id: string; role: string }) => {
        const email = profileMap.get(m.user_id) ?? "";
        return {
          id: m.id,
          name: email.split("@")[0] || "Unknown",
          email,
          role: m.role,
        };
      }),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
        <p className="mt-1 text-muted-foreground">
          Alle workspaces på plattformen.
        </p>
      </div>
      <WorkspacesTable workspaces={workspaces} />
    </div>
  );
}
