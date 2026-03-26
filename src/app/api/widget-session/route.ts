import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");
  const visitorId = searchParams.get("visitorId");

  if (!conversationId || !visitorId) {
    return Response.json({ error: "Missing params" }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: conv } = await service
    .from("conversations")
    .select("id, status, visitor_id")
    .eq("id", conversationId)
    .single();

  if (!conv || conv.visitor_id !== visitorId) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const { data: messages } = await service
    .from("messages")
    .select("id, role, content")
    .eq("conversation_id", conversationId)
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
