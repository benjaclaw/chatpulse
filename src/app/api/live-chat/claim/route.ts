import { getAuthenticatedClient } from "@/lib/supabase/api-auth";
import { createServiceClient } from "@/lib/supabase/service";
import { sendBroadcast } from "@/lib/supabase/broadcast";
import { logError } from "@/lib/logger";
import { isValidUUID } from "@/lib/utils";
import { createRateLimiter } from "@/lib/rate-limit";
import { parseJsonBody, checkRateLimit, requireWorkspaceMember } from "@/lib/api-helpers";

export const runtime = "nodejs";

const rateLimiter = createRateLimiter(20); // 20 claims per minute per user

export async function POST(request: Request): Promise<Response> {
  const { supabase, user } = await getAuthenticatedClient(request);

  if (!user || !supabase) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimited = checkRateLimit(rateLimiter, user.id);
  if (rateLimited) return rateLimited;

  const result = await parseJsonBody<{ conversationId: string; workspaceId?: string }>(request);
  if (result instanceof Response) return result;
  const body = result;

  const { conversationId } = body;
  if (!conversationId) {
    return Response.json({ error: "Missing conversationId" }, { status: 400 });
  }

  if (!isValidUUID(conversationId)) {
    return Response.json({ error: "Invalid conversationId" }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // Always fetch the conversation to verify workspace membership
  const { data: conv, error: checkError } = await serviceClient
    .from("conversations")
    .select("id, workspace_id")
    .eq("id", conversationId)
    .is("deleted_at", null)
    .single();

  if (checkError || !conv) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  const memberCheck = await requireWorkspaceMember(supabase, user.id, conv.workspace_id);
  if (memberCheck) return memberCheck;

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

  // Create assignment record
  await serviceClient
    .from("agent_assignments")
    .insert({
      conversation_id: conversationId,
      agent_id: user.id,
    });

  // Get agent name for widget notification
  const { data: { user: fullUser } } = await supabase.auth.getUser();
  const agentName: string | null = fullUser?.user_metadata?.full_name || fullUser?.user_metadata?.name || null;

  // Broadcast status change to widget with agent name
  await sendBroadcast(`conv-status-${conversationId}`, "status-change", {
    status: "human",
    agentName,
  });

  return Response.json({ ok: true });
}
