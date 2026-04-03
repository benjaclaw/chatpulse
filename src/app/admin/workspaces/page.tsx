import { createServiceClient } from "@/lib/supabase/service";
import { WorkspacesTable } from "./workspaces-table";
import type { AdminWorkspace } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminWorkspacesPage(): Promise<React.ReactNode> {
  const supabase = createServiceClient();

  const { data: workspacesData } = await supabase
    .from("workspaces")
    .select("id, name, slug, plan_id, message_count, created_at, members(id, user_id, role, profiles(email))")
    .order("created_at", { ascending: false });

  const workspaces: AdminWorkspace[] = (workspacesData ?? []).map((ws: Record<string, unknown>) => {
    const members = (ws.members as Array<{ id: string; user_id: string; role: string; profiles: { email: string } | null }>) ?? [];
    return {
      id: ws.id as string,
      name: ws.name as string,
      slug: ws.slug as string,
      plan_id: (ws.plan_id as string) || "free",
      message_count: (ws.message_count as number) || 0,
      member_count: members.length,
      created_at: ws.created_at as string,
      members: members.map((m) => {
        const email = m.profiles?.email ?? "";
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
