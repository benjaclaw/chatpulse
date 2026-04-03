import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isValidUUID } from "@/lib/utils";

const VALID_PLANS = ["free", "basic", "startup", "pro"];

async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  return profile?.is_super_admin ? user : null;
}

export async function PATCH(request: Request): Promise<Response> {
  const admin = await requireSuperAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 403 });

  const body = await request.json();
  const { workspaceId, plan_id } = body;

  if (!workspaceId || !isValidUUID(workspaceId)) {
    return Response.json({ error: "Invalid workspaceId" }, { status: 400 });
  }

  if (!plan_id || !VALID_PLANS.includes(plan_id)) {
    return Response.json({ error: "Invalid plan_id" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Check if workspace has active Stripe subscription — don't override paid plans
  const { data: ws } = await supabase
    .from("workspaces")
    .select("stripe_subscription_id, plan_id")
    .eq("id", workspaceId)
    .single();

  if (ws?.stripe_subscription_id && ws.plan_id !== "free") {
    return Response.json(
      { error: "Cannot override plan for workspace with active Stripe subscription. Cancel subscription first." },
      { status: 409 }
    );
  }

  const { error } = await supabase
    .from("workspaces")
    .update({ plan_id })
    .eq("id", workspaceId);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true, plan_id });
}

export async function DELETE(request: Request): Promise<Response> {
  const admin = await requireSuperAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId || !isValidUUID(workspaceId)) {
    return Response.json({ error: "Invalid workspaceId" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Check for active Stripe subscription
  const { data: ws } = await supabase
    .from("workspaces")
    .select("stripe_subscription_id")
    .eq("id", workspaceId)
    .single();

  if (ws?.stripe_subscription_id) {
    return Response.json(
      { error: "Cannot delete workspace with active Stripe subscription. Cancel subscription first." },
      { status: 409 }
    );
  }

  // Delete in order: knowledge → chatbot_config → company_info → members → workspace
  await supabase.from("messages").delete().eq("conversation_id",
    supabase.from("conversations").select("id").eq("workspace_id", workspaceId) as unknown as string
  );
  await supabase.from("conversations").delete().eq("workspace_id", workspaceId);
  await supabase.from("knowledge").delete().eq("workspace_id", workspaceId);
  await supabase.from("chatbot_config").delete().eq("workspace_id", workspaceId);
  await supabase.from("company_info").delete().eq("workspace_id", workspaceId);
  await supabase.from("members").delete().eq("workspace_id", workspaceId);

  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
