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
  const conversationId = searchParams.get("conversationId");
  const visitorId = searchParams.get("visitorId");

  if (!conversationId || !visitorId) {
    return Response.json({ error: "Missing params" }, { status: 400 });
  }

  if (!isValidUUID(conversationId)) {
    return Response.json({ error: "Invalid params" }, { status: 400 });
  }

  if (visitorId.length > 100) {
    return Response.json({ error: "Invalid visitorId" }, { status: 400 });
  }

  const service = createServiceClient();

  // Verify visitor owns this conversation
  const { data: conv } = await service
    .from("conversations")
    .select("id, workspace_id, visitor_id")
    .eq("id", conversationId)
    .single();

  if (!conv || conv.visitor_id !== visitorId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const { data } = await service
    .from("conversations")
    .select("id, started_at")
    .eq("workspace_id", conv.workspace_id)
    .eq("status", "waiting")
    .order("started_at", { ascending: true });

  if (!data) {
    return Response.json({ position: 0 });
  }

  const pos = data.findIndex((c: { id: string }) => c.id === conversationId) + 1;
  return Response.json({ position: pos > 0 ? pos : 0 });
}
