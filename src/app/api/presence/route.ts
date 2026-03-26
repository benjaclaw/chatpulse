import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

// PUT: Update agent status (authenticated)
export async function PUT(request: Request): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { workspaceId: string; status: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { workspaceId, status } = body;
  const validStatuses = ["online", "busy", "away", "offline"];
  if (!workspaceId || !status || !validStatuses.includes(status)) {
    return Response.json({ error: "Invalid workspaceId or status" }, { status: 400 });
  }

  // Verify user is a member of the workspace
  const { data: member } = await supabase
    .from("members")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("workspace_id", workspaceId)
    .single();

  if (!member) {
    return Response.json({ error: "Not a member of this workspace" }, { status: 403 });
  }

  const serviceClient = createServiceClient();
  const { error } = await serviceClient
    .from("agent_presence")
    .upsert({
      user_id: user.id,
      workspace_id: workspaceId,
      status,
      last_seen_at: new Date().toISOString(),
    }, { onConflict: "user_id,workspace_id" });

  if (error) {
    console.error("Presence update error:", error);
    return Response.json({ error: "Failed to update presence" }, { status: 500 });
  }

  return Response.json({ ok: true, status });
}

// GET: Check if any agents are online for a workspace (public, uses service client)
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return Response.json({ error: "Missing workspaceId" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Consider agents online if last_seen_at within 2 minutes
  const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();

  const { data: agents, error } = await supabase
    .from("agent_presence")
    .select("user_id")
    .eq("workspace_id", workspaceId)
    .in("status", ["online", "busy"])
    .gte("last_seen_at", twoMinAgo);

  if (error) {
    console.error("Presence check error:", error);
    return Response.json({ online: false, agentCount: 0 });
  }

  return Response.json(
    {
      online: (agents?.length ?? 0) > 0,
      agentCount: agents?.length ?? 0,
    },
    {
      headers: {
        "Cache-Control": "private, no-cache, max-age=0",
      },
    }
  );
}
