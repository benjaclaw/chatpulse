import { createClient } from "@/lib/supabase/server";
import { getStripe, STRIPE_PRICE_MAP } from "@/lib/stripe";
import { isValidUUID } from "@/lib/utils";
import type { PlanId } from "@/lib/plans";

export const runtime = "nodejs";

const VALID_PLANS: Array<Exclude<PlanId, "free">> = ["basic", "startup", "pro"];

// --- In-memory rate limiting (per user) ---
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // 5 checkout attempts per minute per user
const WINDOW_MS = 60_000;

function checkRate(key: string): boolean {
  const now = Date.now();
  const bucket = rateMap.get(key);
  if (!bucket || now > bucket.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  bucket.count++;
  return bucket.count <= RATE_LIMIT;
}

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRate(user.id)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
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
