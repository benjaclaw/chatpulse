import Stripe from "stripe";
import type { PlanId } from "./plans";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/** Map plan IDs to Stripe Price IDs — fill in after creating products in Stripe */
export const STRIPE_PRICE_MAP: Record<Exclude<PlanId, "free">, string> = {
  basic: "",
  startup: "",
  pro: "",
};
