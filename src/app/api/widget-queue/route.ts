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

  // Verify visitor owns this conversation
  const { data: conv } = await service
    .from("conversations")
    .select("id, workspace_id, visitor_id")
    .eq("id", conversationId)
    .is("deleted_at", null)
    .single();

  if (!conv || conv.visitor_id !== visitorId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const { data } = await service
    .from("conversations")
    .select("id, started_at")
    .eq("workspace_id", conv.workspace_id)
    .is("deleted_at", null)
    .eq("status", "waiting")
    .order("started_at", { ascending: true });

  if (!data) {
    return Response.json({ position: 0 });
  }

  const pos = data.findIndex((c: { id: string }) => c.id === conversationId) + 1;
  return Response.json({ position: pos > 0 ? pos : 0 });
}
