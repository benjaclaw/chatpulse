import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

// GET: Check current user's presence status for a workspace (authenticated)
export async function GET(request: Request): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return Response.json({ error: "Missing workspaceId" }, { status: 400 });
  }

  const serviceClient = createServiceClient();
  const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();

  const { data } = await serviceClient
    .from("agent_presence")
    .select("status, last_seen_at")
    .eq("user_id", user.id)
    .eq("workspace_id", workspaceId)
    .single();

  const online =
    !!data &&
    ["online", "busy"].includes(data.status) &&
    data.last_seen_at >= twoMinAgo;

  return Response.json({ online });
}
