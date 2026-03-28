import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendBroadcast } from "@/lib/supabase/broadcast";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { conversationId: string; workspaceId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { conversationId, workspaceId } = body;
  if (!conversationId) {
    return Response.json({ error: "Missing conversationId" }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // Always fetch the conversation to verify workspace membership
  const { data: conv, error: checkError } = await serviceClient
    .from("conversations")
    .select("id, workspace_id")
    .eq("id", conversationId)
    .single();

  if (checkError || !conv) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  // Verify user is a member of the conversation's workspace
  const { data: member } = await supabase
    .from("members")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("workspace_id", conv.workspace_id)
    .single();

  if (!member) {
    return Response.json({ error: "Not a member of this workspace" }, { status: 403 });
  }

  const assignTo = user.id;

  // Update conversation — only if still waiting (race condition guard)
  const { data: updated, error: convError } = await serviceClient
    .from("conversations")
    .update({ status: "human", assigned_to: assignTo })
    .eq("id", conversationId)
    .eq("status", "waiting")
    .select("id");

  if (convError) {
    logError("Claim conversation", convError);
    return Response.json({ error: "Failed to claim" }, { status: 500 });
  }

  if (!updated || updated.length === 0) {
    return Response.json({ error: "Conversation already claimed or not in waiting state" }, { status: 409 });
  }

  // Create assignment record (if user is authenticated)
  if (user) {
    await serviceClient
      .from("agent_assignments")
      .insert({
        conversation_id: conversationId,
        agent_id: user.id,
      });
  }

  // Get agent name for widget notification
  let agentName: string | null = null;
  if (user) {
    const { data: { user: fullUser } } = await supabase.auth.getUser();
    agentName = fullUser?.user_metadata?.full_name || fullUser?.user_metadata?.name || null;
  }

  // Broadcast status change to widget with agent name
  await sendBroadcast(`conv-status-${conversationId}`, "status-change", {
    status: "human",
    agentName,
  });

  return Response.json({ ok: true });
}
