import { getStripe, getStripePriceMap } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";
import { isValidUUID } from "@/lib/utils";
import { sendConversionEvent } from "@/lib/meta-conversions";
import type { PlanId } from "@/lib/plans";

const VALID_PLAN_IDS = new Set<string>(["free", "basic", "startup", "pro"]);

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const workspaceId = session.metadata?.workspaceId;
      const planId = session.metadata?.planId;

      if (workspaceId && planId && isValidUUID(workspaceId) && VALID_PLAN_IDS.has(planId)) {
        // Only upgrade plan if we have a valid subscription
        const subscriptionId = session.subscription as string | null;
        const customerId = session.customer as string | null;

        if (!subscriptionId) {
          console.error(`[webhook] checkout.session.completed without subscription — workspaceId=${workspaceId}, planId=${planId}`);
          break;
        }

        await supabase
          .from("workspaces")
          .update({
            plan_id: planId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          })
          .eq("id", workspaceId);

        // Meta CAPI — Purchase event
        const email = session.customer_details?.email ?? undefined;
        const amount = session.amount_total ? session.amount_total / 100 : undefined;
        sendConversionEvent({
          eventName: "Purchase",
          email,
          sourceUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://chatpulse-ten.vercel.app"}/pricing`,
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = String(subscription.customer);

      await supabase
        .from("workspaces")
        .update({ plan_id: "free", stripe_subscription_id: null })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customerId = String(subscription.customer);

      // Determine the plan from the subscription's price
      const priceId = subscription.items.data[0]?.price.id;
      let newPlanId: PlanId = "free";

      // Check both monthly and annual price maps
      for (const billing of ["monthly", "annual"] as const) {
        for (const [plan, id] of Object.entries(getStripePriceMap(billing))) {
          if (id === priceId) {
            newPlanId = plan as PlanId;
            break;
          }
        }
        if (newPlanId !== "free") break;
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
