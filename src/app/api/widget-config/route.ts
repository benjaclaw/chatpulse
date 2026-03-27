import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "edge";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const chatbotId = searchParams.get("chatbotId");

  if (!chatbotId) {
    return Response.json({ error: "Missing chatbotId" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Single query: fetch workspace_id and check presence in parallel
  const { data: config, error: configError } = await supabase
    .from("chatbot_config")
    .select("workspace_id")
    .eq("id", chatbotId)
    .single();

  if (configError || !config) {
    return Response.json({ error: "Chatbot not found" }, { status: 404 });
  }

  const workspaceId = config.workspace_id;

  // Check agent presence — simple toggle check
  const { data: agents } = await supabase
    .from("agent_presence")
    .select("user_id")
    .eq("workspace_id", workspaceId)
    .in("status", ["online", "busy"])
    .limit(1); // Only need to know if ANY agent is online

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
