import { createServiceClient } from "@/lib/supabase/service";
import { sendBroadcast } from "@/lib/supabase/broadcast";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function GET(request: Request): Promise<Response> {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || !authHeader || !safeCompare(authHeader, `Bearer ${cronSecret}`)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  // Fetch ALL human conversations (limit 200 for safety) — check last message time instead of started_at
  const { data: staleConvs } = await supabase
    .from("conversations")
    .select("id")
    .eq("status", "human")
    .limit(200);

  if (!staleConvs || staleConvs.length === 0) {
    return Response.json({ closed: 0 });
  }

  // Batch-fetch last message time for ALL conversations in one query
  const convIds = staleConvs.map((c) => c.id);
  const { data: lastMessages } = await supabase
    .from("messages")
    .select("conversation_id, created_at")
    .in("conversation_id", convIds)
    .order("created_at", { ascending: false });

  const lastMsgMap = new Map<string, string>();
  for (const msg of lastMessages ?? []) {
    if (!lastMsgMap.has(msg.conversation_id)) {
      lastMsgMap.set(msg.conversation_id, msg.created_at);
    }
  }

  const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
  const toClose: string[] = [];
  for (const conv of staleConvs) {
    const lastAt = lastMsgMap.get(conv.id);
    if (!lastAt || new Date(lastAt).getTime() < thirtyMinAgo) {
      toClose.push(conv.id);
    }
  }

  let closedCount = 0;
  if (toClose.length > 0) {
    await supabase
      .from("conversations")
      .update({ status: "closed" })
      .in("id", toClose);

    await supabase
      .from("agent_assignments")
      .update({ resolved_at: new Date().toISOString() })
      .in("conversation_id", toClose)
      .is("resolved_at", null);

    closedCount = toClose.length;
  }

  // FIX 4: Handle waiting conversations with no recent activity
  // Auto-revert to AI after 15 min if still waiting (user likely abandoned)
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data: staleWaiting } = await supabase
    .from("conversations")
    .select("id, workspace_id")
    .eq("status", "waiting")
    .lt("started_at", fifteenMinAgo);

  let revertedToAi = 0;

  if (staleWaiting && staleWaiting.length > 0) {
    // Revert to AI after 15 min with no activity
    const { data: revertConvs } = await supabase
      .from("conversations")
      .update({ status: "ai" })
      .lt("started_at", fifteenMinAgo)
      .eq("status", "waiting")
      .select("id");

    if (revertConvs && revertConvs.length > 0) {
      revertedToAi = revertConvs.length;
      
      // Broadcast status change to widget and innboks
      for (const conv of revertConvs) {
        await sendBroadcast(`conv-status-${conv.id}`, "status-change", {
          status: "ai",
        });
      }
    }
  }

  return Response.json({ closed: closedCount, revertedToAi });
}
