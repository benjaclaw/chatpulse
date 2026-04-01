import { createClient } from "@/lib/supabase/server";
import { getStripe, getStripePriceMap } from "@/lib/stripe";
import { isValidUUID } from "@/lib/utils";
import type { PlanId } from "@/lib/plans";
import { createRateLimiter } from "@/lib/rate-limit";
import { parseJsonBody, checkRateLimit } from "@/lib/api-helpers";

export const runtime = "nodejs";

const VALID_PLANS: Array<Exclude<PlanId, "free">> = ["basic", "startup", "pro"];

const rateLimiter = createRateLimiter(5); // 5 checkout attempts per minute per user

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimited = checkRateLimit(rateLimiter, user.id);
  if (rateLimited) return rateLimited;

  const result = await parseJsonBody<{ planId: string; workspaceId: string; billing?: "monthly" | "annual" }>(request);
  if (result instanceof Response) return result;
  const body = result;

  const { planId, workspaceId, billing = "monthly" } = body;

  if (billing !== "monthly" && billing !== "annual") {
    return Response.json({ error: "Invalid billing period" }, { status: 400 });
  }

  if (!planId || !VALID_PLANS.includes(planId as Exclude<PlanId, "free">)) {
    return Response.json({ error: "Invalid planId" }, { status: 400 });
  }

  if (!workspaceId || !isValidUUID(workspaceId)) {
    return Response.json({ error: "Invalid workspaceId" }, { status: 400 });
  }

  // Verify user is owner or admin of the workspace
  const { data: member } = await supabase
    .from("members")
    .select("role")
    .eq("user_id", user.id)
    .eq("workspace_id", workspaceId)
    .single();

  if (!member || !["owner", "admin"].includes(member.role)) {
    return Response.json({ error: "Not authorized to upgrade this workspace" }, { status: 403 });
  }

  const priceId = getStripePriceMap(billing)[planId as Exclude<PlanId, "free">];
  if (!priceId) {
    return Response.json(
      { error: "Price not configured for this plan" },
      { status: 500 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chatpulse.no";

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/settings?upgrade=success`,
    cancel_url: `${appUrl}/dashboard/settings`,
    metadata: { workspaceId, planId, userId: user.id, billing },
    customer_email: user.email ?? undefined,
  });

  return Response.json({ url: session.url });
}
