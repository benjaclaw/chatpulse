import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isValidUUID } from "@/lib/utils";
import { createRateLimiter } from "@/lib/rate-limit";
import { parseJsonBody, checkRateLimit } from "@/lib/api-helpers";

export const runtime = "nodejs";

const rateLimiter = createRateLimiter(20);

export async function DELETE(request: Request): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const limited = checkRateLimit(rateLimiter, user.id);
  if (limited) return limited;

  const result = await parseJsonBody<{ conversationId: string }>(request);
  if (result instanceof Response) return result;
  const { conversationId } = result;

  if (!conversationId || !isValidUUID(conversationId)) {
    return Response.json({ error: "Invalid conversationId" }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // Verify conversation belongs to a workspace the user is a member of
  const { data: conv } = await serviceClient
    .from("conversations")
    .select("workspace_id")
    .eq("id", conversationId)
    .is("deleted_at", null)
    .single();

  if (!conv) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { data: membership } = await serviceClient
    .from("members")
    .select("id")
    .eq("workspace_id", conv.workspace_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Soft-delete messages and conversation
  const now = new Date().toISOString();
  await serviceClient.from("messages").update({ deleted_at: now }).eq("conversation_id", conversationId);
  await serviceClient.from("conversations").update({ deleted_at: now }).eq("id", conversationId);

  return Response.json({ ok: true });
}
