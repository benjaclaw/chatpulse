import { createServiceClient } from "@/lib/supabase/service";
import { logError } from "@/lib/logger";
import { isValidUUID } from "@/lib/utils";

export const runtime = "nodejs";

// --- In-memory rate limiting ---
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // 5 ratings per minute per IP
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
  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRate(ip)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { conversationId: string; rating: string; visitorId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { conversationId, rating, visitorId } = body;

  if (!conversationId || !rating || !visitorId) {
    return Response.json({ error: "Missing conversationId, rating or visitorId" }, { status: 400 });
  }

  if (!isValidUUID(conversationId)) {
    return Response.json({ error: "Invalid conversationId" }, { status: 400 });
  }

  if (!["good", "ok", "bad"].includes(rating)) {
    return Response.json({ error: "Invalid rating" }, { status: 400 });
  }

  const service = createServiceClient();

  // Verify the conversation exists and optionally that the visitor owns it
  const { data: conv } = await service
    .from("conversations")
    .select("id, visitor_id, rating")
    .eq("id", conversationId)
    .single();

  if (!conv) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  // Verify visitor owns this conversation
  if (conv.visitor_id !== visitorId) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  // Prevent re-rating
  if (conv.rating) {
    return Response.json({ error: "Conversation already rated" }, { status: 409 });
  }

  const { error } = await service
    .from("conversations")
    .update({ rating })
    .eq("id", conversationId)
    .is("rating", null); // Extra guard: only update if not already rated

  if (error) {
    logError("ratings", error);
    return Response.json({ error: "Failed to save rating" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
