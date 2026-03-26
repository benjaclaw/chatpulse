import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
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

  // FIX 4: Handle waiting conversations stuck without online agents
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data: staleWaiting } = await supabase
    .from("conversations")
    .select("id, workspace_id")
    .eq("status", "waiting")
    .lt("started_at", fifteenMinAgo);

  let revertedToAi = 0;

  if (staleWaiting && staleWaiting.length > 0) {
    // Group by workspace to avoid redundant presence checks
    const byWorkspace = new Map<string, string[]>();
    for (const conv of staleWaiting) {
      const list = byWorkspace.get(conv.workspace_id) || [];
      list.push(conv.id);
      byWorkspace.set(conv.workspace_id, list);
    }

    const twoMinAgo = new Date(Date.now() - 2 * 60_000).toISOString();

    for (const [wsId, convIds] of byWorkspace) {
      const { data: onlineAgents } = await supabase
        .from("agent_presence")
        .select("user_id")
        .eq("workspace_id", wsId)
        .in("status", ["online", "busy"])
        .gte("last_seen_at", twoMinAgo)
        .limit(1);

      if (!onlineAgents || onlineAgents.length === 0) {
        // No agents online — revert to AI mode
        for (const convId of convIds) {
          await supabase
            .from("conversations")
            .update({ status: "ai" })
            .eq("id", convId);

          await supabase
            .from("messages")
            .insert({
              conversation_id: convId,
              role: "assistant",
              content: "Ingen ledige medarbeidere. Du snakker nå med vår AI-assistent.",
            });

          revertedToAi++;
        }
      }
    }
  }

  return Response.json({ closed: closedCount, revertedToAi });
}
