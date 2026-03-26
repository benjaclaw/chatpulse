import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

interface LiveChatRequest {
  conversationId: string;
  content: string;
  role: "user" | "agent";
  visitorId?: string;
}

// --- In-memory rate limiting ---
interface RateBucket {
  count: number;
  resetAt: number;
}

const conversationRateMap = new Map<string, RateBucket>();
const CONVERSATION_LIMIT = 30; // per minute
const WINDOW_MS = 60_000;
const CLEANUP_INTERVAL = 5 * 60_000;
let lastCleanup = Date.now();

function cleanupRateMap(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, bucket] of conversationRateMap) {
    if (now > bucket.resetAt) conversationRateMap.delete(key);
  }
}

function checkRate(key: string): boolean {
  cleanupRateMap();
  const now = Date.now();
  const bucket = conversationRateMap.get(key);
  if (!bucket || now > bucket.resetAt) {
    conversationRateMap.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  bucket.count++;
  return bucket.count <= CONVERSATION_LIMIT;
}

export async function POST(request: Request): Promise<Response> {
  let body: LiveChatRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { conversationId, content, role, visitorId } = body;
  if (!conversationId || !content?.trim() || !role) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // FIX 2: Limit content length
  const sanitizedContent = content.trim().slice(0, 5000);

  // Rate limit per conversation
  if (!checkRate(conversationId)) {
    return Response.json(
      { error: "Too many messages. Please wait before sending more." },
      { status: 429 }
    );
  }

  if (role === "agent") {
    // Agent messages require authentication + assignment check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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
    const { error } = await serviceClient
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role: "agent",
        content: sanitizedContent,
      });

    if (error) {
      console.error("Agent message insert error:", error);
      return Response.json({ error: "Failed to send message" }, { status: 500 });
    }

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

    const { error } = await serviceClient
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role: "user",
        content: sanitizedContent,
      });

    if (error) {
      console.error("Visitor message insert error:", error);
      return Response.json({ error: "Failed to send message" }, { status: 500 });
    }

    return Response.json({ ok: true });
  }

  return Response.json({ error: "Invalid role" }, { status: 400 });
}
