import { createServiceClient } from "@/lib/supabase/service";
import { isValidUUID } from "@/lib/utils";

export const runtime = "nodejs";

// --- In-memory rate limiting ---
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30; // 30 per minute per IP
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

export async function GET(request: Request): Promise<Response> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRate(ip)) {
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
    .select("workspace_id")
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
