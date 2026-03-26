import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");
  const workspaceId = searchParams.get("workspaceId");

  if (!conversationId || !workspaceId) {
    return Response.json({ error: "Missing params" }, { status: 400 });
  }

  const service = createServiceClient();

  const { data } = await service
    .from("conversations")
    .select("id, started_at")
    .eq("workspace_id", workspaceId)
    .eq("status", "waiting")
    .order("started_at", { ascending: true });

  if (!data) {
    return Response.json({ position: 0 });
  }

  const pos = data.findIndex((c: { id: string }) => c.id === conversationId) + 1;
  return Response.json({ position: pos > 0 ? pos : 0 });
}
