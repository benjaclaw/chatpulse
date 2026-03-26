import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { expo_push_token, device_id, workspace_id } = await request.json();
  if (!expo_push_token || !device_id || !workspace_id) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const serviceClient = createServiceClient();
  const { error } = await serviceClient.from("push_tokens").upsert(
    { user_id: user.id, workspace_id, expo_push_token, device_id },
    { onConflict: "user_id,device_id" }
  );

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { device_id } = await request.json();
  if (!device_id) return Response.json({ error: "Missing device_id" }, { status: 400 });

  const serviceClient = createServiceClient();
  const { error } = await serviceClient
    .from("push_tokens")
    .delete()
    .eq("user_id", user.id)
    .eq("device_id", device_id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
