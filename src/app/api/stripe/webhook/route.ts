import { stripe, STRIPE_PRICE_MAP } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";
import type { PlanId } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return Response.json({ error: message }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const workspaceId = session.metadata?.workspaceId;
      const planId = session.metadata?.planId;

      if (workspaceId && planId) {
        await supabase
          .from("workspaces")
          .update({
            plan_id: planId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq("id", workspaceId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer;

      await supabase
        .from("workspaces")
        .update({ plan_id: "free", stripe_subscription_id: null })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer;

      // Determine the plan from the subscription's price
      const priceId = subscription.items.data[0]?.price.id;
      let newPlanId: PlanId = "free";

      for (const [plan, id] of Object.entries(STRIPE_PRICE_MAP)) {
        if (id === priceId) {
          newPlanId = plan as PlanId;
          break;
        }
      }

      await supabase
        .from("workspaces")
        .update({ plan_id: newPlanId })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  return Response.json({ received: true });
}
