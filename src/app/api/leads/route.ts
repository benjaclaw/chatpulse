import { createServiceClient } from "@/lib/supabase/service";
import { logError } from "@/lib/logger";
import { isValidUUID, isValidEmail, sanitizeEmail, sanitizeName } from "@/lib/utils";
import { createRateLimiter } from "@/lib/rate-limit";
import { parseJsonBody, checkIpRateLimit } from "@/lib/api-helpers";

export const runtime = "nodejs";

const rateLimiter = createRateLimiter(10); // 10 leads per minute per IP

export async function POST(request: Request): Promise<Response> {
  const rateLimited = checkIpRateLimit(request, rateLimiter);
  if (rateLimited) return rateLimited;

  const result = await parseJsonBody<{ email: string; name?: string; workspaceId: string; conversationId: string | null }>(request);
  if (result instanceof Response) return result;
  const body = result;

  const { email, name, workspaceId, conversationId } = body;

  if (!workspaceId || !email?.trim()) {
    return Response.json(
      { error: "Mangler workspaceId eller email" },
      { status: 400 }
    );
  }

  if (!isValidUUID(workspaceId)) {
    return Response.json({ error: "Ugyldig workspaceId" }, { status: 400 });
  }

  if (conversationId && !isValidUUID(conversationId)) {
    return Response.json({ error: "Ugyldig conversationId" }, { status: 400 });
  }

  // Validate email format
  if (!isValidEmail(email.trim())) {
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
      .select("status, workspace_id")
      .eq("id", conversationId)
      .single();

    // Verify conversation belongs to the specified workspace
    if (conv && conv.workspace_id !== workspaceId) {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (conv && (conv.status === "human" || conv.status === "waiting")) {
      leadStatus = "contacted";
    }
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      workspace_id: workspaceId,
      conversation_id: conversationId || null,
      email: sanitizeEmail(email),
      name: name ? sanitizeName(name) : null,
      status: leadStatus,
    })
    .select()
    .single();

  if (error) {
    logError("Lead insert", error);
    return Response.json({ error: "Kunne ikke opprette lead" }, { status: 500 });
  }

  // TODO: Send e-post-notifikasjon til workspace admin om ny lead
  // Hent workspace admin e-post fra company_info og send via Resend eller lignende

  return Response.json(data, { status: 201 });
}
