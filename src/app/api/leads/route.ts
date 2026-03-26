import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  let body: { email: string; name?: string; workspaceId: string; conversationId: string | null };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ugyldig forespørsel" }, { status: 400 });
  }

  const { email, name, workspaceId, conversationId } = body;

  if (!workspaceId || !email?.trim()) {
    return Response.json(
      { error: "Mangler workspaceId eller email" },
      { status: 400 }
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return Response.json({ error: "Ugyldig e-postadresse" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Validate that workspace exists
  const { data: ws } = await supabase
    .from("workspaces")
    .select("id")
    .eq("id", workspaceId)
    .maybeSingle();

  if (!ws) {
    return Response.json({ error: "Workspace ikke funnet" }, { status: 404 });
  }

  // Check if conversation is already being handled by an agent
  let leadStatus = "new";
  if (conversationId) {
    const { data: conv } = await supabase
      .from("conversations")
      .select("status")
      .eq("id", conversationId)
      .single();
    if (conv && (conv.status === "human" || conv.status === "waiting")) {
      leadStatus = "contacted";
    }
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      workspace_id: workspaceId,
      conversation_id: conversationId || null,
      email: email.trim(),
      name: name?.trim() || null,
      status: leadStatus,
    })
    .select()
    .single();

  if (error) {
    console.error("Lead insert error:", error);
    return Response.json({ error: "Kunne ikke opprette lead" }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
