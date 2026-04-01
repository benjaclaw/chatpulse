import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { isValidUUID } from "@/lib/utils";
import { parseJsonBody } from "@/lib/api-helpers";

export const runtime = "nodejs";

const PORTAL_CONFIG_ID = process.env.STRIPE_PORTAL_CONFIG_ID || "bpc_1TH8YFCWS4OJVOagGSICjaFv";

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await parseJsonBody<{ workspaceId: string }>(request);
  if (result instanceof Response) return result;
  const body = result;

  const { workspaceId } = body;

  if (!workspaceId || !isValidUUID(workspaceId)) {
    return Response.json({ error: "Invalid workspaceId" }, { status: 400 });
  }

  // Verify user is owner or admin
  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("user_id", user.id)
    .eq("workspace_id", workspaceId)
    .single();

  if (!member || !["owner", "admin"].includes(member.role)) {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }

  // Find Stripe customer for this user
  const stripe = getStripe();
  const customers = await stripe.customers.list({
    email: user.email ?? undefined,
    limit: 1,
  });

  if (customers.data.length === 0) {
    return Response.json({ error: "No subscription found" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chatpulse.no";

  const session = await stripe.billingPortal.sessions.create({
    customer: customers.data[0].id,
    configuration: PORTAL_CONFIG_ID,
    return_url: `${appUrl}/dashboard/settings`,
  });

  return Response.json({ url: session.url });
}
