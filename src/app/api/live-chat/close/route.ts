import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendBroadcast } from "@/lib/supabase/broadcast";

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

  const service = createServiceClient();

  await service
    .from("conversations")
    .update({ status: "closed" })
    .eq("id", conversationId);

  await service
    .from("agent_assignments")
    .update({ resolved_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .is("resolved_at", null);

  // Update lead status to resolved
  await service
    .from("leads")
    .update({ status: "resolved" })
    .eq("conversation_id", conversationId);

  // Broadcast status change to widget
  await sendBroadcast(`conv-status-${conversationId}`, "status-change", {
    status: "closed",
  });

  return Response.json({ ok: true });
}
