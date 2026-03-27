import { createServiceClient } from "@/lib/supabase/service";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  let body: {
    email: string;
    name: string;
    botId: string;
    workspaceId?: string;
    visitorId: string;
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    let workspaceId: string;
    let conversation: any;

    // If conversation already exists (from AI chat), use it
    if (existingConvId) {
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id, workspace_id")
        .eq("id", existingConvId)
        .single();

      if (existingConv) {
        conversation = existingConv;
        workspaceId = existingConv.workspace_id;
      }
    }

    // Otherwise: Create new conversation
    if (!conversation) {
      // Need workspace ID — try botId if provided
      if (botId) {
        const { data: bot } = await supabase
          .from("chatbots")
          .select("workspace_id")
          .eq("id", botId)
          .single();

        if (!bot) {
          return Response.json({ error: "Chatbot not found" }, { status: 404 });
        }
        workspaceId = bot.workspace_id;
      } else {
        return Response.json({ error: "No conversation or botId provided" }, { status: 400 });
      }

      // Create conversation
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({
          workspace_id: workspaceId,
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
        email: email.trim(),
        name: name.trim(),
        status: "new",
      })
      .select()
      .single();

    if (leadError) {
      logError("Handoff: create lead", leadError);
      // Don't fail — lead is secondary to conversation
    }

    // 4. Return success with all needed data
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
