import { createServiceClient } from "@/lib/supabase/service";
import { isValidUUID } from "@/lib/utils";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";

const rateLimiter = createRateLimiter(30); // 30 per minute per IP

export async function GET(request: Request): Promise<Response> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimiter.check(ip)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

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

  return Response.json(
    {
      workspaceId,
      agentsOnline: (agents?.length ?? 0) > 0,
      primaryColor: styling?.primary_color ?? "#6366f1",
      position: styling?.position ?? "right",
    },
    {
      headers: {
        "Cache-Control": "private, max-age=30",
      },
    }
  );
}
