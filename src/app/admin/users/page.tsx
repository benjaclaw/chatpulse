import { createServiceClient } from "@/lib/supabase/service";
import { UsersTable } from "./users-table";
import type { AdminUser, MemberRole } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage(): Promise<React.ReactNode> {
  const supabase = createServiceClient();

  // Fetch separately to avoid nested join issues with service client
  const { data: members } = await supabase
    .from("members")
    .select("id, user_id, workspace_id, role, created_at");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, is_super_admin, created_at");

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name");

  const profileMap = new Map((profiles ?? []).map((p: { id: string; email: string; is_super_admin: boolean; created_at: string }) => [p.id, p]));
  const wsMap = new Map((workspaces ?? []).map((w: { id: string; name: string }) => [w.id, w]));

  const users: AdminUser[] = (members ?? []).map((m: { id: string; user_id: string; workspace_id: string; role: string; created_at: string }) => {
    const profile = profileMap.get(m.user_id);
    const workspace = wsMap.get(m.workspace_id);
    const email = profile?.email ?? "";
    return {
      id: m.user_id,
      name: email.split("@")[0] || "Unknown",
      email,
      role: m.role as MemberRole,
      is_super_admin: profile?.is_super_admin ?? false,
      workspace_id: workspace?.id ?? "",
      workspace_name: workspace?.name ?? "",
      created_at: profile?.created_at ?? m.created_at,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Brukere</h1>
        <p className="mt-1 text-muted-foreground">
          Alle registrerte brukere på plattformen.
        </p>
      </div>
      <UsersTable users={users} />
    </div>
  );
}
