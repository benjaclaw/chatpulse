import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const chatbotId = searchParams.get("chatbotId");

  if (!chatbotId) {
    return Response.json({ error: "Missing chatbotId" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Fetch workspace_id for this chatbot
  const { data: config, error: configError } = await supabase
    .from("chatbot_config")
    .select("workspace_id")
    .eq("id", chatbotId)
    .single();

  if (configError || !config) {
    return Response.json({ error: "Chatbot not found" }, { status: 404 });
  }

  const workspaceId = config.workspace_id;

  // Check agent presence — simple toggle check, no heartbeat/timeout
  const { data: agents } = await supabase
    .from("agent_presence")
    .select("user_id")
    .eq("workspace_id", workspaceId)
    .in("status", ["online", "busy"]);

  return Response.json(
    {
      workspaceId,
      agentsOnline: (agents?.length ?? 0) > 0,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=30",
      },
    }
  );
}
