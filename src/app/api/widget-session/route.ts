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

  const { data: conv } = await service
    .from("conversations")
    .select("id, status, visitor_id")
    .eq("id", conversationId)
    .is("deleted_at", null)
    .single();

  if (!conv || conv.visitor_id !== visitorId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const { data: messages } = await service
    .from("messages")
    .select("id, role, content")
    .eq("conversation_id", conversationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  return Response.json({
    status: conv.status,
    messages: (messages ?? []).map((m: { id: string; role: string; content: string }) => ({
      id: m.id,
      role: m.role,
      content: m.content,
    })),
  });
}
