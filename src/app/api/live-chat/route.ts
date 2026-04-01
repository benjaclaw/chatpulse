import { getAuthenticatedClient } from "@/lib/supabase/api-auth";
import { createServiceClient } from "@/lib/supabase/service";
import { sendBroadcast } from "@/lib/supabase/broadcast";
import { logError } from "@/lib/logger";
import { isValidUUID } from "@/lib/utils";
import { notifyNewMessage } from "@/lib/push";
import { createRateLimiter } from "@/lib/rate-limit";
import { parseJsonBody, checkRateLimit } from "@/lib/api-helpers";

export const runtime = "nodejs";

interface LiveChatRequest {
  conversationId: string;
  content: string;
  role: "user" | "agent";
  visitorId?: string;
}

const rateLimiter = createRateLimiter(30); // 30 messages per minute per conversation

export async function POST(request: Request): Promise<Response> {
  const result = await parseJsonBody<LiveChatRequest>(request);
  if (result instanceof Response) return result;
  const body = result;

  const { conversationId, content, role, visitorId } = body;
  if (!conversationId || !content?.trim() || !role) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!isValidUUID(conversationId)) {
    return Response.json({ error: "Invalid conversationId" }, { status: 400 });
  }

  // FIX 2: Limit content length
  const sanitizedContent = content.trim().slice(0, 5000);

  // Rate limit per conversation
  const rateLimited = checkRateLimit(rateLimiter, conversationId);
  if (rateLimited) return rateLimited;

  if (role === "agent") {
    // Agent messages require authentication + assignment check
    const { user } = await getAuthenticatedClient(request);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify agent is assigned to this conversation
    const serviceClient = createServiceClient();
    const { data: conversation } = await serviceClient
      .from("conversations")
      .select("id, assigned_to, workspace_id")
      .eq("id", conversationId)
      .single();

    if (!conversation) {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (conversation.assigned_to !== user.id) {
      return Response.json({ error: "Not assigned to this conversation" }, { status: 403 });
    }

    // Insert agent message
    const { data: agentMsg, error } = await serviceClient
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role: "agent",
        content: sanitizedContent,
      })
      .select("id")
      .single();

    if (error) {
      logError("Agent message insert", error);
      return Response.json({ error: "Failed to send message" }, { status: 500 });
    }

    // Broadcast agent message so the anon widget can receive it
    await sendBroadcast(`live-chat-${conversationId}`, "new-message", {
      id: agentMsg.id,
      role: "agent",
      content: sanitizedContent,
    });

    return Response.json({ ok: true });
  }

  if (role === "user") {
    // Visitor messages use service client (unauthenticated)
    const serviceClient = createServiceClient();

    // FIX 1: Require visitorId for user messages
    if (!visitorId) {
      return Response.json({ error: "Missing visitorId" }, { status: 400 });
    }

    const { data: conversation } = await serviceClient
      .from("conversations")
      .select("id, status, visitor_id")
      .eq("id", conversationId)
      .single();

    if (!conversation) {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }

    // FIX 1: Validate visitor owns this conversation
    if (conversation.visitor_id !== visitorId) {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }

    // FIX 5: Prevent messages to closed conversations
    if (conversation.status === "closed") {
      return Response.json({ error: "Conversation is closed" }, { status: 410 });
    }

    const { data: userMsg, error } = await serviceClient
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role: "user",
        content: sanitizedContent,
      })
      .select("id")
      .single();

    if (error) {
      logError("Visitor message insert", error);
      return Response.json({ error: "Failed to send message" }, { status: 500 });
    }

    // Broadcast user message so inbox can receive it as fallback
    await sendBroadcast(`live-chat-${conversationId}`, "new-message", {
      id: userMsg.id,
      role: "user",
      content: sanitizedContent,
    });

    // Push notification to assigned agent (fire-and-forget)
    notifyNewMessage(conversationId, sanitizedContent).catch(() => {});

    return Response.json({ ok: true });
  }

  return Response.json({ error: "Invalid role" }, { status: 400 });
}
