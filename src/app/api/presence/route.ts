import { getAuthenticatedClient } from "@/lib/supabase/api-auth";
import { createServiceClient } from "@/lib/supabase/service";
import { logError } from "@/lib/logger";
import { isValidUUID } from "@/lib/utils";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";

const putRateLimiter = createRateLimiter(20); // 20 status updates per minute per user

// PUT: Update agent status (authenticated)
export async function PUT(request: Request): Promise<Response> {
  const { supabase, user } = await getAuthenticatedClient(request);

  if (!user || !supabase) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!putRateLimiter.check(user.id)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
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

  if (!isValidUUID(workspaceId)) {
    return Response.json({ error: "Invalid workspaceId" }, { status: 400 });
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
    logError("Presence update", error);
    return Response.json({ error: "Failed to update presence" }, { status: 500 });
  }

  return Response.json({ ok: true, status });
}

const getRateLimiter = createRateLimiter(30); // 30 checks per minute per IP

// GET: Check if any agents are online for a workspace (public, uses service client)
export async function GET(request: Request): Promise<Response> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!getRateLimiter.check(ip)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return Response.json({ error: "Missing workspaceId" }, { status: 400 });
  }

  if (!isValidUUID(workspaceId)) {
    return Response.json({ error: "Invalid workspaceId" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Simple toggle check — status is set explicitly by agent
  const { data: agents, error } = await supabase
    .from("agent_presence")
    .select("user_id")
    .eq("workspace_id", workspaceId)
    .in("status", ["online", "busy"]);

  if (error) {
    logError("Presence check", error);
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
