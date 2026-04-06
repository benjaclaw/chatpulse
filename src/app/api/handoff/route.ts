import { createServiceClient } from "@/lib/supabase/service";
import { logError } from "@/lib/logger";
import { isValidUUID, isValidEmail, sanitizeEmail, sanitizeName } from "@/lib/utils";
import { notifyNewConversation } from "@/lib/push";
import { createRateLimiter } from "@/lib/rate-limit";
import { parseJsonBody, checkIpRateLimit } from "@/lib/api-helpers";

export const runtime = "nodejs";

const rateLimiter = createRateLimiter(5); // 5 handoffs per minute per IP

export async function POST(request: Request): Promise<Response> {
  const rateLimited = checkIpRateLimit(request, rateLimiter);
  if (rateLimited) return rateLimited;

  interface HandoffBody {
    email: string;
    name: string;
    botId?: string;
    workspaceId?: string;
    visitorId: string;
    conversationId?: string;
  }

  const result = await parseJsonBody<HandoffBody>(request);
  if (result instanceof Response) return result;
  const body = result;

  const { email, name, botId, visitorId, conversationId: existingConvId } = body;

  // Validate required fields
  if (!email?.trim() || !name?.trim() || !visitorId) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Sanitize & limit field lengths
  const safeEmail = sanitizeEmail(email);
  const safeName = sanitizeName(name);

  if (!isValidEmail(safeEmail)) {
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
    let conversation: { id: string; workspace_id: string; visitor_id: string } | null = null;

    // 1. Resolve workspaceId (and existing conversation if available)
    if (existingConvId) {
      const { data: existingConv, error: fetchError } = await supabase
        .from("conversations")
        .select("id, workspace_id, visitor_id")
        .eq("id", existingConvId)
        .is("deleted_at", null)
        .single();

      if (existingConv) {
        // Verify the visitor owns this conversation
        if (existingConv.visitor_id !== body.visitorId) {
          return Response.json({ error: "Conversation not found" }, { status: 404 });
        }
        conversation = existingConv;
        workspaceId = existingConv.workspace_id;
      } else {
        logError("Handoff: fetch existing conversation", fetchError);
      }
    }

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
      } else if (!workspaceId) {
        return Response.json({ error: "No conversation or botId provided" }, { status: 400 });
      }
    }

    // 2. Check agent presence for this workspace
    const { data: onlineAgents } = await supabase
      .from("agent_presence")
      .select("user_id")
      .eq("workspace_id", workspaceId)
      .in("status", ["online", "busy"])
      .limit(1);
    const agentsOnline = (onlineAgents?.length ?? 0) > 0;

    // 3. Create or update conversation — only set "waiting" if agents are online
    if (conversation) {
      if (agentsOnline) {
        await supabase
          .from("conversations")
          .update({ status: "waiting", started_at: new Date().toISOString() })
          .eq("id", conversation.id);
      }
    } else {
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({
          workspace_id: workspaceId,
          visitor_id: body.visitorId,
          ...(agentsOnline && { status: "waiting", started_at: new Date().toISOString() }),
        })
        .select()
        .single();

      if (convError || !newConv) {
        logError("Handoff: create conversation", convError);
        return Response.json({ error: "Failed to create conversation" }, { status: 500 });
      }
      conversation = newConv;
    }

    // At this point conversation is guaranteed non-null
    const activeConversation = conversation!;

    // 4. Create lead (always — offline handoff saves lead only)
    const { error: leadError } = await supabase
      .from("leads")
      .insert({
        workspace_id: workspaceId,
        conversation_id: activeConversation.id,
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

    // 5. Push notification only when agents are online
    if (agentsOnline) {
      notifyNewConversation(workspaceId, activeConversation.id, `${safeName}: ny henvendelse`).catch(() => {});
    }

    // 6. Return success — liveChat tells the widget whether to activate live chat mode
    return Response.json(
      {
        ok: true,
        liveChat: agentsOnline,
        conversationId: activeConversation.id,
        workspaceId,
        ...(agentsOnline && { queuePosition: 1 }),
      },
      { status: 201 }
    );
  } catch (err) {
    logError("Handoff endpoint", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
