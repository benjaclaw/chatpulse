import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isValidUUID } from "@/lib/utils";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";

const rateLimiter = createRateLimiter(10); // 10 per minute per user

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!rateLimiter.check(user.id)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { expo_push_token: string; device_id: string; workspace_id: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { expo_push_token, device_id, workspace_id } = body;
  if (!expo_push_token || !device_id || !workspace_id) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!isValidUUID(workspace_id)) {
    return Response.json({ error: "Invalid workspace_id" }, { status: 400 });
  }

  // Limit token/device_id length to prevent abuse
  if (expo_push_token.length > 200 || device_id.length > 200) {
    return Response.json({ error: "Invalid field length" }, { status: 400 });
  }

  // Verify workspace membership
  const { data: member } = await supabase
    .from("members")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("workspace_id", workspace_id)
    .single();

  if (!member) {
    return Response.json({ error: "Not a member of this workspace" }, { status: 403 });
  }

  const serviceClient = createServiceClient();
  const { error } = await serviceClient.from("push_tokens").upsert(
    { user_id: user.id, workspace_id, expo_push_token, device_id },
    { onConflict: "user_id,device_id" }
  );

  if (error) return Response.json({ error: "Failed to register push token" }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!rateLimiter.check(user.id)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { device_id: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const { device_id } = body;
  if (!device_id) return Response.json({ error: "Missing device_id" }, { status: 400 });

  if (device_id.length > 200) {
    return Response.json({ error: "Invalid device_id" }, { status: 400 });
  }

  const serviceClient = createServiceClient();
  const { error } = await serviceClient
    .from("push_tokens")
    .delete()
    .eq("user_id", user.id)
    .eq("device_id", device_id);

  if (error) return Response.json({ error: "Failed to remove push token" }, { status: 500 });
  return Response.json({ ok: true });
}
