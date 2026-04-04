import { createServiceClient } from "@/lib/supabase/service";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function GET(request: Request): Promise<Response> {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || !authHeader || !safeCompare(authHeader, `Bearer ${cronSecret}`)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Check for profiles created in the last 20 minutes
  const since = new Date(Date.now() - 20 * 60 * 1000).toISOString();

  const { data: newProfiles, error } = await supabase
    .from("profiles")
    .select("id, email, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!newProfiles || newProfiles.length === 0) {
    return Response.json({ new_signups: 0 });
  }

  // For each new user, check if they have a workspace
  const signups = [];
  for (const profile of newProfiles) {
    const { data: memberships } = await supabase
      .from("members")
      .select("workspace:workspaces(name, plan_id)")
      .eq("user_id", profile.id)
      .limit(1);

    const ws = (memberships?.[0] as unknown as { workspace: { name: string; plan_id: string } })?.workspace;

    signups.push({
      email: profile.email,
      created_at: profile.created_at,
      workspace: ws?.name ?? null,
      plan: ws?.plan_id ?? null,
    });
  }

  return Response.json({ new_signups: signups.length, signups });
}
