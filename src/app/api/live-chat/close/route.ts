import { getAuthenticatedClient } from "@/lib/supabase/api-auth";
import { createServiceClient } from "@/lib/supabase/service";
import { sendBroadcast } from "@/lib/supabase/broadcast";
import { isValidUUID } from "@/lib/utils";

export const runtime = "nodejs";

// --- In-memory rate limiting (per user) ---
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // 20 closes per minute per user
const WINDOW_MS = 60_000;

function checkRate(key: string): boolean {
  const now = Date.now();
  const bucket = rateMap.get(key);
  if (!bucket || now > bucket.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  bucket.count++;
  return bucket.count <= RATE_LIMIT;
}

export async function POST(request: Request): Promise<Response> {
  const { supabase, user } = await getAuthenticatedClient(request);

  if (!user || !supabase) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRate(user.id)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
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
