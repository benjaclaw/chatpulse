import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  // Find human conversations where the conversation started > 30 min ago
  const { data: staleConvs } = await supabase
    .from("conversations")
    .select("id")
    .eq("status", "human")
    .lt("started_at", thirtyMinAgo);

  if (!staleConvs || staleConvs.length === 0) {
    return Response.json({ closed: 0 });
  }

  let closedCount = 0;

  for (const conv of staleConvs) {
    // Check last message time
    const { data: lastMsg } = await supabase
      .from("messages")
      .select("created_at")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (lastMsg && new Date(lastMsg.created_at).getTime() < Date.now() - 30 * 60 * 1000) {
      await supabase
        .from("conversations")
        .update({ status: "closed" })
        .eq("id", conv.id);

      await supabase
        .from("agent_assignments")
        .update({ resolved_at: new Date().toISOString() })
        .eq("conversation_id", conv.id)
        .is("resolved_at", null);

      closedCount++;
    }
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
