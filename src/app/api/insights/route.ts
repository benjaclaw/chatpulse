import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isValidUUID } from "@/lib/utils";
import { createRateLimiter } from "@/lib/rate-limit";
import { parseJsonBody, checkRateLimit } from "@/lib/api-helpers";

export const runtime = "nodejs";

const rateLimiter = createRateLimiter(30);

export async function DELETE(request: Request): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const limited = checkRateLimit(rateLimiter, user.id);
  if (limited) return limited;

  const result = await parseJsonBody<{ id?: string; workspaceId?: string; clearAll?: boolean }>(request);
  if (result instanceof Response) return result;
  const { id, workspaceId, clearAll } = result;

  const serviceClient = createServiceClient();

  if (clearAll && workspaceId) {
    if (!isValidUUID(workspaceId)) {
      return Response.json({ error: "Invalid workspaceId" }, { status: 400 });
    }

    // Verify membership
    const { data: membership } = await serviceClient
      .from("members")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) return Response.json({ error: "Forbidden" }, { status: 403 });

    await serviceClient.from("questions").delete().eq("workspace_id", workspaceId);
    return Response.json({ ok: true });
  }

  if (id) {
    if (!isValidUUID(id)) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    // Verify the question belongs to user's workspace
    const { data: question } = await serviceClient
      .from("questions")
      .select("workspace_id")
      .eq("id", id)
      .single();

    if (!question) return Response.json({ error: "Not found" }, { status: 404 });

    const { data: membership } = await serviceClient
      .from("members")
      .select("id")
      .eq("workspace_id", question.workspace_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) return Response.json({ error: "Forbidden" }, { status: 403 });

    await serviceClient.from("questions").delete().eq("id", id);
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Missing id or workspaceId" }, { status: 400 });
}
