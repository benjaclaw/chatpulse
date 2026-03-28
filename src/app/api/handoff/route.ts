import { createServiceClient } from "@/lib/supabase/service";
import { logError } from "@/lib/logger";
import { isValidUUID } from "@/lib/utils";
import { notifyNewConversation } from "@/lib/push";

export const runtime = "nodejs";

// --- In-memory rate limiting ---
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // 5 handoffs per minute per IP
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
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRate(ip)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: {
    email: string;
    name: string;
    botId?: string;
    workspaceId?: string;
    visitorId: string;
    conversationId?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { email, name, botId, visitorId, conversationId: existingConvId } = body;

  // Validate required fields
  if (!email?.trim() || !name?.trim() || !visitorId) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Sanitize & limit field lengths
  const safeEmail = email.trim().slice(0, 254).toLowerCase();
  const safeName = name.trim().slice(0, 200);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(safeEmail)) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  if (existingConvId && !isValidUUID(existingConvId)) {
    return Response.json({ error: "Invalid conversationId" }, { status: 400 });
  }

  if (botId && !isValidUUID(botId)) {
    return Response.json({ error: "Invalid botId" }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    let workspaceId: string = "";
    let conversation: any;

    // If conversation already exists (from AI chat), use it and update status
    if (existingConvId) {
      const { data: existingConv, error: fetchError } = await supabase
        .from("conversations")
        .select("id, workspace_id, visitor_id")
        .eq("id", existingConvId)
        .single();

      if (existingConv) {
        // Verify the visitor owns this conversation
        if (existingConv.visitor_id !== body.visitorId) {
          return Response.json({ error: "Conversation not found" }, { status: 404 });
        }
        conversation = existingConv;
        workspaceId = existingConv.workspace_id;

        // Update status to "waiting" so it appears in agent inbox
        await supabase
          .from("conversations")
          .update({ status: "waiting", started_at: new Date().toISOString() })
          .eq("id", existingConvId);
      } else {
        logError("Handoff: fetch existing conversation", fetchError);
      }
    }

    // Otherwise: Create new conversation
    if (!conversation) {
      // Need workspace ID — try botId if provided
      if (botId) {
        const { data: bot, error: botError } = await supabase
          .from("chatbot_config")
          .select("workspace_id")
          .eq("id", botId)
          .single();

        if (botError || !bot) {
          logError("Handoff: find chatbot", botError);
          return Response.json({ error: "Chatbot not found or is invalid" }, { status: 500 });
        }
        workspaceId = bot.workspace_id;
        if (!workspaceId) {
          return Response.json({ error: "Chatbot has no workspace" }, { status: 400 });
        }
      } else {
        return Response.json({ error: "No conversation or botId provided" }, { status: 400 });
      }

      // Create conversation
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({
          workspace_id: workspaceId,
          visitor_id: body.visitorId,
          status: "waiting",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (convError || !newConv) {
        logError("Handoff: create conversation", convError);
        return Response.json({ error: "Failed to create conversation" }, { status: 500 });
      }
      conversation = newConv;
    }

    // 3. Create lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        workspace_id: workspaceId,
        conversation_id: conversation.id,
        email: safeEmail,
        name: safeName,
        status: "new",
      })
      .select()
      .single();

    if (leadError) {
      logError("Handoff: create lead", leadError);
      // Don't fail — lead is secondary to conversation
    }

    // 4. Send push notification to workspace agents (fire-and-forget)
    notifyNewConversation(workspaceId, conversation.id, `${safeName}: ny henvendelse`).catch(() => {});

    // 5. Return success with all needed data
    return Response.json(
      {
        ok: true,
        conversationId: conversation.id,
        workspaceId,
        queuePosition: 1, // Placeholder — real position fetched separately
      },
      { status: 201 }
    );
  } catch (err) {
    logError("Handoff endpoint", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
