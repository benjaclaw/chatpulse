import { createClient } from "@/lib/supabase/server";
import { getStripe, STRIPE_PRICE_MAP } from "@/lib/stripe";
import type { PlanId } from "@/lib/plans";

export const runtime = "nodejs";

const VALID_PLANS: Array<Exclude<PlanId, "free">> = ["basic", "startup", "pro"];

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { planId: string; workspaceId: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { planId, workspaceId } = body;

  if (!planId || !VALID_PLANS.includes(planId as Exclude<PlanId, "free">)) {
    return Response.json({ error: "Invalid planId" }, { status: 400 });
  }

  if (!workspaceId) {
    return Response.json({ error: "Missing workspaceId" }, { status: 400 });
  }

  const priceId = STRIPE_PRICE_MAP[planId as Exclude<PlanId, "free">];
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
    metadata: { workspaceId, planId, userId: user.id },
    customer_email: user.email ?? undefined,
  });

  return Response.json({ url: session.url });
}
