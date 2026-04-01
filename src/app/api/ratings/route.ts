import { createServiceClient } from "@/lib/supabase/service";
import { logError } from "@/lib/logger";
import { isValidUUID } from "@/lib/utils";
import { createRateLimiter } from "@/lib/rate-limit";
import { parseJsonBody, checkIpRateLimit } from "@/lib/api-helpers";

export const runtime = "nodejs";

const rateLimiter = createRateLimiter(5); // 5 ratings per minute per IP

export async function POST(request: Request): Promise<Response> {
  // Rate limit by IP
  const rateLimited = checkIpRateLimit(request, rateLimiter);
  if (rateLimited) return rateLimited;

  const result = await parseJsonBody<{ conversationId: string; rating: string; visitorId?: string }>(request);
  if (result instanceof Response) return result;
  const body = result;

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
