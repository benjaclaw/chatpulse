import { createClient } from "@/lib/supabase/server";
import { UsersTable } from "./users-table";
import type { AdminUser, MemberRole } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage(): Promise<React.ReactNode> {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("members")
    .select("id, user_id, role, created_at, profiles(email, is_super_admin, created_at), workspaces(id, name)");

  const users: AdminUser[] = (members ?? []).map((m: Record<string, unknown>) => {
    const profile = m.profiles as { email: string; is_super_admin: boolean; created_at: string } | null;
    const workspace = m.workspaces as { id: string; name: string } | null;
    const email = profile?.email ?? "";
    return {
      id: m.user_id as string,
      name: email.split("@")[0] || "Ukjent",
      email,
      role: m.role as MemberRole,
      is_super_admin: profile?.is_super_admin ?? false,
      workspace_id: workspace?.id ?? "",
      workspace_name: workspace?.name ?? "",
      created_at: profile?.created_at ?? (m.created_at as string),
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
