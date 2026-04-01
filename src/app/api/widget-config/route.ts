import { createServiceClient } from "@/lib/supabase/service";
import { isValidUUID } from "@/lib/utils";
import { createRateLimiter } from "@/lib/rate-limit";
import { checkIpRateLimit } from "@/lib/api-helpers";

export const runtime = "nodejs";

const rateLimiter = createRateLimiter(30); // 30 per minute per IP

export async function GET(request: Request): Promise<Response> {
  const rateLimited = checkIpRateLimit(request, rateLimiter);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(request.url);
  const chatbotId = searchParams.get("chatbotId");

  if (!chatbotId) {
    return Response.json({ error: "Missing chatbotId" }, { status: 400 });
  }

  if (!isValidUUID(chatbotId)) {
    return Response.json({ error: "Invalid chatbotId" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: config } = await supabase
    .from("chatbot_config")
    .select("workspace_id, widget_styling")
    .eq("id", chatbotId)
    .single();

  if (!config) {
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

  const styling = config.widget_styling as { primary_color?: string; position?: string } | null;
  const primaryColor = styling?.primary_color ?? "#6366f1";
  const position = styling?.position ?? "right";

  // If styling is missing/null, update it in DB for consistency
  if (!config.widget_styling) {
    await supabase
      .from("chatbot_config")
      .update({ widget_styling: { primary_color: primaryColor, position } })
      .eq("id", chatbotId)
      .catch(() => {}); // Silently fail if update fails
  }

  return Response.json(
    {
      workspaceId,
      agentsOnline: (agents?.length ?? 0) > 0,
      primaryColor,
      position,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=30",
      },
    }
  );
}
