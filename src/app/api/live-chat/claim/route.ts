import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { conversationId: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { conversationId } = body;
  if (!conversationId) {
    return Response.json({ error: "Missing conversationId" }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // Update conversation — only if still waiting (race condition guard)
  const { data: updated, error: convError } = await serviceClient
    .from("conversations")
    .update({ status: "human", assigned_to: user.id })
    .eq("id", conversationId)
    .eq("status", "waiting")
    .select("id");

  if (convError) {
    console.error("Claim error:", convError);
    return Response.json({ error: "Failed to claim" }, { status: 500 });
  }

  if (!updated || updated.length === 0) {
    return Response.json({ error: "Conversation already claimed or not in waiting state" }, { status: 409 });
  }

  // Create assignment record
  await serviceClient
    .from("agent_assignments")
    .insert({
      conversation_id: conversationId,
      agent_id: user.id,
    });

  return Response.json({ ok: true });
}
