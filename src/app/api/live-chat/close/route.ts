import { getAuthenticatedClient } from "@/lib/supabase/api-auth";
import { createServiceClient } from "@/lib/supabase/service";
import { sendBroadcast } from "@/lib/supabase/broadcast";
import { isValidUUID } from "@/lib/utils";
import { createRateLimiter } from "@/lib/rate-limit";
import { parseJsonBody, checkRateLimit, requireWorkspaceMember } from "@/lib/api-helpers";

export const runtime = "nodejs";

const rateLimiter = createRateLimiter(20); // 20 closes per minute per user

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

  const service = createServiceClient();

  // Always fetch the conversation to verify workspace membership
  const { data: conv, error: checkError } = await service
    .from("conversations")
    .select("id, workspace_id")
    .eq("id", conversationId)
    .single();

  if (checkError || !conv) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  const memberCheck = await requireWorkspaceMember(supabase, user.id, conv.workspace_id);
  if (memberCheck) return memberCheck;

  await service
    .from("conversations")
    .update({ status: "closed" })
    .eq("id", conversationId);

  await service
    .from("agent_assignments")
    .update({ resolved_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .is("resolved_at", null);

  // Update lead status to resolved
  await service
    .from("leads")
    .update({ status: "resolved" })
    .eq("conversation_id", conversationId);

  // Broadcast status change to widget
  await sendBroadcast(`conv-status-${conversationId}`, "status-change", {
    status: "closed",
  });

  return Response.json({ ok: true });
}
